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
ENV NODE_ENV=production

# Copy dependencies and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build with optimizations
RUN bun run build

# Runtime image
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
EXPOSE 3000
USER node

# Copy built assets and package.json only
COPY --chown=node:node --from=builder /app/.next ./.next
COPY --chown=node:node --from=builder /app/public ./public
COPY --chown=node:node --from=builder /app/package.json ./package.json

# Install only production deps in final stage
RUN bun install --frozen-lockfile --production

CMD ["bun", "start"]