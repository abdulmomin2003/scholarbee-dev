import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContextService } from 'src/common/services/request-context.service';
import { extractClientHost } from 'src/utils/host.utils';

@Injectable()
/**
 * Middleware to extract client host from request headers and set it in the request context (using AsyncLocalStorage API)
 */
export class RequestContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestContextMiddleware.name);

  constructor(private readonly requestContextService: RequestContextService) { }

  use(req: Request, res: Response, next: NextFunction): void {
    // Extract client host from request headers
    const normalizedClientHost = extractClientHost(req.headers, req.hostname);

    // Create request context
    const context = { normalizedClientHost };

    // Run the request within the context
    this.requestContextService.runWithContext(context, () => {
      this.logger.debug(
        `Request context initialized with client host: ${normalizedClientHost || 'unknown'}`,
      );
      next();
    });
  }
}
