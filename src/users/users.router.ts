import { Router } from 'express';
import { allow, AllowedRole } from '../middlewares/allow.middleware';
import { handleUpdateMe } from './users.controller';
import { singleFileUpload } from '../middlewares/file.middleware';

const users = Router();

users.patch('/me', allow(AllowedRole.USER), singleFileUpload('file'), handleUpdateMe);

export default users;
