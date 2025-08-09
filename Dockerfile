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

# Accept build-time envs (ARG) and expose them for the build (ENV)
ARG DATABASE_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG OPENROUTER_API_KEY
ARG R2_ENDPOINT
ARG R2_ACCESS_KEY_ID
ARG R2_SECRET_ACCESS_KEY
ARG R2_BUCKET_NAME
ARG R2_PUBLIC_URL
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET

ENV DATABASE_URL=${DATABASE_URL}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}
ENV OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
ENV R2_ENDPOINT=${R2_ENDPOINT}
ENV R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
ENV R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}
ENV R2_BUCKET_NAME=${R2_BUCKET_NAME}
ENV R2_PUBLIC_URL=${R2_PUBLIC_URL}
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
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