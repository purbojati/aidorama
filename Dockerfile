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

# Accept build arguments for environment variables
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG BETTER_AUTH_URL
ARG BETTER_AUTH_SECRET

# Set environment variables for the build
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
ENV BETTER_AUTH_URL=$BETTER_AUTH_URL
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET

# Copy dependencies and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .
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

# Accept build arguments again for runtime
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG BETTER_AUTH_URL
ARG BETTER_AUTH_SECRET

# Set environment variables for runtime
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
ENV BETTER_AUTH_URL=$BETTER_AUTH_URL
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET

EXPOSE 3000
USER node

# Copy built assets and production node_modules
COPY --chown=node:node --from=builder /app/.next ./.next
COPY --chown=node:node --from=builder /app/public ./public
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules

CMD ["bun", "start"]