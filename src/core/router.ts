import { METHODS, Request } from '@core/request';
import { Response } from '@core/response';

// route handler functions that accept Request and Response objects
type RouteHandler = (req: Request, res: Response) => void;

// structure of a registered route
interface Route {
  method: METHODS;
  path: string;
  handler: RouteHandler;
}

export class Router {
  // Internal storage for all registered routes
  private routes: Route[] = [];

  /**
   * Register a new route with the router
   * @param method - HTTP method for the route
   * @param path - URL path pattern (supports :param syntax)
   * @param handler - Function to handle matching requests
   */
  addRoute(method: METHODS, path: string, handler: RouteHandler) {
    this.routes.push({ method, path, handler });
  }

  /**
   * Handle an incoming request by finding and executing the matching route
   * If no route matches, sends a 404 Not Found response
   * @param req - Request object containing client request data
   * @param res - Response object for sending the response
   */
  handle(req: Request, res: Response) {
    const route = this.routes.find(
      r => r.method === req.method && this.matchPath(r.path, req.url || '')
    );
    
    if (route) {
      const params = this.extractParams(route.path, req.url || '');
      req.params = params;
      route.handler(req, res);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  }

  /**
   * Check if a request path matches a route path pattern
   * Supports dynamic segments prefixed with ':'
   * Paths must have the same number of segments
   * @param routePath - Route pattern (e.g., '/users/:id')
   * @param requestPath - Actual request path (e.g., '/users/123')
   * @returns true if paths match, false otherwise
   */
  private matchPath(routePath: string, requestPath: string): boolean {
    const routeParts = routePath.split('/');
    const requestParts = requestPath.split('/');
    
    if (routeParts.length !== requestParts.length) return false;
    
    return routeParts.every((part, i) => 
      part.startsWith(':') || part === requestParts[i]
    );
  }

  /**
   * Extract dynamic parameters from a matched route path
   * @param routePath - Route pattern containing :param segments
   * @param requestPath - Actual request path with parameter values
   * @returns Object mapping parameter names to their values
   */
  private extractParams(routePath: string, requestPath: string): Record<string, string> {
    const params: Record<string, string> = {};
    const routeParts = routePath.split('/');
    const requestParts = requestPath.split('/');
    
    routeParts.forEach((part, i) => {
      if (part.startsWith(':')) {
        params[part.slice(1)] = requestParts[i];
      }
    });
    
    return params;
  }
}