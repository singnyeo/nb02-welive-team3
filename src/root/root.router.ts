import Router from 'express';
import { handleGetHealthCheck } from './root.controller';

const root = Router();

root.get('/', handleGetHealthCheck);

export default root;
