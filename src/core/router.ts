import { Request } from '@core/request';
import { Response } from '@core/response';

type RouteHandler = (req: Request, res: Response) => void;

interface Route {
  method: string;
  path: string;
  handler: RouteHandler;
}

export class Router {
  private routes: Route[] = [];

  addRoute(method: string, path: string, handler: RouteHandler) {
    this.routes.push({ method, path, handler });
  }

  handle(req: Request, res: Response) {
    const route = this.routes.find(
      r => r.method === req.method && this.matchPath(r.path, req.url || '')
    );
    
    if (route) {
      // Extract params (e.g., /users/:id)
      const params = this.extractParams(route.path, req.url || '');
      req.params = params;
      route.handler(req, res);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  }

  private matchPath(routePath: string, requestPath: string): boolean {
    const routeParts = routePath.split('/');
    const requestParts = requestPath.split('/');
    
    if (routeParts.length !== requestParts.length) return false;
    
    return routeParts.every((part, i) => 
      part.startsWith(':') || part === requestParts[i]
    );
  }

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
