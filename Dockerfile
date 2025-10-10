# Base image
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Install all deps for building
FROM base AS deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Build the Next.js app
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ENV NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY
ENV NEXT_PUBLIC_POSTHOG_HOST=$NEXT_PUBLIC_POSTHOG_HOST

# Copy dependencies first (better caching)
COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lockb ./

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Install only production deps
FROM base AS prod-deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

# Runtime image
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV NEXT_PUBLIC_POSTHOG_KEY="${NEXT_PUBLIC_POSTHOG_KEY}"
ENV NEXT_PUBLIC_POSTHOG_HOST="${NEXT_PUBLIC_POSTHOG_HOST}"
EXPOSE 3000
USER node

# Copy built assets and production node_modules
COPY --chown=node:node --from=builder /app/.next ./.next
COPY --chown=node:node --from=builder /app/public ./public
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules

CMD ["bun", "start"]