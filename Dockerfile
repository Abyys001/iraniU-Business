FROM node:20-bookworm-slim AS build

WORKDIR /app

# Install dependencies first for better layer caching
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN npm ci --prefix server && npm ci --include=dev --prefix client

# Copy source and build frontend
COPY . .
RUN npm run build --prefix client

FROM node:20-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Runtime app files
COPY --from=build /app/server ./server
COPY --from=build /app/client/dist ./client/dist

# SQLite data path persistence
VOLUME ["/app/server/data"]

EXPOSE 3001
CMD ["npm", "start", "--prefix", "server"]
