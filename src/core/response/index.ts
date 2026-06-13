import http from 'http';

export class Response {
  constructor(private res: http.ServerResponse) {}

  status(code: number): this {
    this.validationStatusCode(code);
    this.res.statusCode = code;
    return this;
  }

  setHeader(name: string, value: string): this {
    this.res.setHeader(name, value);
    return this;
  }

  json(data: any): void {
    this.setHeader('Content-Type', 'application/json');
    this.res.end(JSON.stringify(data));
  }

  send(text: string): void {
    this.setHeader('Content-Type', 'text/plain');
    this.res.end(text);
  }

  end(): void {
    this.res.end();
  }

private validationStatusCode(code: number){
    // Check if the status code is outside of NodeJS's valid range
    if (code < 100 || code > 999) {
        throw new RangeError(`Invalid status code: ${JSON.stringify(code)}. Status code must be greater than 99 and less than 1000.`);
    }
}
}