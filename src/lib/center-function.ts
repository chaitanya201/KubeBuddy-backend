import { NextFunction, Request, Response } from "express";

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err: any) => {
      console.error(err);
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    });
  };
};
