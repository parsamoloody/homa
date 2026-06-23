// src/core/homa.ts
import http from 'node:http';
import { Request } from '@core/request';
import { Response } from '@core/response';
import { Middleware, Router } from '@core/router';

export class HomaApp {
  private router: Router;
  private _middlewares: Middleware[] = [];

  // Delegated Router methods
  setGlobalPrefix!: Router['setGlobalPrefix'];
  get!: Router['get'];
  post!: Router['post'];
  put!: Router['put'];
  patch!: Router['patch'];
  delete!: Router['delete'];

  constructor() {
    this.router = new Router();

    // Delegate all Router methods to HomaApp
    for (const method of Router.publicMethods) {
      (this as any)[method] = (this.router[method] as Function).bind(this.router);
    }
  }

  /**
   * Register a middleware function that will be executed for every request
   */
  use(middleware: (req: Request, res: Response, next: () => void) => void) {
    this._middlewares.push(middleware);
  }

  /**
   * Get the router instance for advanced usage
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Start the HTTP server on the specified port
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