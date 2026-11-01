import type { Response } from 'express';
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
}
