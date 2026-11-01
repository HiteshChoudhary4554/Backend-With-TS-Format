import express from 'express';
import type { Application, Request } from 'express';

export function createServerApplication(): Application {
  const app = express();

  app.all('{*path}', (req: Request) => {
    throw new Error(`Route ${req.originalUrl} not found`);
  });
  return app;
}
