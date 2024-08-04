# node-http-server

A lightweight version of Express.js built from scratch using Node.js's net module. This project is designed to provide insights into web server architecture and handling HTTP requests and responses at a low level.

![Screenshot 2024-08-04 at 1 51 35 PM](https://github.com/user-attachments/assets/f80db54d-5f46-4637-9cc6-3d2aa9b42a16)

## Features

- Custom TCP Server: Implements a server using Node.js’s net module to handle raw TCP connections.
- Router: Provides routing functionality similar to Express.js, supporting HTTP methods (GET, POST, PUT, DELETE, PATCH).
- Middleware Support: Allows for middleware functions to process requests before routing.
- Request and Response Handling: Handles HTTP request headers, request bodies, and sends responses.

## Installation & Usage

Clone the repository:

```sh
git clone https://github.com/Saurabh-kayasth/node-http-server.git
```

Navigate to the project directory:

```sh
cd node-http-server
```

Install dependencies:

```sh
npm install
```

Start the server:

```sh
npm start
```

This will start the server on the port specified in the config/ServerConfig.ts file.
