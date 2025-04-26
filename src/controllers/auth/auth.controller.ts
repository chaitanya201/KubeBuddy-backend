import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../lib/center-function";
import { registerSchema } from "../../lib/request-schemas/auth";
import bcryptjs from "bcryptjs";

export const registerController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = registerSchema.parse(req.body);
    const hashedPassword = await bcryptjs.hash(body.password, 8);
  }
);
