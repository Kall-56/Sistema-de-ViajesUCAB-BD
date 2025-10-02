FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@8
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next .next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
RUN npm install -g pnpm@8 && pnpm install --prod --frozen-lockfile
EXPOSE 3000
CMD ["pnpm", "start"]
