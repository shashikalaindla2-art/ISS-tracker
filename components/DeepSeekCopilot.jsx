'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Bot,
  Send,
  Trash2,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Orbit,
  Radio,
  Zap,
  Users,
  Sun,
  Globe,
  AlertCircle,
  ShieldCheck,
  Key,
  X,
  CheckCircle2
} from 'lucide-react';
import {
  queryDeepSeekAI,
  getStoredApiKey,
  setStoredApiKey,
  testApiKeyConnection
} from '@/lib/deepseekApi';
import { getGeographicRegion } from '@/lib/geocoding';

// Suggested quick-ask prompts with gold and cyan accents
const QUICK_PROMPTS = [
  { icon: Sparkles, label: 'How AI Works', prompt: 'Explain how AI works in a few words' },
  { icon: Orbit, label: 'Live Orbital Telemetry', prompt: 'Give me a live orbital telemetry briefing for the ISS right now.' },
  { icon: Zap, label: 'Orbital Mechanics', prompt: 'Explain the physics of why the ISS maintains orbit without falling.' },
  { icon: Users, label: 'Expedition 72 Crew', prompt: 'Who is on the Expedition 72 crew right now and what science are they performing?' },
  { icon: Radio, label: 'Radio Frequencies', prompt: 'What frequencies does the ISS use for ARISS amateur radio downlinks and packets?' },
  { icon: Sun, label: 'Solar Power System', prompt: 'How do the ISS solar arrays and Li-ion batteries manage orbital eclipse cycles?' },
  { icon: Globe, label: 'Severe Weather Scan', prompt: 'How does the ISS detect cyclones, severe weather storms, and floods from space?' }
];

function detectModelLabel(key) {
  if (!key) return 'Autonomous Onboard AI';
  if (key.startsWith('sk-') && !key.startsWith('sk-proj') && !key.startsWith('sk-or')) return 'DeepSeek Chat (V3)';
  if (key.startsWith('AIza')) return 'Google Gemini';
  if (key.startsWith('gsk_')) return 'Groq LLaMA 3.3';
  if (key.startsWith('sk-proj-')) return 'OpenAI GPT-4o';
  return 'AI Copilot';
}

function processInline(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-200 font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-slate-300 italic">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-black/40 text-cyan-300 px-1.5 py-0.5 rounded text-[11px] font-mono border border-cyan-500/20">$1</code>');
}

// Renders markdown-like formatting in the assistant responses
function FormattedMessage({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let listBuffer = [];
  let inNumberedList = false;

  const flushList = () => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-1.5 my-2.5 pl-2">
          {listBuffer.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-slate-200 text-xs sm:text-sm">
              <span className="text-cyan-400 font-bold shrink-0 mt-0.5">{inNumberedList ? `${i + 1}.` : '▸'}</span>
              <span dangerouslySetInnerHTML={{ __html: processInline(item) }} />
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
      inNumberedList = false;
    }
  };

  lines.forEach((line, i) => {
    const numbered = line.match(/^(\d+)\.\s+(.+)/);
    const bulleted = line.match(/^[-*•]\s+(.+)/);
    const heading = line.match(/^\*\*(.+)\*\*$/);
    const quote = line.match(/^>\s+(.+)/);
    const empty = line.trim() === '';

    if (heading) {
      flushList();
      elements.push(
        <p key={i} className="font-semibold text-cyan-300 mt-3.5 mb-1.5 text-sm sm:text-base tracking-wide flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          {heading[1]}
        </p>
      );
    } else if (quote) {
      flushList();
      elements.push(
        <div key={i} className="my-2.5 p-3 rounded-xl bg-amber-500/10 border-l-4 border-amber-400 text-xs text-amber-200 leading-relaxed">
          <span dangerouslySetInnerHTML={{ __html: processInline(quote[1]) }} />
        </div>
      );
    } else if (numbered) {
      if (!inNumberedList) { flushList(); inNumberedList = true; }
      listBuffer.push(numbered[2]);
    } else if (bulleted) {
      if (inNumberedList) { flushList(); }
      listBuffer.push(bulleted[1]);
    } else if (empty) {
      flushList();
      elements.push(<div key={i} className="h-1.5" />);
    } else if (line.trim()) {
      flushList();
      elements.push(
        <p
          key={i}
          className="text-slate-200 leading-relaxed text-xs sm:text-sm"
          dangerouslySetInnerHTML={{ __html: processInline(line) }}
        />
      );
    }
  });

  flushList();
  return <div className="space-y-1">{elements}</div>;
}

export default function DeepSeekCopilot({ currentPosition }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [apiKey, setApiKey] = useState(() => (typeof window !== 'undefined' ? getStoredApiKey() : ''));
  const [activeModel, setActiveModel] = useState(() => detectModelLabel(typeof window !== 'undefined' ? getStoredApiKey() : ''));

  // Key configuration modal state
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState('');
  const [keyVerifyStatus, setKeyVerifyStatus] = useState(null); // { loading, ok, message }

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const hasAutoGreetedRef = useRef(false);

  const region = useMemo(() => {
    return currentPosition
      ? getGeographicRegion(currentPosition.latitude, currentPosition.longitude)
      : { name: 'Low Earth Orbit' };
  }, [currentPosition]);

  const telemetry = useMemo(() => ({
    latitude: currentPosition?.latitude || 0,
    longitude: currentPosition?.longitude || 0,
    altitude: currentPosition?.altitude || 420,
    velocity: currentPosition?.velocity || 27580,
    visibility: currentPosition?.visibility || 'daylight',
    regionName: region.name,
    footprint: currentPosition?.footprint || 4500,
    timestamp: currentPosition?.timestamp || 0
  }), [currentPosition, region.name]);

  // Initial welcome greeting
  useEffect(() => {
    if (!hasAutoGreetedRef.current && currentPosition) {
      hasAutoGreetedRef.current = true;
      const modelLabel = detectModelLabel(apiKey);
      const timer = setTimeout(() => {
        setMessages([
          {
            role: 'assistant',
            id: 'welcome',
            model: modelLabel,
            content: `**ORBITAL AI CHATBOT ONLINE**

Ground tracking verified. Cruising at **${Math.round(currentPosition.velocity || 27580).toLocaleString()} km/h** (~Mach ${((currentPosition.velocity || 27580) / 1236).toFixed(1)}) at **${Math.round(currentPosition.altitude || 420)} km** altitude over **${region.name}**.

I am your real-time **AI Chatbot**, powered by **DeepSeek AI** and orbital telemetry intelligence. Ask me anything — from live ISS orbital dynamics, upcoming ground passes, and Expedition 72 crew experiments, to weather forecasts, natural disaster tracking, astronomy, mathematics, and general science.`
          }
        ]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentPosition, region.name, apiKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = useCallback(
    async (textToSend) => {
      const query = (textToSend || input).trim();
      if (!query || isLoading) return;

      const userMessage = {
        role: 'user',
        content: query,
        id: Date.now()
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setError(null);

      const historyForApi = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content
      }));

      try {
        const result = await queryDeepSeekAI(historyForApi, telemetry, {
          apiKey,
          stream: false
        });

        if (result?.model) {
          setActiveModel(result.model);
        }

        const assistantMessage = {
          role: 'assistant',
          content: result.content,
          model: result.model || activeModel,
          id: Date.now() + 1
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setError(err.message || 'Error communicating with AI Copilot.');
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [input, messages, isLoading, telemetry, apiKey, activeModel]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleCopy = (id, content) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    hasAutoGreetedRef.current = false;
  };

  const handleOpenKeyModal = () => {
    setTempKeyInput(apiKey);
    setKeyVerifyStatus(null);
    setShowKeyModal(true);
  };

  const handleSaveApiKey = async () => {
    const trimmed = tempKeyInput.trim();
    setKeyVerifyStatus({ loading: true, message: 'Verifying API connection…' });
    const res = await testApiKeyConnection(trimmed);
    if (res.ok) {
      setStoredApiKey(trimmed);
      setApiKey(trimmed);
      setActiveModel(detectModelLabel(trimmed));
      setKeyVerifyStatus({
        loading: false,
        ok: true,
        message: `Verified successfully with ${res.provider} (${res.model})!`
      });
      setTimeout(() => {
        setShowKeyModal(false);
        setKeyVerifyStatus(null);
      }, 1200);
    } else {
      setKeyVerifyStatus({
        loading: false,
        ok: false,
        message: res.error || 'Connection verification failed.'
      });
    }
  };

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-col h-full rounded-2xl glass-panel-blue border border-cyan-400/40 overflow-hidden shadow-2xl relative">
      {/* ── Cyan Corner Accent Brackets ── */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none z-20" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none z-20" />

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/20 bg-black/50 backdrop-blur-2xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.5)] border border-cyan-200/40">
              <Bot className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-300 border-2 border-slate-950 shadow-[0_0_8px_#38bdf8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight font-display">
                ORBITAL <span className="text-blue-gradient font-bold">AI CHATBOT</span>
              </h3>
              <span className="hidden sm:inline-block text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 font-mono font-medium">
                ● {activeModel.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono font-normal">
              DeepSeek AI Intelligence · Multi-Domain Q&A Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Overflight region pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full badge-blue text-[10px] font-mono font-medium">
            <Globe className="w-3 h-3 text-cyan-400" />
            {region.name}
          </div>

          {/* Key configuration button */}
          <button
            type="button"
            onClick={handleOpenKeyModal}
            title="Configure DeepSeek API Key"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-cyan-500/30 hover:border-cyan-400 bg-cyan-950/40 text-cyan-300 hover:text-white transition-all text-[11px] font-mono cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">{apiKey ? 'DeepSeek Active' : 'API Key'}</span>
          </button>

          {/* Clear chat */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              title="Clear conversation"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/8 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── API Key Configuration Modal ── */}
      {showKeyModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-cyan-400/50 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                  DeepSeek AI Configuration
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your DeepSeek API key (or Google Gemini/Groq/OpenAI key). Keys are stored locally in your browser.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider">
                API Key
              </label>
              <input
                type="password"
                value={tempKeyInput}
                onChange={(e) => setTempKeyInput(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-black/60 border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <p className="text-[10px] text-slate-400 font-mono">
                Active Key: {apiKey ? `${apiKey.slice(0, 6)}••••${apiKey.slice(-4)}` : 'None (Using Autonomous Onboard Engine)'}
              </p>
            </div>

            {keyVerifyStatus && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  keyVerifyStatus.loading
                    ? 'bg-cyan-950/40 border border-cyan-400/30 text-cyan-200'
                    : keyVerifyStatus.ok
                    ? 'bg-emerald-950/40 border border-emerald-400/40 text-emerald-200'
                    : 'bg-rose-950/40 border border-rose-400/40 text-rose-200'
                }`}
              >
                {keyVerifyStatus.loading ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0 text-cyan-400" />
                ) : keyVerifyStatus.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{keyVerifyStatus.message}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setStoredApiKey('');
                  setApiKey('');
                  setActiveModel(detectModelLabel(''));
                  setShowKeyModal(false);
                }}
                className="px-3 py-1.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Clear Key
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                disabled={keyVerifyStatus?.loading}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(56,189,248,0.4)] disabled:opacity-50 cursor-pointer"
              >
                {keyVerifyStatus?.loading ? 'Verifying…' : 'Save & Verify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Message Feed ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4 min-h-0 scrollbar-thin">
        {/* Empty state — quick prompt grid */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/25 via-sky-400/20 to-blue-500/25 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_25px_rgba(56,189,248,0.3)]">
                <Sparkles className="w-8 h-8 text-cyan-300 animate-pulse" />
              </div>
              <h4 className="text-lg font-semibold text-white font-display">Ask AI Chatbot Anything</h4>
              <p className="text-xs text-slate-300 max-w-sm font-normal">
                Equipped with DeepSeek AI, live ISS telemetry, orbital physics, severe weather tracking, and general science intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 w-full max-w-2xl">
              {QUICK_PROMPTS.map((p, i) => {
                const Icon = p.icon;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => sendMessage(p.prompt)}
                    className="flex items-center gap-3 p-3.5 rounded-2xl glass-panel hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(56,189,248,0.2)] text-left transition-all group cursor-pointer hover:-translate-y-0.5"
                  >
                    <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-200 leading-tight">
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Conversation messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_15px_rgba(56,189,248,0.4)] border border-cyan-300/40">
                <Bot className="w-4 h-4 text-slate-950 font-bold" />
              </div>
            )}

            {/* Bubble */}
            <div className={`group relative max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div
                className={`px-4 sm:px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-cyan-500/30 via-sky-500/25 to-blue-600/30 border border-cyan-400/50 text-white rounded-tr-sm shadow-[0_4px_20px_rgba(56,189,248,0.25)]'
                    : 'glass-panel-silver rounded-tl-sm text-slate-100 shadow-[0_6px_24px_rgba(0,0,0,0.5)] border border-white/15'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <FormattedMessage content={msg.content} />
                ) : (
                  <span className="font-medium text-white">{msg.content}</span>
                )}
              </div>

              {/* Bottom tag & copy button */}
              <div className="flex items-center gap-2 px-1 text-[10px] text-slate-400 font-mono">
                {msg.model && (
                  <span className="text-cyan-300/80 font-semibold">{msg.model}</span>
                )}
                {msg.role === 'assistant' && (
                  <button
                    type="button"
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-opacity cursor-pointer"
                  >
                    {copiedId === msg.id ? (
                      <><Check className="w-3 h-3 text-emerald-400" /> Copied</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copy</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading state */}
        {isLoading && (
          <div className="flex gap-3 flex-row">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_15px_rgba(56,189,248,0.4)]">
              <Bot className="w-4 h-4 text-slate-950 font-bold" />
            </div>
            <div className="max-w-[85%] px-5 py-3.5 rounded-2xl rounded-tl-sm glass-panel-silver flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span className="text-xs font-mono text-cyan-200">
                ORBITAL Intelligence is synthesizing response…
              </span>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <div className="space-y-1">
              <span className="font-bold">Notice:</span>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Prompts Row (when chat is active) ── */}
      {messages.length > 0 && !isLoading && (
        <div className="px-4 pb-2.5 flex gap-2 overflow-x-auto scrollbar-thin shrink-0">
          {QUICK_PROMPTS.slice(0, 4).map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => sendMessage(p.prompt)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel hover:border-cyan-400/40 text-[11px] font-medium text-slate-300 hover:text-cyan-200 transition-all cursor-pointer"
            >
              <p.icon className="w-3 h-3 text-cyan-400" />
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Input Bar ── */}
      <div className="px-4 py-4 border-t border-cyan-500/20 bg-black/55 backdrop-blur-2xl shrink-0">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              id="orbital-chat-input"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask anything — orbit physics, weather, math calculations, science, space facts…"
              rows={1}
              disabled={isLoading}
              className="w-full resize-none bg-black/50 border border-cyan-500/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none transition-all disabled:opacity-50 pr-10 shadow-inner font-sans"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(56,189,248,0.5)] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-slate-950 animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-slate-950 font-bold" />
            )}
          </button>
        </form>
        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
          <span>Press Enter to send · Shift+Enter for newline</span>
          <span className="flex items-center gap-1 text-cyan-300 font-mono">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            {apiKey ? 'DeepSeek Key Active' : 'Autonomous Engine Active'}
          </span>
        </div>
      </div>
    </div>
  );
}
