import {
  EnvValidationSchema,
  envValidationSchema,
} from 'src/config/validation/env.validation';

/** Database name from a MongoDB connection string path segment */
function mongoDbNameFromUri(uri: string, fallback = 'test'): string {
  try {
    const pathname = new URL(uri).pathname.replace(/^\//, '');
    return pathname.split('?')[0] || fallback;
  } catch {
    return fallback;
  }
}

// STEP 2
const configuration = () => {
  // TODO: Validate the environment variables
  const validationResult = envValidationSchema.validate(process.env, {
    abortEarly: false,
    allowUnknown: true, // WHY IS THIS NEEDED? Should we only validate the env here and not in the app module?
  });

  if (validationResult.error) {
    throw new Error(`Validation failed: ${validationResult.error.message}`);
  }

  if (validationResult.warning) {
    console.warn(`Validation warning: ${validationResult.warning.message}`);
  }

  const parsedEnv = validationResult.value! as EnvValidationSchema;

  // TODO: Step 1: Add the validationResult.value.[env-key] to the configuration object and add all the variables to the configuration object
  return {
    jwt: {
      secret: parsedEnv.JWT_SECRET,
      expiration: parsedEnv.JWT_EXPIRATION,

      loginSecret: parsedEnv.LOGIN_JWT_SECRET,
      loginExpiration: parsedEnv.LOGIN_JWT_EXPIRATION_SEC,

      refreshSecret: parsedEnv.REFRESH_JWT_SECRET,
      refreshExpiration: parsedEnv.REFRESH_JWT_EXPIRATION_SEC,
    },

    elasticsearch: {
      serverUrl: parsedEnv.ELASTICSEARCH_URL,
      username: parsedEnv.ELASTICSEARCH_USERNAME,
      password: parsedEnv.ELASTICSEARCH_PASSWORD,
      apiKey: parsedEnv.ELASTICSEARCH_API_KEY,
      indexingEnabled: parsedEnv.ELASTICSEARCH_INDEXING_ENABLED,
      allowedClientHost: parsedEnv.ELASTICSEARCH_ALLOWED_CLIENT_HOST,
      admissionProgramsIndex: parsedEnv.ELASTICSEARCH_ADMISSION_PROGRAMS_INDEX,
    },

    admin: {
      clientHosts: parsedEnv.ADMIN_CLIENT_HOSTS
        ? parsedEnv.ADMIN_CLIENT_HOSTS.split(',').map((host) => host.trim())
        : [],
    },

    app: {
      port: parsedEnv.PORT || 3010,
      nodeEnv: parsedEnv.NODE_ENV,
      payloadSecret: parsedEnv.PAYLOAD_SECRET,
      chatSessionTimeout: parsedEnv.CHAT_SESSION_TIMEOUT,
    },
    gcs: {
      projectId: parsedEnv.GCS_PROJECT_ID,
      bucket: parsedEnv.GCS_BUCKET,
      // clientEmail: parsedEnv.GCS_CLIENT_EMAIL,
      // privateKey: parsedEnv.GCS_PRIVATE_KEY,
      bucketPath: `https://storage.googleapis.com/${parsedEnv.GCS_BUCKET}`,
      logoAssetRelativePath: parsedEnv.GCS_LOGO_ASSET_RELATIVE_PATH,
    },

    // S3 configuration (deprecated - for migration compatibility)
    s3: {
      endpoint: parsedEnv.S3_ENDPOINT,
      bucket: parsedEnv.S3_BUCKET,
      accessKeyId: parsedEnv.S3_ACCESS_KEY_ID,
      secretAccessKey: parsedEnv.S3_SECRET_ACCESS_KEY,
      region: parsedEnv.S3_REGION,
      staticBucketPath: parsedEnv.STATIC_BUCKET_PATH,
    },

    frontend: {
      url: parsedEnv.FRONTEND_URL,
    },

    email: {
      sendgridApiKey: parsedEnv.SENDGRID_API_KEY,
      resendApiKey: parsedEnv.RESEND_API_KEY,
      defaultFromEmail: parsedEnv.DEFAULT_FROM_EMAIL,
    },

    smtp: {
      sesSmtpUsername: parsedEnv.SES_SMTP_USERNAME,
      sesSmtpPassword: parsedEnv.SES_SMTP_PASSWORD,
      smtpHost: parsedEnv.SMTP_HOST,
      smtpPort: parsedEnv.SMTP_PORT,
    },

    // AWS configuration (deprecated - for migration compatibility)
    aws: {
      accountId: parsedEnv.AWS_ACCOUNT_ID,
      accessKey: parsedEnv.AWS_ACCESS_KEY,
      secretKey: parsedEnv.AWS_SECRET_KEY,
    },

    database: {
      uri: parsedEnv.MONGODB_URI,
      redisHost: parsedEnv.REDIS_HOST,
      redisPort: parsedEnv.REDIS_PORT,
      redisPassword: parsedEnv.REDIS_PASSWORD,
    },

    tokens: {
      emailVerificationExpirationMinutes:
        parsedEnv.EMAIL_VERIFICATION_TOKEN_EXPIRATION_MINUTES,
      passwordResetExpirationMinutes:
        parsedEnv.PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES,
    },

    application: {
      admissionPrograms: {
        closingSoonDaysThreshold: parsedEnv.ADMISSION_PROGRAM_CLOSING_SOON_DAYS_THRESHOLD,
        openingSoonDaysThreshold: parsedEnv.ADMISSION_PROGRAM_OPENING_SOON_DAYS_THRESHOLD,
      },
      user: {
        maxAllowedDigitsForUserStudentId: parsedEnv.MAX_ALLOWED_DIGITS_FOR_STUDENT_ID,
      }
    },

    webhook: {
      secret: parsedEnv.WEBHOOK_SECRET,
      apiKey: parsedEnv.NOTIFICATION_WEBHOOK_API_KEY,
      bearerToken: parsedEnv.NOTIFICATION_WEBHOOK_BEARER_TOKEN,
    },

    support: {
      email: parsedEnv.SCHOLARBEE_SUPPORT_EMAIL,
      phone: parsedEnv.SCHOLARBEE_SUPPORT_PHONE,
    },

    google: {
      clientId: parsedEnv.GOOGLE_CLIENT_ID,
      clientSecret: parsedEnv.GOOGLE_CLIENT_SECRET,
      callbackUrl: parsedEnv.GOOGLE_CALLBACK_URL,
    },

    // AI chatbot (BeeBot) — all secrets live in backend-api/.env (no separate finale/.env)
    // Platform data always comes from MONGODB_URI.
    // KB articles should use explicit CHATBOT_KB_* Atlas settings when the KB lives on a separate cluster.
    chatbot: (() => {
      const platformUri = parsedEnv.MONGODB_URI;
      const platformDbName =
        parsedEnv.CHATBOT_PLATFORM_MONGODB_DB ??
        mongoDbNameFromUri(platformUri);
      const kbUri = parsedEnv.CHATBOT_KB_MONGODB_URI;
      const kbDbName = parsedEnv.CHATBOT_KB_MONGODB_DB;
      const usesSeparateKbCluster = Boolean(kbUri && kbDbName);

      return {
        geminiApiKey: parsedEnv.GEMINI_API_KEY,
        kbMongoUri: kbUri,
        kbMongoDb: kbDbName,
        platformDbName,
        usesSeparateKbCluster,
        pythonExecutable: parsedEnv.PYTHON_EXECUTABLE ?? 'python',
      };
    })(),
  };
};

export type IConfiguration = ReturnType<typeof configuration>;

export default configuration;
