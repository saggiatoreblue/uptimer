import { Express, Request, Response, NextFunction } from "express";
import { PORT } from "./config";
import http from "http";

export default class MonitorServer {
  private app: Express;
  private httpServer: http.Server;

  constructor(app: Express) {
    this.app = app;
    this.httpServer = new http.Server(app);
  }

  async start(): Promise<void> {
    this.standardMiddleWare(this.app);
    this.startServer();
  }

  private standardMiddleWare(app: Express): void {
    app.set("trust proxy", 1);
    app.use((_req: Request, res: Response, next: NextFunction) => {
      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
      next();
    });
  }

  private async startServer(): Promise<void> {
    try {
      const SERVER_PORT: number = parseInt(PORT!, 10) || 5000;
      this.httpServer.listen(SERVER_PORT, () => {
        console.info(`Server running on port ${SERVER_PORT}`);
      });
      console.info(`Server has started with process id ${process.pid}`);
    } catch (error) {
      console.error("error", "startServer() error " + error);
    }
  }
}
