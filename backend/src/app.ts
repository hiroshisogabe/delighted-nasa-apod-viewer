import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/test', (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query.fail === 'true') {
        throw new Error('Forced failure');
      }

      res.status(200).json({
        status: 'Running',
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      next(error);
    }
  });

  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not found',
      message: 'Route not found'
    });
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message = error instanceof Error ? error.message : 'Unknown error';

    res.status(500).json({
      error: 'Unexpected error',
      message
    });
  });

  return app;
};
