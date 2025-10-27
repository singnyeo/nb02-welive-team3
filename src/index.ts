import http from "http";
import app from "./app";
import env from "./config/env";
import { initSocket } from "./ws/socket";
import { AppDataSource } from "./config/data-source";
import { seed } from "./seeds";
import { initializePollScheduler } from "./poll-scheduler/poll-scheduler.init";

const server = http.createServer(app);

AppDataSource.initialize()
  .then(async () => {
    console.log("Database connected");

    await seed();

    // Poll Scheduler 초기화
    initializePollScheduler();

    initSocket(server);

    server.listen(env.PORT, () => {
      console.log(
        `Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`
      );
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });
