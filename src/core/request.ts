import http from 'http';

// Standard HTTP methods
export type METHODS = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class Request {
  // URL path parameters (e.g., /users/:id => req.params.id)
  public params: Record<string, string> = {};
  // URL query string parameters (e.g., ?key=value => req.query.key)
  public query: Record<string, string> = {};
  // Parsed request body (available after body parsing middleware)
  public body: any = null;
  // Raw buffer of the request body (stores the original unparsed data)
  private _rawBody: Buffer | null = null;

  /**
 * Constructor stores the original Node.js IncomingMessage object
 * @param req - Node.js HTTP IncomingMessage object
 */
  constructor(private req: http.IncomingMessage) { }

  /**
   * Get the HTTP method of the request (GET, POST, etc.)
   * Returns undefined if no method is set
   */
  get method(): string | undefined {
    return this.req.method as METHODS;
  }

  /**
    * Get the full URL string of the request
    */
  get url(): string | undefined {
    return this.req.url;
  }

  /**
    * Get all HTTP headers from the request
    * Returns the headers object from Node.js IncomingMessage
    */
  get headers(): http.IncomingHttpHeaders {
    return this.req.headers;
  }

  /**
  * Get the raw request body as a Buffer
  * Returns null if no body has been read yet
  */
  get rawBody(): Buffer | null {
    return this._rawBody;
  }

  set rawBody(value: Buffer | null) {
    this._rawBody = value;
  }

  /**
     * Proxy event listener registration to the underlying IncomingMessage
     * Allows listening to events like 'data', 'end', 'error' on the request stream
     * @param event - Event name (e.g., 'data', 'end')
     * @param listener - Event handler function
     */
  on(event: string, listener: (...args: any[]) => void) {
    this.req.on(event, listener);
  }
}