import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../lib/center-function";
import { loginSchema, registerSchema } from "../../lib/request-schemas/auth";
import bcryptjs from "bcryptjs";
import {
  loginUserService,
  registerUserService,
} from "../../services/auth.service";
import ErrorResponse from "../../lib/response/ErrorResponse";
import SuccessResponse from "../../lib/response/SuccessResponse";

export const registerController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = registerSchema.parse(req.body);
    const hashedPassword = await bcryptjs.hash(body.password, 8);
    const result = await registerUserService({
      ...body,
      password: hashedPassword,
    });

    return res.json(new SuccessResponse({ data: { responseData: result } }));
  }
);

export const loginController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = loginSchema.parse(req.body);
    const result = await loginUserService(payload);
    return res.json(
      new SuccessResponse({
        data: { responseData: result },
        metadata: { statusCode: 200, message: "Login successful" },
      })
    );
  }
);

export const meController = catchAsync(
  async (req: Request & { user: any }, res: Response, next: NextFunction) => {
    return res.json(new SuccessResponse({ data: { responseData: req.user } }));
  }
);
