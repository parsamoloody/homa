import http from 'node:http';
import { Request } from '@core/request';
import { Response } from '@core/response';
import { Router } from '@core/router';

class Application {
  private router: Router;
  private middlewares: Array<(req: Request, res: Response, next: () => void) => void> = [];

  constructor() {
    this.router = new Router();
  }

  use(middleware: (req: Request, res: Response, next: () => void) => void) {
    this.middlewares.push(middleware);
  }

  get(path: string, handler: (req: Request, res: Response) => void) {
    this.router.addRoute('GET', path, handler);
  }

  post(path: string, handler: (req: Request, res: Response) => void) {
    this.router.addRoute('POST', path, handler);
  }

  listen(port: number, callback?: () => void) {
    const server = http.createServer(async (req, res) => {
      const request = new Request(req);
      const response = new Response(res);
      
      await this.runMiddlewares(request, response, () => {
        this.router.handle(request, response);
      });
    });
    
    server.listen(port, callback);
  }

  private async runMiddlewares(req: Request, res: Response, finalHandler: () => void) {
    let index = 0;
    
    const next = async () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        await middleware(req, res, next);
      } else {
        finalHandler();
      }
    };
    
    await next();
  }
}

const homa = new Application;
export default homa;