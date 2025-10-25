import e from "express";
import http from "node:http";

const app = e();
const port = 8080;
const host = "127.0.0.1";

app.use(e.json());

app.use(e.urlencoded({ extended: false }));

app.get("/", (_, res) => {
  res.status(200).json({ message: "Hello, World!" });
});

const server = http.createServer(app);

server.on("error", (error) => {
  const { message } = error;

  console.error(`[ERROR]: ${message}`);
});

server.on("request", (req) => {
  const { url, method } = req;

  console.log(`[INFO]: ${method} ${url}`);
});

server.on("listening", () => {
  console.log(`Server running http://${host}:${port}`);
});

server.listen({ port, host });
