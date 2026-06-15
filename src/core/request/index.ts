import http from 'http';

export class Request {
  public params: Record<string, string> = {};
  public query: Record<string, string> = {};
  public body: any = null;
  private _rawBody: Buffer | null = null;
  constructor(private req: http.IncomingMessage) { }

  get method(): string | undefined {
    return this.req.method;
  }

  get url(): string | undefined {
    return this.req.url;
  }

  get headers(): http.IncomingHttpHeaders {
    return this.req.headers;
  }

  get rawBody(): Buffer | null {
    return this._rawBody;
  }

  set rawBody(value: Buffer | null) {
    this._rawBody = value;
  }

  on(event: string, listener: (...args: any[]) => void) {
    this.req.on(event, listener);
  }
}