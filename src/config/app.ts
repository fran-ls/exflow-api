import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from '../routes';
import { errorHandler, notFoundHandler } from '../middlewares/errorHandler';
import { envs } from './envs';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandlers();
  }

  private setupMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: envs.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan(envs.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  private setupRoutes(): void {
    this.app.use('/api', routes);
  }

  private setupErrorHandlers(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }
}

export default new App().app;