import express from 'express';
import type { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from '../../modules/auth/auth.routes.js';
import classRouter from '../../modules/class/class.routes.js';

export function createServerApplication(): Application {
  const app = express();
  app.use(express.json({ limit: '16kb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(cors());

  app.get('/health', (req: Request, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/class', classRouter);

  app.all('{*path}', (req: Request, res: Response) => {
    res.status(404).json({ message: `Route ${req.path} not found` });
  });
  return app;
}
