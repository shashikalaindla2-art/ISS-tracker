
import { validateISSPositionPayload } from './validation.js';
import { getSampleISSData } from './sampleData.js';
import { getAssetPath } from './basePath.js';

const PRIMARY_API_ENDPOINT = 'https://api.wheretheiss.at/v1/satellites/25544';
const PROXY_FALLBACK_ENDPOINT = getAssetPath('/api/iss');
const REQUEST_TIMEOUT_MS = 6000;

/**
 * Custom Error Class for ISS API failures
 */
export class ISSApiError extends Error {
  constructor(message, status = null, isRateLimit = false, validationErrors = null) {
    super(message);
    this.name = 'ISSApiError';
    this.status = status;
    this.isRateLimit = isRateLimit;
    this.validationErrors = validationErrors;
  }
}

/**
 * Fetches real ISS telemetry data with fallback to same-origin proxy.
 *
 * @param {object} [options]
 * @param {AbortSignal} [options.signal]
 * @param {boolean} [options.forceSimulation]
 * @returns {Promise<object>}
 */
export async function fetchISSPosition(options = {}) {
  const { signal: externalSignal, forceSimulation = false } = options;

  if (forceSimulation) {
    return getSampleISSData();
  }

  // 1. Try direct fetch to primary ISS API
  try {
    const data = await attemptFetch(PRIMARY_API_ENDPOINT, externalSignal);

    return {
      ...data,
      isDemo: false,
      source: 'live-direct',
      fetchedAt: Date.now()
    };
  } catch (directError) {
    // Re-throw intentional external cancellation
    if (directError.name === 'AbortError' && externalSignal?.aborted) {
      throw directError;
    }

    // Do not retry through the proxy when rate limited
    if (directError.isRateLimit || directError.status === 429) {
      throw directError;
    }

    // 2. Try same-origin proxy fallback
    try {
      const fallbackData = await attemptFetch(
        PROXY_FALLBACK_ENDPOINT,
        externalSignal
      );

      return {
        ...fallbackData,
        isDemo: false,
        source: 'live-proxy',
        fetchedAt: Date.now()
      };
    } catch (fallbackError) {
      if (fallbackError.name === 'AbortError' && externalSignal?.aborted) {
        throw fallbackError;
      }

      const message =
        directError.message ||
        fallbackError.message ||
        'Unable to connect to ISS telemetry services.';

      throw new ISSApiError(
        message,
        directError.status || fallbackError.status,
        directError.isRateLimit || fallbackError.isRateLimit,
        directError.validationErrors || fallbackError.validationErrors
      );
    }
  }
}

/**
 * Internal helper to perform a timed HTTP fetch and validation.
 *
 * @param {string} url
 * @param {AbortSignal} [externalSignal]
 * @returns {Promise<object>}
 */
async function attemptFetch(url, externalSignal) {
  const controller = new AbortController();

  const timeoutId = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  // Link external abort signal
  const abortExternal = () => controller.abort();

  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timeoutId);
      throw new DOMException('Aborted by caller', 'AbortError');
    }

    externalSignal.addEventListener('abort', abortExternal, {
      once: true
    });
  }

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json'
      },
      cache: 'no-store'
    });

    if (res.status === 429) {
      throw new ISSApiError(
        'Rate limit exceeded: The ISS API allows ~1 request per second.',
        429,
        true
      );
    }

    if (!res.ok) {
      throw new ISSApiError(
        `HTTP error ${res.status}: ${res.statusText}`,
        res.status
      );
    }

    let json;

    try {
      json = await res.json();
    } catch {
      throw new ISSApiError(
        'Invalid JSON received from telemetry endpoint.'
      );
    }

    // Validate payload
    const validation = validateISSPositionPayload(json);

    if (!validation.isValid) {
      throw new ISSApiError(
        `Payload validation failed: ${validation.errors.join('; ')}`,
        null,
        false,
        validation.errors
      );
    }

    return validation.data;

  } catch (err) {
    if (err.name === 'AbortError') {
      if (externalSignal?.aborted) {
        throw err;
      }

      throw new ISSApiError(
        `Request to ${url} timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds.`
      );
    }

    if (err instanceof ISSApiError) {
      throw err;
    }

    throw new ISSApiError(
      err.message ||
      'Network error occurred while contacting ISS telemetry server.'
    );

  } finally {
    clearTimeout(timeoutId);

    // Remove external abort listener after request completes
    externalSignal?.removeEventListener('abort', abortExternal);
  }
}
