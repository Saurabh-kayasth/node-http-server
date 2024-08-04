import net from 'net';
import { AddRouteArgs, HandleRequestArgs, Middleware, Route, RouteHandler } from './types';

class Router {
  private routes: Route[] = [];

  public middleware: Middleware[] = [];

  public use(middleware: Middleware): void {
    this.middleware.push(middleware);
  }

  public get(path: string, handler: RouteHandler): void {
    this.addRoute({ method: 'GET', path, handler });
  }

  public post(path: string, handler: RouteHandler): void {
    this.addRoute({ method: 'POST', path, handler });
  }

  public delete(path: string, handler: RouteHandler): void {
    this.addRoute({ method: 'DELETE', path, handler });
  }

  public patch(path: string, handler: RouteHandler): void {
    this.addRoute({ method: 'PATCH', path, handler });
  }

  public put(path: string, handler: RouteHandler): void {
    this.addRoute({ method: 'PUT', path, handler });
  }

  private addRoute(args: AddRouteArgs): void {
    const { method, path, handler } = args;
    const paramNames: string[] = [];
    const regexPath = path.replace(/:([^\/]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });

    this.routes.push({ method, path: regexPath, handler, params: paramNames });
  }

  public handleRequest(req: any, res: any, socket: net.Socket): void {
    for (const route of this.routes) {
      const match = req.pathname.match(route.path);
      if (match && route.method === req.method) {
        const params: { [key: string]: string } = {};
        if (route.params) {
          route.params.forEach((paramName: string, index: number) => {
            params[paramName] = match[index + 1];
          });
        }

        req.params = params;

        const executeMiddleware = (index: number) => {
          if (index < this.middleware.length) {
            this.middleware[index](req, res, () => executeMiddleware(index + 1));
          } else {
            route.handler(req, res);
          }
        };

        executeMiddleware(0);
        return;
      }
    }

    socket.end('HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\n\r\n');
  }
}

export default Router;
