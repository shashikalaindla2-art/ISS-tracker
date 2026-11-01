/**
 * Server-Side DeepSeek AI API Route
 * Proxies requests to DeepSeek securely, keeping API keys server-side.
 * Supports streaming responses for real-time token output.
 */

import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const DEEPSEEK_API_ENDPOINT = 'https://api.deepseek.com/chat/completions';
const DEFAULT_MODEL = 'deepseek-chat';

export async function POST(request) {
  try {
    const body = await request.json();
    const { messages = [], telemetry = {}, stream = false, ping = false } = body;

    // Resolve API key: client-provided key takes priority so user can override broken env keys
    const clientKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
    const geminiKey =
      (process.env.GEMINI_API_KEY ||
       process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
       '').trim();
    const envKey =
      (process.env.DEEPSEEK_API_KEY ||
       process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY ||
       geminiKey ||
       process.env.GROQ_API_KEY ||
       process.env.OPENAI_API_KEY ||
       process.env.OPENROUTER_API_KEY ||
       '').trim();

    const apiKey = (clientKey || envKey).trim();

    // Auto-detect provider based on key format or environment
    const isGemini =
      apiKey.startsWith('AIza') ||
      (geminiKey && apiKey === geminiKey && !apiKey.startsWith('sk-')) ||
      body.provider === 'Gemini' ||
      body.provider === 'gemini';

    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          error: 'NO_API_KEY',
          message: 'No API key configured.'
        },
        { status: 400 }
      );
    }

    if (isGemini) {
      const ai = new GoogleGenAI({ apiKey });
      const modelName = body.model || 'gemini-flash-lite-latest';

      if (ping) {
        try {
          await ai.models.generateContent({
            model: modelName,
            contents: 'ping',
            config: { maxOutputTokens: 5 }
          });
          return NextResponse.json({ ok: true, provider: 'Google Gemini', model: modelName });
        } catch (pingErr) {
          // If gemini-flash-lite-latest fails ping, try gemini-flash-latest
          try {
            await ai.models.generateContent({
              model: 'gemini-flash-latest',
              contents: 'ping',
              config: { maxOutputTokens: 5 }
            });
            return NextResponse.json({ ok: true, provider: 'Google Gemini', model: 'gemini-flash-latest' });
          } catch (pingErr2) {
            return NextResponse.json(
              {
                ok: false,
                provider: 'Google Gemini',
                error: `Gemini verification failed: ${pingErr2.message || 'Invalid API key or network error'}`
              },
              { status: 400 }
            );
          }
        }
      }

      const systemPrompt = buildSystemPrompt(telemetry);

      // Map conversation messages to Gemini contents structure
      const contents = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || '' }]
      }));

      // Ensure there is at least one message
      if (contents.length === 0) {
        contents.push({ role: 'user', parts: [{ text: 'Telemetry status report' }] });
      }

      if (stream) {
        try {
          const responseStream = await ai.models.generateContentStream({
            model: modelName,
            contents,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.7,
              maxOutputTokens: 1500
            }
          });

          const encoder = new TextEncoder();
          const readable = new ReadableStream({
            async start(controller) {
              try {
                for await (const chunk of responseStream) {
                  const text = chunk.text || '';
                  if (text) {
                    const ssePayload = `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`;
                    controller.enqueue(encoder.encode(ssePayload));
                  }
                }
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
              } catch (err) {
                controller.error(err);
              }
            }
          });

          return new Response(readable, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
              'X-Accel-Buffering': 'no'
            }
          });
        } catch (streamErr) {
          console.error('[Gemini Stream Error]:', streamErr);
          // Fall back to non-streaming call below
        }
      }

      try {
        const geminiRes = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
            maxOutputTokens: 1500
          }
        });

        return NextResponse.json({
          content: geminiRes.text || '',
          model: `Google Gemini (${modelName})`,
          provider: 'Gemini',
          usage: geminiRes.usageMetadata || null
        });
      } catch (geminiErr) {
        // Try fallback to gemini-flash-latest or gemini-3.5-flash if primary model experienced demand spikes
        try {
          const fallbackRes = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.7,
              maxOutputTokens: 1500
            }
          });
          return NextResponse.json({
            content: fallbackRes.text || '',
            model: 'Google Gemini (gemini-flash-latest)',
            provider: 'Gemini',
            usage: fallbackRes.usageMetadata || null
          });
        } catch (innerErr) {
          try {
            const fallbackRes2 = await ai.models.generateContent({
              model: 'gemini-3.5-flash',
              contents,
              config: {
                systemInstruction: systemPrompt,
                temperature: 0.7,
                maxOutputTokens: 1500
              }
            });
            return NextResponse.json({
              content: fallbackRes2.text || '',
              model: 'Google Gemini (gemini-3.5-flash)',
              provider: 'Gemini',
              usage: fallbackRes2.usageMetadata || null
            });
          } catch (innerErr2) {
            console.error('[Gemini Direct Error]:', innerErr2);
            return NextResponse.json(
              {
                error: 'PROVIDER_ERROR',
                provider: 'Gemini',
                message: `Google Gemini API error: ${innerErr2.message || 'Failed to generate response'}`
              },
              { status: 502 }
            );
          }
        }
      }
    }

    // Other providers: Groq, OpenRouter, OpenAI, DeepSeek
    let endpoint = DEEPSEEK_API_ENDPOINT;
    let model = DEFAULT_MODEL;
    let providerName = 'DeepSeek';

    if (apiKey.startsWith('gsk_') || process.env.GROQ_API_KEY === apiKey) {
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      model = 'llama-3.3-70b-versatile';
      providerName = 'Groq';
    } else if (apiKey.startsWith('sk-or-') || process.env.OPENROUTER_API_KEY === apiKey) {
      endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      model = 'deepseek/deepseek-chat';
      providerName = 'OpenRouter';
    } else if (apiKey.startsWith('sk-proj-') || process.env.OPENAI_API_KEY === apiKey) {
      endpoint = 'https://api.openai.com/v1/chat/completions';
      model = 'gpt-4o-mini';
      providerName = 'OpenAI';
    } else {
      endpoint = DEEPSEEK_API_ENDPOINT;
      model = DEFAULT_MODEL;
      providerName = 'DeepSeek';
    }

    // Ping check for test key verification
    if (ping) {
      const pingResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5
        })
      });

      if (!pingResponse.ok) {
        const errText = await pingResponse.text();
        const isBalance = pingResponse.status === 402;
        return NextResponse.json(
          {
            ok: false,
            provider: providerName,
            status: pingResponse.status,
            error: isBalance
              ? `Key is valid, but your ${providerName} account balance is $0.00 (Insufficient Balance). Top up at platform.deepseek.com/top_up or use a free Groq or Google Gemini key.`
              : `Connection failed (${pingResponse.status}): ${errText}`
          },
          { status: pingResponse.status }
        );
      }

      return NextResponse.json({ ok: true, provider: providerName, model });
    }

    // Build system prompt with live telemetry context
    const systemPrompt = buildSystemPrompt(telemetry);

    // Construct full messages array with system context
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content }))
    ];

    const requestBody = {
      model,
      messages: fullMessages,
      temperature: 0.65,
      max_tokens: 1200,
      stream
    };

    const dsResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!dsResponse.ok) {
      const errText = await dsResponse.text();
      const isAuthError = dsResponse.status === 401 || dsResponse.status === 403;
      const isBalanceError = dsResponse.status === 402;
      return NextResponse.json(
        {
          error: isBalanceError ? 'INSUFFICIENT_BALANCE' : (isAuthError ? 'AUTH_FAILED' : 'PROVIDER_ERROR'),
          status: dsResponse.status,
          provider: providerName,
          message: isBalanceError
            ? `Your ${providerName} key is valid, but your account balance is $0.00 (Insufficient Balance). Please top up credits or switch to Google Gemini (free at https://aistudio.google.com).`
            : (isAuthError
                ? `Your ${providerName} API key failed authentication (${dsResponse.status}). Please update your API key in settings.`
                : `${providerName} API error (${dsResponse.status}): ${errText}`),
          details: errText
        },
        { status: dsResponse.status }
      );
    }

    if (stream) {
      const headers = new Headers({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no'
      });
      return new Response(dsResponse.body, { headers });
    }

    const data = await dsResponse.json();
    return NextResponse.json({
      content: data.choices?.[0]?.message?.content || '',
      model: `${providerName} (${data.model || model})`,
      provider: providerName,
      usage: data.usage
    });
  } catch (err) {
    console.error('[AI Route] Error:', err);
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: err.message }, { status: 500 });
  }
}

function buildSystemPrompt(telemetry = {}) {
  const {
    latitude = 0,
    longitude = 0,
    altitude = 420,
    velocity = 27580,
    visibility = 'daylight',
    regionName = 'Earth Orbit',
    footprint = 4500,
    timestamp = null
  } = telemetry;

  const machNumber = (velocity / 1236).toFixed(1);
  const timeStr = timestamp
    ? new Date(timestamp * 1000).toUTCString()
    : new Date().toUTCString();

  return `You are ORBITAL, an advanced AI space intelligence assistant embedded in an ISS real-time tracking dashboard.

LIVE ISS TELEMETRY (as of ${timeStr}):
• Position: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E
• Overflying: ${regionName}
• Altitude: ${Math.round(altitude)} km above Earth's geoid
• Orbital Velocity: ${Math.round(velocity).toLocaleString()} km/h (Mach ${machNumber}, ~7.66 km/s)
• Illumination: ${String(visibility).toUpperCase()}
• Horizon Footprint: ~${Math.round(footprint).toLocaleString()} km diameter
• Crew: 7 astronauts & cosmonauts (Expedition 72)
• Orbital Period: ~92.7 min | 15.54 orbits/day
• Inclination: 51.64° | NORAD #25544

PERSONALITY & STYLE:
- You are precise, scientific, and engaging — like a real Flight Dynamics Officer combined with a brilliant science communicator.
- Format responses using **bold** for key terms, structured numbered lists for complex topics, and concise bullet points.
- Always ground your answers in the live telemetry data above. Reference specific coordinates, altitude, or velocity when relevant.
- Be helpful and conversational for simple questions; deep and technical for complex orbital/physics inquiries.
- Keep responses focused and readable — avoid excessive length. Aim for clarity.
- Never mention that you are an AI language model in your responses. You are ORBITAL, the ISS mission intelligence system.`;
}
