import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../lib/center-function";
import ErrorResponse from "../lib/response/ErrorResponse";
import { verifyAuthTokens } from "../utils/auth";
import { getFromRedis } from "../db/redis/connection";

export const authMiddleware = catchAsync(
  async (req: Request & { user: any }, res: Response, next: NextFunction) => {
    const accessToken = req.header("accessToken");
    const refreshToken = req.header("refreshToken");
    if (!accessToken || !refreshToken) {
      console.log("No tokens found");
      return res.status(401).json(
        new ErrorResponse({
          metadata: { message: "Unauthorized", statusCode: 401 },
          data: { responseData: null },
        })
      );
    }

    if (typeof accessToken !== "string" || typeof refreshToken !== "string") {
      return res.status(401).json(
        new ErrorResponse({
          metadata: { message: "Invalid token format", statusCode: 401 },
          data: { responseData: null },
        })
      );
    }

    const result = verifyAuthTokens({ accessToken, refreshToken });

    if (!result.data) {
      if (result.accessTokenExpired) {
        return res.status(406).json(
          new ErrorResponse({
            metadata: { message: "Access token expired", statusCode: 406 },
            data: { responseData: null },
          })
        );
      }

      if (result.refreshTokenExpired) {
        return res.status(401).json(
          new ErrorResponse({
            metadata: { message: "Refresh token expired", statusCode: 401 },
            data: { responseData: null },
          })
        );
      }

      return res.status(401).json(
        new ErrorResponse({
          metadata: { message: "Internal Server Error", statusCode: 401 },
          data: { responseData: null },
        })
      );
    }
    console.log("access", result.data.accessTokenData);
    console.log("refresh", result.data.refreshTokenData);
    if (
      result.data.accessTokenData?.sessionId !==
      result.data.refreshTokenData?.sessionId
    ) {
      console.log("token data not match");
      return res.status(401).json(
        new ErrorResponse({
          metadata: { message: "Invalid token data", statusCode: 401 },
        })
      );
    }
    console.log("key", result.data.accessTokenData?.sessionId);
    const redisUser = await getFromRedis(
      result.data.accessTokenData?.sessionId
    );

    if (!redisUser) {
      return res.status(401).json(
        new ErrorResponse({
          metadata: { message: "No user found", statusCode: 401 },
        })
      );
    }
    const parsedUser = JSON.parse(redisUser);
    if (
      parsedUser.tokens.accessToken !== accessToken ||
      parsedUser.tokens.refreshToken !== refreshToken
    ) {
      console.log("token not match in redis");
      return res.status(401).json(
        new ErrorResponse({
          metadata: { message: "No match in redis", statusCode: 401 },
        })
      );
    }
    req.user = parsedUser;

    next();
  }
);
