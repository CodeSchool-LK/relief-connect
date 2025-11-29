FROM node:18-alpine AS base

# Enable Corepack for Yarn
RUN corepack enable && corepack prepare yarn@4.0.2 --activate

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy workspace files
COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/web/package.json ./apps/web/

# Install dependencies (including dev dependencies for build)
RUN yarn workspaces focus web

# Build stage
FROM base AS builder
WORKDIR /app

# Accept build argument for API URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy dependencies from root (Yarn workspaces hoists to root)
COPY --from=deps /app/node_modules ./node_modules

# Copy workspace configuration
COPY package.json yarn.lock .yarnrc.yml ./

# Copy shared library configuration and source (needed for TypeScript resolution)
COPY libs/shared/package.json ./libs/shared/
COPY libs/shared/tsconfig.json ./libs/shared/
COPY libs/shared/project.json ./libs/shared/
COPY libs/shared/src ./libs/shared/src

# Copy application files
COPY apps/web ./apps/web
COPY tsconfig.base.json ./

# Build Next.js app (TypeScript will be compiled automatically)
# Note: Next.js transpiles TypeScript directly, so we don't need to build the shared library first
WORKDIR /app/apps/web
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js app (TypeScript will be compiled automatically)
RUN yarn build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3008

ENV PORT=3008
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
