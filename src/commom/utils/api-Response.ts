import type { Response } from 'express';
import type { ZodIssue } from 'zod/v3';
type msg = string;
type payloadType = object;

export class ApiResponse {
  static ok(res: Response, message: msg, payload: payloadType = {}): Response {
    return res.status(200).json({
      success: true,
      message,
      payload,
    });
  }

  static created(res: Response, message: msg, payload: payloadType = {}): Response {
    return res.status(201).json({
      success: true,
      message,
      payload,
    });
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }

  static zodValidationFailed(res: Response, msg: string, err: ZodIssue[]) {
    return res.status(400).json({ success: false, message: msg, error: err });
  }

  static badRequest(res: Response, msg: string, err: string) {
    return res.status(400).json({ success: false, message: msg, error: err });
  }

  static internalServerError(res: Response, msg: string, err: string) {
    return res.status(500).json({ success: false, message: msg, error: err });
  }

  static unauthorizedUser(res: Response, msg: string, err: string) {
    return res.status(401).json({ success: false, message: msg, error: err });
  }
}
