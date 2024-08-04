import net from 'net';

type ReqMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type RouteHandler = (req: any, res: any) => void;

interface Route {
  method: string;
  path: string;
  handler: RouteHandler;
  params?: string[];
}

type HandleRequestArgs = {
  socket: net.Socket;
  method: ReqMethod;
  pathname: string;
  headers: { [key: string]: string };
  body: Buffer;
};

type AddRouteArgs = {
  method: ReqMethod;
  path: string;
  handler: RouteHandler;
};

export type { HandleRequestArgs, ReqMethod, RouteHandler, Route, AddRouteArgs };
