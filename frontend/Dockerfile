# ── Frontend Dockerfile ───────────────────────────────────────────────────────
# Multi-stage build:
#   Stage 1 (deps)    – install production node_modules
#   Stage 2 (builder) – compile the Next.js application
#   Stage 3 (runner)  – minimal runtime image (no devDependencies, no source)
# ──────────────────────────────────────────────────────────────────────────────

# ── Stage 1: dependency installation ─────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy manifests only so this layer is cached unless deps change
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Bring installed node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy full source for the build
COPY . .

# Next.js collects anonymous telemetry by default – opt out in CI/Docker
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Stage 3: runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy only what Next.js needs at runtime (standalone output or .next + public)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["npm", "start"]
