import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AsyncLocalStorage } from 'async_hooks';
import { IConfiguration } from 'src/config/configuration';
import { normalizeHost } from 'src/utils/host.utils';

/**
 * Request context interface
 */
export interface IRequestContext {
  normalizedClientHost?: string;
  // derived values
  isAdminHost?: boolean;
}

@Injectable()
export class RequestContextService {
  private readonly logger = new Logger(RequestContextService.name);
  private readonly asyncLocalStorage = new AsyncLocalStorage<IRequestContext>();

  constructor(private readonly configService: ConfigService<IConfiguration>) { }

  /**
   * Run a function within a request context
   */
  runWithContext<T>(context: IRequestContext, fn: () => T): T {
    return this.asyncLocalStorage.run(context, fn);
  }

  /**
   * Check if the current request is from an admin host
   * This method checks if the client host is in the provided admin hosts list
   */
  private isAdminHost(normalizedClientHost?: string): boolean {
    const adminHosts: string[] = this.configService.get('admin.clientHosts', {
      infer: true,
    });

    if (!normalizedClientHost || !adminHosts || adminHosts.length === 0) {
      return false;
    }

    const normalizedAdminHosts = adminHosts.map((adminHost) =>
      normalizeHost(adminHost),
    );

    // Check if the client host matches any of the configured admin hosts
    const isAdminHost = normalizedAdminHosts.some(
      (normalizedAdminHost) => normalizedClientHost === normalizedAdminHost,
    );

    // if (isAdminHost) {
    //   const adminPortalType = this.determineAdminPortalType(normalizedClientHost);
    //   context.adminPortalType = adminPortalType;
    // }

    return isAdminHost;
  }

  /**
   * Get the current request context
   */
  private getContext(): IRequestContext | undefined {
    const context = this.asyncLocalStorage.getStore();

    const isAdminHost = this.isAdminHost(context?.normalizedClientHost);
    // TODO: Retrieve adminHostType

    return {
      ...context,
      isAdminHost,
    };
  }

  /**
   * Get client host from the current request context
   */
  getClientHost(): string | undefined {
    const context = this.getContext();
    return context?.normalizedClientHost;
  }

  /**
   * Get admin host from the current request context
   */
  getIsAdminHost(): boolean {
    const context = this.getContext();
    return !!context?.isAdminHost;
  }

  // /**
  //  * Determine admin portal type based on host patterns
  //  */
  // private determineAdminPortalType(
  //   host: string,
  // ): 'university' | 'campus' | 'general' | undefined {
  //   if (!host) return undefined;

  //   const normalizedHost = normalizeHost(host);

  //   // University portal patterns
  //   const universityPatterns = [
  //     'university',
  //     'university-fe',
  //     'admin.scholarbee.pk',
  //     'university.scholarbee.pk',
  //   ];

  //   // Campus admin portal patterns
  //   const campusPatterns = ['campus', 'campus-admin', 'campus.scholarbee.pk'];

  //   // Check for university portal
  //   if (
  //     universityPatterns.some((pattern) => normalizedHost.includes(pattern))
  //   ) {
  //     return 'university';
  //   }

  //   // Check for campus admin portal
  //   if (campusPatterns.some((pattern) => normalizedHost.includes(pattern))) {
  //     return 'campus';
  //   }

  //   // If it's an admin host but doesn't match specific patterns, it's general
  //   return 'general';
  // }
}
