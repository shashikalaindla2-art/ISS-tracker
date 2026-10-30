import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  buildTelemetryPrompt,
  queryDeepSeekAI,
  getStoredApiKey,
  setStoredApiKey
} from '../lib/deepseekApi.js';

describe('DeepSeek AI Orbital Copilot Engine', () => {
  const mockTelemetry = {
    latitude: 51.5,
    longitude: -0.12,
    altitude: 418.5,
    velocity: 27585,
    visibility: 'daylight',
    regionName: 'European Territory'
  };

  test('builds telemetry prompt with accurate orbital parameters', () => {
    const { systemPrompt, userQuery } = buildTelemetryPrompt(mockTelemetry, 'Analyze orbital drag');
    assert.ok(systemPrompt.includes('DeepSeek Orbital Copilot'));
    assert.ok(systemPrompt.includes('51.5000° Lat'));
    assert.ok(systemPrompt.includes('-0.1200° Lon'));
    assert.ok(systemPrompt.includes('419 km'));
    assert.ok(systemPrompt.includes('European Territory'));
    assert.ok(systemPrompt.includes('DAYLIGHT'));
    assert.strictEqual(userQuery, 'Analyze orbital drag');
  });

  test('generates dynamic orbital flight briefing when no API key provided', async () => {
    const result = await queryDeepSeekAI(mockTelemetry, 'Generate an immediate orbital situation report', '');
    assert.ok(result, 'Result should be returned');
    assert.strictEqual(typeof result.content, 'string');
    assert.ok(result.content.includes('DEEPSEEK ORBITAL SITUATIONAL REPORT'));
    assert.ok(result.content.includes('European Territory'));
    assert.ok(result.model.includes('deepseek-chat'));
    assert.strictEqual(result.source, 'deepseek-engine-telemetry');
  });

  test('handles specialized orbital physics inquiries correctly', async () => {
    const result = await queryDeepSeekAI(mockTelemetry, 'Why does the ISS not fall to Earth? Gravity question', '');
    assert.ok(result.content.includes('DEEPSEEK FLIGHT MECHANICS ANALYSIS'));
    assert.ok(result.content.includes('CENTRIPETAL FORCE'));
    assert.ok(result.content.includes('8.7 m/s²'));
  });

  test('handles Expedition 72 crew inquiries correctly', async () => {
    const result = await queryDeepSeekAI(mockTelemetry, 'What science experiments are the crew running?', '');
    assert.ok(result.content.includes('EXPEDITION 72 CREW OPERATIONS BRIEFING'));
    assert.ok(result.content.includes('Sunita Williams'));
  });

  test('handles ARISS HAM radio Doppler inquiries correctly', async () => {
    const result = await queryDeepSeekAI(mockTelemetry, 'What is the HAM radio frequency and doppler shift?', '');
    assert.ok(result.content.includes('ARISS RADIO TELEMETRY BRIEFING'));
    assert.ok(result.content.includes('145.800 MHz'));
  });

  test('evaluates mathematical calculations dynamically', async () => {
    const result = await queryDeepSeekAI(mockTelemetry, 'What is 15 * 24?', '');
    assert.ok(result.content.includes('ORBITAL COMPUTATIONAL ENGINE'));
    assert.ok(result.content.includes('360'));
  });

  test('answers severe weather and disaster monitoring inquiries', async () => {
    const result = await queryDeepSeekAI(mockTelemetry, 'How does the ISS predict cyclones, hurricanes and floods?', '');
    assert.ok(result.content.includes('EARTH OBSERVATION & DISASTER'));
    assert.ok(result.content.includes('Severe Storm & Cyclone Tracking'));
  });

  test('answers general questions dynamically without dumping static telemetry', async () => {
    const result = await queryDeepSeekAI(mockTelemetry, 'Why is the sky blue from Earth?', '');
    assert.ok(result.content.includes('Rayleigh Scattering'));
    assert.ok(!result.content.includes('DEEPSEEK ORBITAL SITUATIONAL REPORT'));
  });

  test('answers how AI works dynamically and concisely', async () => {
    const result = await queryDeepSeekAI(mockTelemetry, 'Explain how AI works in a few words', '');
    assert.ok(result.content.includes('ARTIFICIAL INTELLIGENCE') || result.content.includes('learns from examples'));
    assert.ok(!result.content.includes('DEEPSEEK ORBITAL SITUATIONAL REPORT'));
  });

  test('manages browser local storage API key safely in Node test env', () => {
    // Should not throw in Node.js where window is undefined
    const key = getStoredApiKey();
    assert.strictEqual(typeof key, 'string');
    assert.doesNotThrow(() => setStoredApiKey('AIzaSyTestKey123'));
    assert.doesNotThrow(() => setStoredApiKey(''));
  });
});

