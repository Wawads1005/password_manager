import e from "express";
import http from "node:http";
import { keys } from "@/lib/keys";

const app = e();

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
  console.log(`Server running http://${keys.host}:${keys.port}`);
});

server.listen({ port: keys.port, host: keys.host });
