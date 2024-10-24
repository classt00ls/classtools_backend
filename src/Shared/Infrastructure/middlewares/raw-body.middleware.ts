import { Response } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';
 
@Injectable()
export class RawBodyMiddleware implements NestMiddleware {

  use(req: Request, res: Response, next: () => unknown) {
    req.headers["content-type"] = "text/plain";
    next();
  }
}