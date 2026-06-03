FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies and update lock files
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
    if [ -f yarn.lock ]; then \
    yarn install --frozen-lockfile && yarn install --update-checksums; \
    elif [ -f package-lock.json ]; then \
    npm install && npm update --package-lock-only; \
    elif [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm install --lockfile-only; \
    else \
    echo "Lockfile not found." && exit 1; \
    fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept build arguments
ARG RELEASE_ENV
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_CHAT_SOCKET_URL
ARG NEXT_PUBLIC_NOTIFICATION_SOCKET_URL

# Set environment variables for the build
ENV RELEASE_ENV=${RELEASE_ENV}
ENV NEXT_PUBLIC_RELEASE_ENV=${RELEASE_ENV}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_CHAT_SOCKET_URL=${NEXT_PUBLIC_CHAT_SOCKET_URL}
ENV NEXT_PUBLIC_NOTIFICATION_SOCKET_URL=${NEXT_PUBLIC_NOTIFICATION_SOCKET_URL}

# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN \
    if [ -f yarn.lock ]; then yarn run build; \
    elif [ -f package-lock.json ]; then npm run build; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
    else echo "Lockfile not found." && exit 1; \
    fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3020

ENV PORT 3020

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD HOSTNAME="0.0.0.0" node server.js

