type RequestHandler<T extends []> = (...params: T) => unknown;
type RequestHandlers = Map<string, RequestHandler<any>>;
type PendingRequests = Map<number, {
  resolve: (result: unknown) => void;
  reject: (error: unknown) => void;
}>;

type Request = {
  jsonrpc: "2.0";
  method: string;
  params: unknown[];
  id: number;
};

/**
 * This class implements a very primitive and naive JSON-RPC 2.0 connection for communicating with Flow Launcher.
 * It is meant only for internal use and may change at any time. It is not recommended to use this class directly.
 * @internal
 */
export class JsonRpcConnection {
  private requests: RequestHandlers = new Map();
  private buffer: string = "";
  private id: number = 0;
  private pendingRequests: PendingRequests = new Map();

  constructor() {
    process.stdin.resume();

    process.stdin.setEncoding("utf8");

    process.stdin.on("data", chunk => {
      this.buffer += chunk;
      this.processIncomingData();
    });
  }

  /**
   * Processes raw incoming data from Flow Launcher and parses it into JSON-RPC 2.0 messages.
   * @private
   */
  private processIncomingData(): void {
    while (true) {
      const headerMatch = this.buffer.match(/Content-Length: (\d+)\r\n\r\n/);
      if (!headerMatch) return;

      const contentLength = parseInt(headerMatch[1], 10);
      const headerEndIndex = headerMatch.index! + headerMatch[0].length;
      const messageBody = this.buffer.slice(headerEndIndex);

      if (messageBody.length < contentLength) return;

      const body = messageBody.slice(0, contentLength);
      this.buffer = this.buffer.slice(headerEndIndex + contentLength);

      try {
        const jsonRpcMessage = JSON.parse(body);
        if (jsonRpcMessage.id !== undefined && this.pendingRequests.has(jsonRpcMessage.id) && !("method" in jsonRpcMessage)) {
          const {resolve, reject} = this.pendingRequests.get(jsonRpcMessage.id)!;
          this.pendingRequests.delete(jsonRpcMessage.id);

          if (jsonRpcMessage.error) {
            reject(new Error(jsonRpcMessage.error.message));
          } else {
            resolve(jsonRpcMessage.result);
          }
        } else {
          this.handleRequest(jsonRpcMessage);
        }
      } catch (error) {
      }

      if (!this.buffer.includes("Content-Length:")) break;
    }
  }

  /**
   * Determines how to handle requests: if it needs a response, if an error needs to be sent, etc.
   * Then performs the appropriate action.
   * @param request
   * @private
   */
  private async handleRequest(request: Request): Promise<void> {
    if (request.method && this.requests.has(request.method)) {
      const handler = this.requests.get(request.method)!;
      if (request.id !== undefined) {
        try {
          const result = await handler(request.params?.[0]);
          this.sendResponse(request.id, result);
        } catch (e) {
          if (e instanceof Error) {
            this.sendError(request.id, e);
          }
        }
      } else {
        handler(request.params?.[0]);
      }
    } else {
      if (request.id !== undefined) {
        this.sendResponse(request.id, null);
      }
    }
  }

  /**
   * Registers a request handler for a specific method.
   * @param method
   * @param handler
   */
  onRequest(method: string, handler: RequestHandler<any>): void {
    this.requests.set(method, handler);
  }

  /**
   * Sends a response to a request.
   * @param id
   * @param result
   */
  sendResponse(id: number, result: unknown): void {
    const response = JSON.stringify({
      jsonrpc: "2.0",
      id: id,
      result: result,
    });
    this.writeMessage(response);
  }

  /**
   * Sends an error response to a request.
   * @param id
   * @param error
   */
  sendError(id: number, error: Error): void {
    const response = JSON.stringify({
      jsonrpc: "2.0",
      id: id,
      error: {code: -32603, message: error.message},
    });
    this.writeMessage(response);
  }

  /**
   * Formats a message in JSON-RPC 2 format then writes it to stdout.
   * @param message
   * @private
   */
  private writeMessage(message: string): void {
    const contentLength = Buffer.byteLength(message, "utf8");
    const header = `Content-Length: ${contentLength}\r\n\r\n`;
    process.stdout.write(header + message);
  }

  /**
   * Sends a request to Flow Launcher.
   * @param method
   * @param params
   * @returns {Promise<any>} A promise that resolves when Flow Launcher responds.
   *                         May contain the method call result or an error (if the Promise gets rejected).
   */
  sendRequest(method: string, params: unknown[] | IArguments = []): Promise<any> {
    const requestId = this.id++;

    const requestPayload = JSON.stringify({
      jsonrpc: "2.0",
      method: method,
      id: requestId,
      params: [...params],
    });

    this.writeMessage(requestPayload);

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(requestId, {resolve, reject});
    });
  }
}
