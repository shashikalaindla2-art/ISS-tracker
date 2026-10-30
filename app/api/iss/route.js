import { NextResponse } from 'next/server';
import { validateISSPositionPayload } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const PRIMARY_API_URL = 'https://api.wheretheiss.at/v1/satellites/25544';
const REQUEST_TIMEOUT_MS = 6000;

export async function GET() {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  try {
    const response = await fetch(PRIMARY_API_URL, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ISSTracker-EdzulChallenge/1.0'
      },
      cache: 'no-store'
    });

    if (response.status === 429) {
      return NextResponse.json(
        {
          error:
            'Upstream rate limit exceeded (429). Please wait before retrying.'
        },
        {
          status: 429,
          headers: { 'Cache-Control': 'no-store' }
        }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Upstream API error: HTTP ${response.status} ${response.statusText}`
        },
        {
          status: 502,
          headers: { 'Cache-Control': 'no-store' }
        }
      );
    }

    const rawData = await response.json();
    const validation = validateISSPositionPayload(rawData);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Malformed telemetry from upstream API',
          validationErrors: validation.errors
        },
        {
          status: 502,
          headers: { 'Cache-Control': 'no-store' }
        }
      );
    }

    return NextResponse.json(
      {
        ...validation.data,
        isDemo: false,
        proxied: true,
        fetchedAt: Date.now()
      },
      {
        status: 200,
        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0'
        }
      }
    );
  } catch (error) {
    const isTimeout = error?.name === 'AbortError';

    return NextResponse.json(
      {
        error: isTimeout
          ? `ISS telemetry request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds.`
          : 'Unable to retrieve live ISS telemetry.',
        isDemo: false
      },
      {
        status: isTimeout ? 504 : 502,
        headers: { 'Cache-Control': 'no-store' }
      }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
