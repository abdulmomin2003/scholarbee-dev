import * as Joi from 'joi';

export type ENodeEnv = 'development' | 'production' | 'test';

export interface EnvValidationSchema {
  // ELASTICSEARCH
  ELASTICSEARCH_URL: string;
  ELASTICSEARCH_USERNAME: string;
  ELASTICSEARCH_PASSWORD: string;
  ELASTICSEARCH_API_KEY: string;
  ELASTICSEARCH_INDEXING_ENABLED?: boolean;
  ELASTICSEARCH_ALLOWED_CLIENT_HOST?: string;
  ELASTICSEARCH_ADMISSION_PROGRAMS_INDEX: string;

  // ADMIN ACCESS CONTROL
  ADMIN_CLIENT_HOSTS?: string;

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRATION: string;

  LOGIN_JWT_SECRET: string;
  LOGIN_JWT_EXPIRATION_SEC: number;

  REFRESH_JWT_SECRET: string;
  REFRESH_JWT_EXPIRATION_SEC: number;

  // App Settings
  PORT: number;
  NODE_ENV: ENodeEnv; // Possible values: development, production, test
  PAYLOAD_SECRET: string;
  CHAT_SESSION_TIMEOUT: number;

  // GCS Configuration
  GCS_PROJECT_ID: string;
  GCS_BUCKET: string;
  GCS_LOGO_ASSET_RELATIVE_PATH: string;
  GCS_CLIENT_EMAIL: string;
  GCS_PRIVATE_KEY: string;
  STATIC_BUCKET_PATH: string;

  // S3 Configuration (deprecated - for migration compatibility)
  S3_ENDPOINT?: string;
  S3_BUCKET?: string;
  S3_ACCESS_KEY_ID?: string;
  S3_SECRET_ACCESS_KEY?: string;
  S3_REGION?: string;

  // Frontend
  FRONTEND_URL: string;

  // Email Configuration
  SENDGRID_API_KEY?: string;
  RESEND_API_KEY: string;
  DEFAULT_FROM_EMAIL?: string;

  // SMTP Configuration
  SES_SMTP_USERNAME: string;
  SES_SMTP_PASSWORD: string;
  SMTP_HOST: string;
  SMTP_PORT: number;

  // AWS Configuration (deprecated - for migration compatibility)
  AWS_ACCOUNT_ID?: string;
  AWS_ACCESS_KEY?: string;
  AWS_SECRET_KEY?: string;

  // Database
  DATABASE_HOST?: string;
  DATABASE_PORT?: number;
  DATABASE_USERNAME?: string;
  DATABASE_PASSWORD?: string;
  DATABASE_NAME?: string;
  DATABASE_URI: string;

  // MongoDB
  MONGODB_URI: string;

  /**
   * BeeBot — all set in backend-api/.env (same file as MONGODB_URI).
   * GEMINI_API_KEY: required for AI replies.
   * CHATBOT_KB_MONGODB_URI / CHATBOT_KB_MONGODB_DB: KB embeddings Atlas (temporary).
   * Omit CHATBOT_KB_* when kb_articles lives on the same cluster as MONGODB_URI.
   */
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  GEMINI_MODEL_FALLBACKS?: string;
  CHATBOT_KB_MONGODB_URI?: string;
  CHATBOT_KB_MONGODB_DB?: string;
  CHATBOT_PLATFORM_MONGODB_DB?: string;
  PYTHON_EXECUTABLE?: string;

  // Token Expiration
  EMAIL_VERIFICATION_TOKEN_EXPIRATION_MINUTES: number;
  PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES: number;

  // Webhook Configuration
  WEBHOOK_SECRET: string;
  NOTIFICATION_WEBHOOK_API_KEY?: string;
  NOTIFICATION_WEBHOOK_BEARER_TOKEN?: string;

  // Support Configuration
  SCHOLARBEE_SUPPORT_EMAIL?: string;
  SCHOLARBEE_SUPPORT_PHONE?: string;

  // Google OAuth
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_CALLBACK_URL?: string;

  // Application Config
  MAX_ALLOWED_DIGITS_FOR_STUDENT_ID: number;
  ADMISSION_PROGRAM_CLOSING_SOON_DAYS_THRESHOLD: number;
  ADMISSION_PROGRAM_OPENING_SOON_DAYS_THRESHOLD: number;

  // Redis
  REDIS_HOST?: string;
  REDIS_PORT?: number;
  REDIS_PASSWORD?: string;
}
// Config validation error: "SENDGRID_API_KEY" is required.

// "DEFAULT_FROM_EMAIL" is required.
// "AWS_ACCOUNT_ID" is required.
// "AWS_ACCESS_KEY" is required.
// "AWS_SECRET_KEY" is required

export const envValidationSchema = Joi.object<EnvValidationSchema>({
  // ELASTICSEARCH
  ELASTICSEARCH_URL: Joi.string().required().uri(),
  ELASTICSEARCH_USERNAME: Joi.string().required(),
  ELASTICSEARCH_PASSWORD: Joi.string().required(),
  ELASTICSEARCH_API_KEY: Joi.string().required(),
  ELASTICSEARCH_INDEXING_ENABLED: Joi.boolean().optional(),
  ELASTICSEARCH_ALLOWED_CLIENT_HOST: Joi.string().optional().uri(),
  ELASTICSEARCH_ADMISSION_PROGRAMS_INDEX: Joi.string().default(
    'admission-programs-detail',
  ),

  // ADMIN ACCESS CONTROL
  ADMIN_CLIENT_HOSTS: Joi.string().optional(), // comma separated list of admin client hosts i.e. "https://api.scholarbee.pk,https://api-dev.scholarbee.pk"

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().required(),

  LOGIN_JWT_SECRET: Joi.string().required(),
  LOGIN_JWT_EXPIRATION_SEC: Joi.number().required(),

  REFRESH_JWT_SECRET: Joi.string().required(),
  REFRESH_JWT_EXPIRATION_SEC: Joi.number().required(),

  // App Settings
  PORT: Joi.number().default(3010),
  NODE_ENV: Joi
    .string()
    .valid('development', 'production', 'test')
    .default('development'),
  PAYLOAD_SECRET: Joi.string().required(),
  CHAT_SESSION_TIMEOUT: Joi.number().default(1 * 60 * 60 * 1000), // 1 hour

  // GCS Configuration
  GCS_PROJECT_ID: Joi.string().required(),
  GCS_BUCKET: Joi.string().required(),
  /**
   * Relative path to the logo asset in the GCS bucket.
   * Example: "logo-white_.png" (default)
   */
  GCS_LOGO_ASSET_RELATIVE_PATH: Joi.string().default('logo-white_.png'),
  // GCS_CLIENT_EMAIL: Joi.string().required().email(),
  // GCS_PRIVATE_KEY: Joi.string().required(),
  STATIC_BUCKET_PATH: Joi.string().required().uri(),

  // S3 Configuration (deprecated - for migration compatibility)
  S3_ENDPOINT: Joi.string().optional().uri(),
  S3_BUCKET: Joi.string().optional(),
  S3_ACCESS_KEY_ID: Joi.string().optional(),
  S3_SECRET_ACCESS_KEY: Joi.string().optional(),
  S3_REGION: Joi.string().optional(),

  // Frontend
  FRONTEND_URL: Joi.string().required().uri(),

  // Email Configuration
  SENDGRID_API_KEY: Joi.string().optional(),
  RESEND_API_KEY: Joi.string().required(),
  DEFAULT_FROM_EMAIL: Joi.string().email().default('noreply@scholarbee.pk'),

  // SMTP Configuration
  SES_SMTP_USERNAME: Joi.string().required(),
  SES_SMTP_PASSWORD: Joi.string().required(),
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),

  // AWS Configuration (deprecated - for migration compatibility)
  AWS_ACCOUNT_ID: Joi.string().optional(),
  AWS_ACCESS_KEY: Joi.string().optional(),
  AWS_SECRET_KEY: Joi.string().optional(),

  // Database (Optional)
  DATABASE_HOST: Joi.string().optional(),
  DATABASE_PORT: Joi.number().default(5432).optional(),
  DATABASE_USERNAME: Joi.string().optional(),
  DATABASE_PASSWORD: Joi.string().optional(),
  DATABASE_NAME: Joi.string().optional(),

  // MongoDB
  // Replace your existing MONGODB_URI line with this:
  MONGODB_URI:
    // union of the following two Joi schemas
    Joi.alternatives().try(
      // uri pattern
      Joi.string().required().uri(),
      // mongodb:// pattern
      Joi.string()
        .required()
        .regex(/^mongodb:\/\//)
        .messages({
          'string.pattern.base': 'MONGODB_URI must start with mongodb://',
        }),
    ),

  // Token Expiration
  EMAIL_VERIFICATION_TOKEN_EXPIRATION_MINUTES: Joi.number().default(10),
  PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES: Joi.number().default(10),

  // Webhook Configuration
  WEBHOOK_SECRET: Joi.string().required(),
  NOTIFICATION_WEBHOOK_API_KEY: Joi.string().optional(),
  NOTIFICATION_WEBHOOK_BEARER_TOKEN: Joi.string().optional(),

  // Support Configuration
  SCHOLARBEE_SUPPORT_EMAIL: Joi.string()
    .optional()
    .email()
    .default('info@scholarbee.pk'),
  SCHOLARBEE_SUPPORT_PHONE: Joi.string()
    .optional()
    .default('+92 325 555 9699'),

  // Google OAuth
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  GOOGLE_CALLBACK_URL: Joi.string().optional().uri(),

  // Application Config

  /** Supports up to 9-digit student IDs i.e 100,000,000 - 100 Million */
  MAX_ALLOWED_DIGITS_FOR_STUDENT_ID: Joi.number().default(9),
  /** Number of days before admission_enddate to consider a program "closing soon" */
  ADMISSION_PROGRAM_CLOSING_SOON_DAYS_THRESHOLD: Joi.number().default(10),
  /** Number of days before admission_startdate to consider a program "opening soon" */
  ADMISSION_PROGRAM_OPENING_SOON_DAYS_THRESHOLD: Joi.number().default(15),

  // Redis
  REDIS_HOST: Joi.string().optional().default('localhost'),
  REDIS_PORT: Joi.number().optional().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),


  // AI Chatbot (BeeBot) — copy values into backend-api/.env
  GEMINI_API_KEY: Joi.string().optional().description(
    'Google Gemini API key for BeeBot',
  ),
  GEMINI_MODEL: Joi.string()
    .optional()
    .description('Primary Gemini model id, e.g. gemini-2.0-flash-lite'),
  GEMINI_MODEL_FALLBACKS: Joi.string()
    .optional()
    .description('Comma-separated fallback model ids if primary is not found'),
  CHATBOT_KB_MONGODB_URI: Joi.alternatives()
    .try(Joi.string().uri(), Joi.string().regex(/^mongodb:\/\//))
    .optional()
    .description(
      'Atlas URI for kb_articles embeddings; omit when KB uses same cluster as MONGODB_URI',
    ),
  CHATBOT_KB_MONGODB_DB: Joi.string()
    .optional()
    .description('Database name on KB cluster (e.g. local-db); omit when same as platform'),
  CHATBOT_PLATFORM_MONGODB_DB: Joi.string().optional(),
  PYTHON_EXECUTABLE: Joi.string().optional().default('python'),
});
