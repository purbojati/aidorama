# Base image
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Install all deps for building
FROM base AS deps
COPY package.json ./
RUN npm install

# Build the Next.js app
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Install only production deps
FROM base AS prod-deps
COPY package.json ./
RUN npm install --omit=dev

# Runtime image
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
EXPOSE 3000
USER node

# Copy built assets and production node_modules
COPY --chown=node:node --from=builder /app/.next ./.next
COPY --chown=node:node --from=builder /app/public ./public
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules

CMD ["npm", "start"]