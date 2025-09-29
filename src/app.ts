import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { notFoundHandler } from './handler/not-found.handler';
import root from './root/root.router';
import { globalErrorHandler } from './handler/global-error.handler';
import auth from './auth/auth.router';
import complaint from './complaint/complaint.router';

const app: Application = express();

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', root);
app.use('/api/auth', auth);
app.use('/api/complaint', complaint);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
