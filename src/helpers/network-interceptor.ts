/**
 * Network Interceptor
 *
 * Intercepts fetch requests to log network activity for the debug console.
 * Captures request/response details including timing, status, and size.
 */

interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  status: "pending" | "success" | "error";
  statusCode?: number;
  timing: number;
  size: number;
  error?: string;
}

let requestCounter = 0;

function generateRequestId(): string {
  return `req_${Date.now()}_${++requestCounter}`;
}

function sendNetworkEvent(request: NetworkRequest): void {
  if (window.debugAPI) {
    const statusDisplay = request.statusCode || (request.status === "pending" ? "..." : "ERR");
    const message = `${request.method} ${request.url} [${statusDisplay}] ${request.timing}ms`;
    window.debugAPI.network(message, request);
  }
}

/**
 * Install the network interceptor
 * Should be called once at app startup
 */
export function installNetworkInterceptor(): void {
  // Prevent double installation
  if ((window as unknown as { __networkInterceptorInstalled?: boolean }).__networkInterceptorInstalled) {
    return;
  }

  const originalFetch = window.fetch;

  window.fetch = async function (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const requestId = generateRequestId();
    const startTime = performance.now();

    // Determine URL string
    let url: string;
    if (typeof input === "string") {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else {
      url = input.url;
    }

    const method = (init?.method || "GET").toUpperCase();

    const request: NetworkRequest = {
      id: requestId,
      method,
      url,
      status: "pending",
      timing: 0,
      size: 0,
    };

    // Log request start
    sendNetworkEvent(request);

    try {
      const response = await originalFetch.call(window, input, init);
      const endTime = performance.now();

      request.status = response.ok ? "success" : "error";
      request.statusCode = response.status;
      request.timing = Math.round(endTime - startTime);

      // Try to get response size
      try {
        const blob = await response.clone().blob();
        request.size = blob.size;
      } catch {
        // Ignore size errors
      }

      // Log request complete
      sendNetworkEvent(request);

      return response;
    } catch (error) {
      const endTime = performance.now();

      request.status = "error";
      request.timing = Math.round(endTime - startTime);
      request.error = error instanceof Error ? error.message : String(error);

      // Log request error
      sendNetworkEvent(request);

      throw error;
    }
  };

  (window as unknown as { __networkInterceptorInstalled: boolean }).__networkInterceptorInstalled = true;
}
