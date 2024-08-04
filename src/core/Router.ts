import net from 'net';
import { AddRouteArgs, HandleRequestArgs, Route, RouteHandler } from './types';

class Router {
  private routes: Route[] = [];

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

  public handleRequest(args: HandleRequestArgs): void {
    const { pathname, method, body, headers, socket } = args;
    for (const route of this.routes) {
      const match = pathname.match(route.path);
      if (match && route.method === method) {
        const params: { [key: string]: string } = {};
        if (route.params) {
          route.params.forEach((paramName: string, index: number) => {
            params[paramName] = match[index + 1];
          });
        }

        const req = { method, pathname, headers, body, params };

        const res = {
          end: (responseBody: string) => {
            const responseHeader = `HTTP/1.1 200 OK\r\nContent-Length: ${responseBody.length}\r\n\r\n`;
            socket.end(responseHeader + responseBody);
          },
        };

        return route.handler(req, res);
      }
    }

    socket.end('HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\n\r\n');
  }
}

export default Router;
