import { NextFunction, Request, Response } from "express";
import ErrorResponse from "./response/ErrorResponse";

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err: any) => {
      console.error(err);
      const errorResponse = new ErrorResponse({
        metadata: {
          statusCode: 500,
          message: err instanceof Error ? err.message : "Internal Server Error",
        },
        data: {
          responseData: null,
        },
      });

      res.status(500).json(errorResponse);
    });
  };
};
