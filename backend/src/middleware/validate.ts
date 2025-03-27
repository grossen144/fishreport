import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

type ValidationSchema = {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
};

export const validate =
  (schemas: ValidationSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        });
      }
      return res.status(500).json({
        status: "error",
        message: "Internal server error during validation",
      });
    }
  };
