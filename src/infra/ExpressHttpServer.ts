import express, { Request, Response } from 'express';
import { IHttpServer, RouteHandler } from './HttpServerShell';

export class ExpressHttpServer implements IHttpServer {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.app.use(express.json());
  }

  async listen(port: number): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
        resolve();
      });
    });
  }

  registerRoute(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    handler: RouteHandler
  ): void {
    this.app[method.toLowerCase() as keyof express.Application](path, async (req: Request, res: Response) => {
      try {
        await handler(req, res);
      } catch (error) {
        console.error('Handler error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    });
  }

  async close(): Promise<void> {
    // For simplicity, not implementing close in this exercise
  }
}