import net from 'net';
import Router from './Router';
import { ReqMethod } from './types';

export default class TCPServer {
  private server: net.Server;

  private router: Router;

  constructor(
    private port: number,
    router: Router,
  ) {
    this.router = router;
    this.server = net.createServer(this.handleConnection.bind(this));
  }

  public start(): void {
    this.server.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });
  }

  /*
    For an HTTP server, each connection typically corresponds to a single request-response cycle. 
    After handling the request and sending the response, the connection is often closed (in HTTP/1.0) 
    or the connection might be reused for further requests (in HTTP/1.1 with keep-alive).
  */
  private handleConnection(socket: net.Socket): void {
    socket.once('readable', () => {
      this.readRequest(socket);
    });
  }

  private readRequest(socket: net.Socket): void {
    let reqBuffer = Buffer.alloc(0);
    let buffer: Buffer | null;
    let reqHeader: string | undefined;

    while (true) {
      buffer = socket.read();

      if (buffer === null) return;

      reqBuffer = Buffer.concat([reqBuffer, buffer]);

      const HEADER_LENGTH = 4; // "\r\n\r\n" length
      let marker = reqBuffer.indexOf('\r\n\r\n'); // marks the end of the HTTP headers

      if (marker !== -1) {
        let remaining = reqBuffer.slice(marker + HEADER_LENGTH);

        reqHeader = reqBuffer.slice(0, marker).toString();

        /*
          This is used to push the remaining buffer back into the socket's internal read queue.
          This ensures that the next read operation on the socket will start with the remaining data.
        */
        socket.unshift(remaining);
        break;
      }
    }

    this.readBody(socket, reqHeader);
  }

  private readBody(socket: net.Socket, reqHeader: string | undefined): void {
    let reqBuffer = Buffer.alloc(0);
    let buffer: Buffer | null;

    while ((buffer = socket.read()) !== null) {
      reqBuffer = Buffer.concat([reqBuffer, buffer]);
    }

    this.handleRequest(socket, reqHeader, reqBuffer);
  }

  private handleRequest(socket: net.Socket, reqHeader: string | undefined, reqBody: Buffer): void {
    if (!reqHeader) return;

    const lines = reqHeader.split('\r\n');
    const [method, path, httpVersion] = lines[0].split(' ');

    const headers: { [key: string]: string } = {};
    for (let i = 1; i < lines.length; i++) {
      const [key, value] = lines[i].split(': ');
      headers[key] = value;
    }

    const req = {
      method: method as ReqMethod,
      pathname: path,
      headers,
      body: reqBody,
    };

    const res = {
      end: (responseBody: string) => {
        const responseHeader = `HTTP/1.1 200 OK\r\nContent-Length: ${responseBody.length}\r\n\r\n`;
        socket.end(responseHeader + responseBody);
      },
      writeHead: (status: number, headers: { [key: string]: string }) => {
        socket.write(`HTTP/1.1 ${status}\r\n`);
        for (const [key, value] of Object.entries(headers)) {
          socket.write(`${key}: ${value}\r\n`);
        }
        socket.write('\r\n');
      },
    };

    this.handleMiddleware(req, res, () => {
      this.router.handleRequest(req, res, socket);
    });
  }

  private handleMiddleware(req: any, res: any, next: () => void): void {
    const executeMiddleware = (index: number) => {
      if (index < this.router.middleware.length) {
        this.router.middleware[index](req, res, () => executeMiddleware(index + 1));
      } else {
        next();
      }
    };

    executeMiddleware(0);
  }
}
