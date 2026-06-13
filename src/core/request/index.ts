import http, { IncomingMessageEventMap } from 'http';
import url from 'url';

export class Request {
  public params: Record<string, string> = {};
  public query: Record<string, string> = {};
  public body: any = null;

  constructor(private req: http.IncomingMessage) {
    this.parseQuery();
  }

  get method(): string | undefined {
    return this.req.method;
  }

  get url(): string | undefined {
    return this.req.url;
  }

  get headers(): http.IncomingHttpHeaders {
    return this.req.headers;
  }

  on(event: string, listener: (...args: any[]) => void) {
    this.req.on(event, listener);
  }
  private parseQuery() {
    if (this.req.url) {
      const parsed = url.parse(this.req.url, true);
      this.query = parsed.query as Record<string, string>;
    }
  }

  async parseBody(): Promise<void> {
    return new Promise((resolve, reject) => {
      let body = '';
      this.req.on('data', chunk => {
        body += chunk.toString();
      });
      this.req.on('end', () => {
        try {
          this.body = body;
          resolve();
        } catch (e) {
          this.body = {};
          resolve();
        }
      });
      this.req.on('error', reject);
    });
  }
}