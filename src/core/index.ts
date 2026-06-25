// src/core/homa.ts
import http from 'node:http';
import { Request } from '@core/request';
import { Response } from '@core/response';
import { Middleware, Router } from '@core/router';

export class HomaApp {
  private router: Router;
  private _middlewares: Middleware[] = [];

  /**
* Set the global prefix applied to all registered routes
* Accepts a single string or an array of path segments, joined with '/'
* Leading and trailing slashes are stripped to prevent double slashes when concatenated with route paths
* @param prefix - Prefix as a string (e.g. 'api') or array of segments (e.g. ['api', 'v1'])
*/
  setGlobalPrefix!: Router['setGlobalPrefix'];
  get!: Router['get'];
  post!: Router['post'];
  put!: Router['put'];
  patch!: Router['patch'];
  delete!: Router['delete'];

  constructor() {
    this.router = new Router();

    for (const method of Router.publicMethods) {
      (this as any)[method] = (this.router[method] as Function).bind(this.router);
    }
  }

  /**
   * Register a middleware function that will be executed for every request
   * Middleware can modify request/response objects or end the response early
   * @param middleware - Function that receives req, res, and next callback
   */
  use(middleware: (req: Request, res: Response, next: () => void) => void) {
    this._middlewares.push(middleware);
  }

  /**
   * Get the router instance
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Start the HTTP server on the specified port
   * Creates a server instance, processes every request through middleware chain,
   * then routes to the appropriate handler
   * @param port - Port number to listen on
   * @param callback - Optional callback executed when server starts listening
   */
  listen(port: number, callback?: () => void) {
    const server = http.createServer(async (req, res) => {
      const request = new Request(req);
      const response = new Response(res);
      await this.router.runMiddlewares(request, response, this._middlewares, () => {
        this.router.handle(request, response);
      });
    });

    server.listen(port, callback);
  }
}