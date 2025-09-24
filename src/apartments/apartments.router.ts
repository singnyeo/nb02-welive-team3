import Router from 'express';
import { allow, AllowedRole } from '../middlewares/allow.middleware';
import { handleGetApartment, handleGetApartments } from './apartments.controller';

const apartments = Router();

apartments.get('/', allow(AllowedRole.NONE), handleGetApartments);
apartments.get('/:id', allow(AllowedRole.NONE), handleGetApartment);

export default apartments;
