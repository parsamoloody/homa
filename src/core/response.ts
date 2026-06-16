import http from 'http';

export class Response {
  /**
   * Constructor stores the original Node.js ServerResponse object
   * @param res - Node.js HTTP ServerResponse object (http.ServerResponse)
   */
  constructor(private res: http.ServerResponse) {}

  /**
   * Set the HTTP status code for the response
   * Supports method chaining for a fluent interface
   * @param code - HTTP status code (100-999)
   * @returns this instance for chaining
   * @throws RangeError if status code is outside valid range
   */
  status(code: number): this {
    this.validationStatusCode(code);
    this.res.statusCode = code;
    return this;
  }

  /**
   * Set a single HTTP header on the response
   * Supports method chaining for a fluent interface
   * @param name - Header name (e.g., 'Content-Type')
   * @param value - Header value (e.g., 'application/json')
   * @returns this instance for chaining
   */
  setHeader(name: string, value: string): this {
    this.res.setHeader(name, value);
    return this;
  }

  /**
   * Send a JSON response
   * Automatically sets Content-Type header to 'application/json'
   * Serializes the data to JSON string and ends the response
   * @param data - Data to be serialized as JSON
   */
  json(data: any): void {
    this.setHeader('Content-Type', 'application/json');
    this.res.end(JSON.stringify(data));
  }

  /**
   * Send a plain text response
   * Automatically sets Content-Type header to 'text/plain'
   * @param text - Text string to send as response body
   */
  send(text: string): void {
    this.setHeader('Content-Type', 'text/plain');
    this.res.end(text);
  }

  /**
   * End the response without sending a body
   * Useful for 204 No Content or after setting headers only
   */
  end(): void {
    this.res.end();
  }

  /**
   * Private helper method to validate HTTP status codes
   * Ensures the status code is within the valid range (100-999)
   * @param code - Status code to validate
   * @throws RangeError if status code is invalid
   */
  private validationStatusCode(code: number) {
    // Check if the status code is outside of NodeJS's valid range
    if (code < 100 || code > 999) {
      throw new RangeError(`Invalid status code: ${JSON.stringify(code)}. Status code must be greater than 99 and less than 1000.`);
    }
  }
}