import express from "express";
import type { Application, Request, Response } from "express";

export function createServerApplication(): Application {
  const app = express();

  app.all("{*path}", (req: Request, _) => {
    throw new Error(`Route ${req.originalUrl} not found`);
  });
  return app;
}
