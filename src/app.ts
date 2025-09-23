import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { notFoundHandler } from './handler/not-found.handler';
import root from './root/root.router';
import { globalErrorHandler } from './handler/global-error.handler';
import auth from './auth/auth.router';
import resident from './residents/resident.router';

const app: Application = express();

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', root);
app.use('/api/auth', auth);
app.use('/api/residents', resident);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
