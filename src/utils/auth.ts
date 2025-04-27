import appConfig from "../config/appConfig";
import db from "../db/drizzle-connection/dbConnection";
import { InsertUserType, SelectUserType } from "../db/schema/types";
import { userTable } from "../db/schema/user.table";
import jwt from "jsonwebtoken";
import { generatePublicId, generateSessionId } from "../lib/id-generator";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { saveInRedis } from "../db/redis/connection";
import sessionTable from "../db/schema/session.table";

type UserType = Pick<
  InsertUserType,
  | "name"
  | "email"
  | "password"
  | "provider"
  | "isVerified"
  | "providerRefreshToken"
  | "providerToken"
  | "publicId"
>;

export const createUser = async (user: UserType) => {
  try {
    const result = await db.insert(userTable).values(user).returning();
    return { user: result, error: null };
  } catch (error) {
    console.log("Error creating user", error);
    let message = "Unable to create user";
    return {
      user: null,
      error: error instanceof Error ? error.message : message,
    };
  }
};

export const generateAccessToken = ({
  payload,
}: {
  payload: Record<string, any>;
}) => {
  const token = jwt.sign(payload, appConfig.JWT_ACCESS_SECRETE, {
    expiresIn: "1h",
  });
  return token;
};

export const generateRefreshToken = ({
  payload,
}: {
  payload: Record<string, any>;
}) => {
  const token = jwt.sign(payload, appConfig.JWT_REFRESH_SECRETE, {
    expiresIn: "7d",
  });
  return token;
};

const verifyToken = (token: string, secrete: string) => {
  try {
    const result = jwt.verify(token, secrete);
    return { data: result as jwt.JwtPayload, expired: false };
  } catch (error) {
    console.log("Error verifying token", error);
    if (error instanceof jwt.TokenExpiredError) {
      return {
        expired: true,
        data: null,
      };
    }
    return {
      expired: false,
      data: null,
    };
  }
};

export const verifyAccessToken = (token: string) => {
  const result = verifyToken(token, appConfig.JWT_ACCESS_SECRETE);
  return result;
};

export const verifyRefreshToken = (token: string) => {
  const result = verifyToken(token, appConfig.JWT_REFRESH_SECRETE);
  return result;
};

export const saveTokensInDB = async ({
  sessionId,
  tokens,
  userId,
}: {
  sessionId: string;
  userId: string;
  tokens: { refreshToken: string };
}) => {
  const preActiveSession = await db.query.sessionTable.findFirst({
    where: (sessionTable) => {
      return and(
        eq(sessionTable.userId, userId),
        eq(sessionTable.isActive, true)
      );
    },
  });

  if (preActiveSession) {
    await db
      .update(sessionTable)
      .set({ isActive: false })
      .where(eq(sessionTable.id, preActiveSession.id));
  }
  const payload = {
    publicId: generatePublicId(),
    refreshToken: tokens.refreshToken,
    session: sessionId,
    userId,
  };
  await db.insert(sessionTable).values({ ...payload });
};

export const generateAuthTokens = (user: SelectUserType) => {
  const sessionId = generateSessionId({ publicId: user.publicId });
  const accessToken = generateAccessToken({ payload: { sessionId } });
  const refreshToken = generateRefreshToken({
    payload: { sessionId },
  });
  return { accessToken, refreshToken, sessionId };
};

export const verifyAuthTokens = ({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken: string;
}) => {
  const accessTokenResult = verifyAccessToken(accessToken);
  const refreshTokenResult = verifyRefreshToken(refreshToken);

  if (accessTokenResult.expired) {
    return { accessTokenExpired: true, data: null };
  }

  if (refreshTokenResult.expired) {
    return { refreshTokenExpired: true, data: null };
  }

  return {
    accessTokenExpired: false,
    refreshTokenResult: false,
    data: {
      accessTokenData: accessTokenResult.data,
      refreshTokenData: refreshTokenResult.data,
    },
  };
};

export const getUserFromEmail = async ({ email }: { email: string }) => {
  const user = db.query.userTable.findFirst({
    where: (userTable) => and(eq(userTable.email, email)),
  });
  return user;
};

export const getUserById = async (userId: string) => {
  const user = await db.query.userTable.findFirst({
    where: (userTable) => and(eq(userTable.publicId, userId)),
  });
  return user;
};

export const verifyPassword = (password: string, hashedPassword: string) => {
  return bcrypt.compareSync(password, hashedPassword);
};

export const saveTokensInRedis = async ({
  tokens,
  user,
}: {
  user: Omit<SelectUserType, "id" | "password">;
  tokens: { refreshToken: string; sessionId: string; accessToken: string };
}) => {
  await saveInRedis({
    key: tokens.sessionId,
    value: JSON.stringify({ ...user, tokens }),
  });
};

export const saveTokensInDBAndRedis = async ({
  tokens,
  user,
}: {
  user: Omit<SelectUserType, "id" | "password">;
  tokens: { accessToken: string; refreshToken: string; sessionId: string };
}) => {
  await saveTokensInDB({
    sessionId: tokens.sessionId,
    userId: user.publicId,
    tokens,
  });
  await saveTokensInRedis({ tokens, user });
};
