import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "dist");
const port = Number(process.env.PORT ?? 8765);
const wasmType = process.env.WASM_CONTENT_TYPE ?? "application/wasm";

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": wasmType,
};

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  const relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  const file = path.resolve(root, relative || "index.html");
  if (!file.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    const type = types[path.extname(file)] ?? "application/octet-stream";
    response.writeHead(200, {
      "Content-Type": type,
      "Cache-Control": "no-store",
    });
    response.end(data);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`serving ${root} at http://127.0.0.1:${port}/`);
});
