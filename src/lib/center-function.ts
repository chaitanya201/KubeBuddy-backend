import { NextFunction, Request, Response } from "express";
import ErrorResponse from "./response/ErrorResponse";
import AppError from "./CustomErrors/AppError";

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err: any) => {
      console.error(err);
      let errorMessage = "Internal Server Error";
      let statusCode = 500;
      if (err instanceof AppError) {
        errorMessage = err.metadata?.message || "Internal Server Error";
        statusCode = err.metadata?.statusCode || 500;
      } else if (err instanceof ErrorResponse) {
        errorMessage = err.metadata?.message || "Internal Server Error";
        statusCode = err.metadata?.statusCode || 500;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      const errorResponse = new ErrorResponse({
        metadata: {
          statusCode,
          message: errorMessage,
        },
        data: {
          responseData: null,
        },
      });

      res.status(statusCode).json(errorResponse);
    });
  };
};
