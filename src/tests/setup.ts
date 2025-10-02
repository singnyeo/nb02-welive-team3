process.env.NODE_ENV = "test";
process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.JWT_ACCESS_EXPIRATION = "900000";
process.env.JWT_REFRESH_EXPIRATION = "86400000";
process.env.DB_HOST = "localhost";
process.env.DB_PORT = "5432";
process.env.DB_USERNAME = "test";
process.env.DB_PASSWORD = "test";
process.env.DB_NAME = "test_db";

jest.mock("../config/data-source", () => ({
  AppDataSource: {
    isInitialized: false,
    initialize: jest.fn().mockResolvedValue(true),
    destroy: jest.fn().mockResolvedValue(true),
    getRepository: jest.fn(),
    createQueryRunner: jest.fn(),
  },
}));

beforeAll(async () => {
  console.log("Starting test suite...");
});

afterAll(async () => {
  jest.clearAllMocks();
  console.log("Test suite completed.");
});
