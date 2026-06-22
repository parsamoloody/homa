import http from 'node:http';
import { Request } from '@core/request';
import { Response } from '@core/response';
import { Router } from '@core/router';

export class HomaApp {
  private router: Router;
  private _middlewares: Middleware[] = [];

  /**sets the global prefix applied to all routes */
  setGlobalPrefix!: Router['setGlobalPrefix'];

  /**
   * Constructor initializes a new Router instance
   */
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
   * Register a GET route handler
   * @param path - URL path pattern (supports :params)
   * @param handler - Function to handle matching GET requests
   */
  get(path: string, handler: (req: Request, res: Response) => void) {
    this.router.addRoute('GET', path, handler);
  }

  /**
   * Register a POST route handler
   * @param path - URL path pattern (supports :params)
   * @param handler - Function to handle matching POST requests
   */
  post(path: string, handler: (req: Request, res: Response) => void) {
    this.router.addRoute('POST', path, handler);
  }

  /**
   * Register a PUT route handler
   * @param path - URL path pattern (supports :params)
   * @param handler - Function to handle matching PUT requests
   */
  put(path: string, handler: (req: Request, res: Response) => void) {
    this.router.addRoute('PUT', path, handler);
  }

  /**
   * Register a PATCH route handler
   * Note: Method name is 'path' which is a typo (should be 'patch')
   * @param path - URL path pattern (supports :params)
   * @param handler - Function to handle matching PATCH requests
   */
  path(path: string, handler: (req: Request, res: Response) => void) {
    this.router.addRoute('PATCH', path, handler);
  }

  /**
   * Register a DELETE route handler
   * @param path - URL path pattern (supports :params)
   * @param handler - Function to handle matching DELETE requests
   */
  delete(path: string, handler: (req: Request, res: Response) => void) {
    this.router.addRoute('DELETE', path, handler);
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
      const middleware = this.router.runMiddlewares.bind(this._middlewares);
      await middleware(request, response, () => {
        this.router.handle(request, response);
      });
    });

    server.listen(port, callback);
  }
}