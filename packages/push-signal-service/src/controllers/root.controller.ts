import { Request, Response } from "express";

export const rootController = (_req: Request, res: Response): void => {
  res.status(200).json({});
};
