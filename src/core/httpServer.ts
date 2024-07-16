import net from 'net';
import { PORT } from '../config/ServerConfig';

export default class TCPServer {
  private server: net.Server;

  constructor(private port: number) {
    this.server = net.createServer(this.handleConnection.bind(this));
  }

  public start(): void {
    this.server.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });
  }

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
      let marker = reqBuffer.indexOf('\r\n\r\n');

      if (marker !== -1) {
        let remaining = reqBuffer.slice(marker + HEADER_LENGTH);

        reqHeader = reqBuffer.slice(0, marker).toString();

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
    console.log('====================================');
    console.log('Request Header:');
    console.log(reqHeader);
    console.log('====================================');
    console.log('Request Body:');
    console.log(reqBody.toString());
    console.log('====================================');

    socket.end('HTTP/1.1 200 OK\r\nServer: my-custom-server\r\nContent-Length: 0\r\n\r\n');
  }
}
