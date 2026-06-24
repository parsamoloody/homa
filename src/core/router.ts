import { METHODS, Request } from '@core/request';
import { Response } from '@core/response';

type RouteHandler = (req: Request, res: Response) => void;

export type Middleware = (req: Request, res: Response, next: () => void) => void;

// Structure of a registered route
interface Route {
  method: METHODS;
  path: string;
  handler: RouteHandler;
  middleware?: Middleware[];
}

type GlobalPrefix = string | null;

export class Router {
  private _routes: Route[] = [];
  private _globalPrefix: GlobalPrefix = null;

  /** Names of Router methods exposed for delegation (e.g. by HomaApp) */
  static readonly publicMethods = [
    'setGlobalPrefix',
    'get',
    'post',
    'put',
    'patch',
    'delete'
  ] as const;

  /* Register a new route with the router
   * @param method - HTTP method for the route(GET, POST, ege)
   * @param path - URL path pattern (supports :param syntax)
   * @param handler - Function to handle matching requests
   * @param middlewares(optional) - Function to handle middlewares
   */
  addRoute(method: METHODS, path: string, handler: RouteHandler, middlewares?: Middleware | Middleware[]) {
    const fullPath = this.fullPath(path);

    let middleware: Middleware[] | undefined;
    if (middlewares) {
      if (typeof middlewares === 'function') {
        middleware = [middlewares];
      } else if (Array.isArray(middlewares) && middlewares.length > 0) {
        middleware = middlewares;
      }
    }
    this._routes.push({ method, path: fullPath, handler, middleware });
  }

  /**
   * Register a GET route handler
   */
  get(path: string, handler: RouteHandler, middlewares?: Middleware | Middleware[]) {
    this.addRoute('GET', path, handler, middlewares);
  }

  /**
   * Register a POST route handler
   */
  post(path: string, handler: RouteHandler, middlewares?: Middleware | Middleware[]) {
    this.addRoute('POST', path, handler, middlewares);
  }

  /**
   * Register a PUT route handler
   */
  put(path: string, handler: RouteHandler, middlewares?: Middleware | Middleware[]) {
    this.addRoute('PUT', path, handler, middlewares);
  }

  /**
   * Register a PATCH route handler
   */
  patch(path: string, handler: RouteHandler, middlewares?: Middleware | Middleware[]) {
    this.addRoute('PATCH', path, handler, middlewares);
  }

  /**
   * Register a DELETE route handler
   */
  delete(path: string, handler: RouteHandler, middlewares?: Middleware | Middleware[]) {
    this.addRoute('DELETE', path, handler, middlewares);
  }

  /**
   * Handle an incoming request by finding and executing the matching route
   */
  handle(req: Request, res: Response) {
    const cleanReqUrl = req.url ? this.trimSlashes(req.url) : null;
    const route = this._routes.find(
      r => r.method === req.method && this.matchPath(this.trimSlashes(r.path), cleanReqUrl || '')
    );

    if (route) {
      const cleanReqPath = this.trimSlashes(route.path);
      const params = this.extractParams(cleanReqPath, cleanReqUrl || '');
      req.params = params;
      if (route.middleware) {
        this.runMiddlewares(req, res, route.middleware, () => {
          route.handler(req, res);
        });
      } else {
        route.handler(req, res);
      }
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  }


  /**
 * Set the global prefix applied to all registered routes
 * Accepts a single string or an array of path segments, joined with '/'
 * Leading and trailing slashes are stripped to prevent double slashes when concatenated with route paths
 * @param prefix - Prefix as a string (e.g. 'api') or array of segments (e.g. ['api', 'v1'])
 */
  setGlobalPrefix(prefix: string | string[]) {
    const joined = Array.isArray(prefix) ? prefix.join('/') : prefix;
    this._globalPrefix = joined.replace(/^\/+|\/+$/g, '');
  }

  // Get full path with global prefix
  private fullPath = (routePath: string) =>
    this._globalPrefix ? `/${this._globalPrefix}${routePath}` : routePath;

  // Trim leading and trailing slashes
  private trimSlashes = (path: string) => path.replace(/^\/|\/$/g, '');

  // Check if a request path matches a route path pattern
  private matchPath(routePath: string, requestPath: string): boolean {
    const routeParts = routePath.split('/');
    const requestParts = requestPath.split('?')[0].split('/');

    if (routeParts.length !== requestParts.length) return false;

    return routeParts.every((part, i) =>
      part.startsWith(':') || part === requestParts[i]
    );
  }

  // Extract dynamic parameters from a matched route path
  private extractParams(routePath: string, requestPath: string): Record<string, string> {
    const params: Record<string, string> = {};
    const routeParts = routePath.split('/');
    const requestParts = requestPath.split('?')[0].split('/');
    routeParts.forEach((part, i) => {
      if (part.startsWith(':')) {
        params[part.slice(1)] = requestParts[i];
      }
    });
    return params;
  }

  /**
   * Execute all registered middleware functions in sequence
   */
  async runMiddlewares(req: Request, res: Response, middlewares: Middleware[], finalHandler: () => void) {
    let index = 0;

    const next = async () => {
      if (index < middlewares.length) {
        const middleware = middlewares[index++];
        await middleware(req, res, next);
      } else {
        finalHandler();
      }
    };

    await next();
  }
}