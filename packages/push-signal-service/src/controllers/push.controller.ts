import { Request, Response } from "express";

export const pushController = (_req: Request, res: Response): void => {
  res.status(200).json({});
};
