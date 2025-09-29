import 'reflect-metadata';
import { AppDataSource } from '../config/data-source';
import { seedUsers } from './user.seed';

export const seed = async () => {
  await seedUsers(AppDataSource);
};
