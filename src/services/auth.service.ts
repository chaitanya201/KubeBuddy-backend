import { InsertUserType } from "../db/schema/types";
import AppError from "../lib/CustomErrors/AppError";
import { generatePublicId } from "../lib/id-generator";
import { loginType } from "../lib/request-schemas/auth";
import {
  createUser,
  generateAuthTokens,
  getUserById,
  getUserFromEmail,
  saveTokensInDBAndRedis,
  verifyPassword,
} from "../utils/auth";

type UserType = Pick<
  InsertUserType,
  "name" | "email" | "password" | "provider"
>;

export const registerUserService = async (user: UserType) => {
  const payload = {
    ...user,
    publicId: generatePublicId(),
  };

  const { error, user: newUser } = await createUser(payload);
  if (error) {
    throw new AppError({
      metadata: { message: error, statusCode: 500 },
    });
  }
  const createdUser = newUser?.at(0);
  if (!createdUser) {
    throw new AppError({
      metadata: { message: "Unable to create user", statusCode: 500 },
    });
  }

  const authTokens = generateAuthTokens(createdUser);
  const { password, id, ...userData } = createdUser;
  return {
    user: userData,
    authTokens,
  };
};

export const loginUserService = async ({ email, password }: loginType) => {
  const user = await getUserFromEmail({ email });
  if (!user) {
    throw new AppError({
      metadata: { message: "Invalid email or password", statusCode: 401 },
    });
  }
  if (!verifyPassword(password, user.password)) {
    throw new AppError({
      metadata: { message: "Invalid email or password", statusCode: 401 },
    });
  }
  const authTokens = generateAuthTokens(user);
  const { password: userPassword, id, ...userData } = user;
  await saveTokensInDBAndRedis({ tokens: authTokens, user: userData });
  return {
    user: userData,
    authTokens,
  };
};

export const getUserService = async (userId: string) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new AppError({
      metadata: { message: "User not found", statusCode: 404 },
    });
  }
  const { password, ...userData } = user;
  return userData;
};
