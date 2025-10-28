import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { TestAppDataSource } from '../../config/test-data-source';

beforeAll(async () => {
  console.log('Auth Test Setup: Initializing DB connection...');
  try {
    if (!TestAppDataSource.isInitialized) {
      await TestAppDataSource.initialize();
      console.log('Auth Test Setup: DB connection initialized.');
    } else {
      console.log('Auth Test Setup: DB already initialized.');
    }
  } catch (error) {
    console.error('Auth Test Setup: Error initializing DB:', error);
    throw error;
  }
});

afterEach(async () => {
  if (!TestAppDataSource.isInitialized) {
    throw new Error('Database connection lost before afterEach cleanup.');
  }
  const entities = TestAppDataSource.entityMetadatas;
  const tableNames = entities.map((entity) => `"${entity.tableName}"`).join(', ');
  try {
    await TestAppDataSource.query(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE;`);
  } catch (error) {
    console.error('Auth Test Setup: Error during TRUNCATE:', error);
    throw error;
  }
});

afterAll(async () => {
  console.log('Auth Test Setup: Closing DB connection...');
  if (TestAppDataSource.isInitialized) {
    await TestAppDataSource.destroy();
    console.log('Auth Test Setup: DB connection closed.');
  }
});
