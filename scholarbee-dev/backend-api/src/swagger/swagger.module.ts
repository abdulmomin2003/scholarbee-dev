import { Module } from '@nestjs/common';
import { SwaggerAuthController } from './swagger-auth.controller';

/**
 * Swagger Module
 * 
 * This module exists to organize Swagger UI-related functionality in a dedicated module,
 * following NestJS best practices for modular architecture.
 * 
 * **Why this module exists:**
 * - Swagger UI has specific authentication requirements that differ from the main application
 * - By creating a dedicated module, we:
 *   1. Follow the single responsibility principle
 *   2. Keep Swagger-related code organized and discoverable
 *   3. Make it easier to add more Swagger-related features in the future
 *   4. Follow NestJS conventions for module organization
 * 
 * **Current functionality:**
 * - Provides authentication callback handling for Swagger UI via SwaggerAuthController
 * 
 * @see SwaggerAuthController - Handles OAuth callbacks for Swagger UI authentication
 */
@Module({
  controllers: [SwaggerAuthController],
})
export class SwaggerModule {}

