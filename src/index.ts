import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import appConfig from "./config/appConfig";
import authRouter from "./routes/auth/auth.routes";
import { initRedis } from "./db/redis/connection";
const app = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(helmet());

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

const baseUrl = appConfig.BASE_URL;
initRedis();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(`/${baseUrl}/auth`, authRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  res.status(500).send("Something went wrong!");
});

app.listen(appConfig.PORT, (err) => {
  if (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
  console.log(`Server is running on port ${appConfig.PORT}`);
  console.log(`Environment: ${appConfig.NODE_ENV}`);
});
