import { Request, Response } from "express";

export const pushByConsumersController = (
  _req: Request,
  res: Response
): void => {
  res.status(200).json({});
};
