FROM node:18-slim

# Install Chromium and ALL its dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    wget \
    ca-certificates \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to skip downloading Chromium and use system one
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Install server dependencies first (for Docker caching)
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --production

# Install client dependencies and build the React app
COPY client/package.json client/package-lock.json ./client/
RUN cd client && npm ci
COPY client/ ./client/
RUN cd client && npm run build

# Copy server source code
COPY server/ ./server/

# Copy root files
COPY package.json ./

# Render uses PORT env var
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server/server.js"]
