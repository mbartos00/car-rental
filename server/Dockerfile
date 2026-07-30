# syntax=docker/dockerfile:1

# --- build stage ---------------------------------------------------------
FROM node:24-bookworm-slim AS build
WORKDIR /app

# bcrypt is a native module — needs a toolchain to compile
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN yarn build

# drop dev dependencies for the runtime image (keeps the generated client)
RUN yarn install --frozen-lockfile --production && npx prisma generate

# --- runtime stage -------------------------------------------------------
FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Prisma's query engine links against libssl at runtime
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json

EXPOSE 5500
CMD ["node", "dist/main"]
