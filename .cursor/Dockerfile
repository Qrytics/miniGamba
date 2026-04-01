FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Core tooling, native build prerequisites, and Electron/Playwright runtime deps
RUN apt-get update && apt-get install -y --no-install-recommends \
  ca-certificates \
  curl \
  git \
  gnupg \
  build-essential \
  python3 \
  pkg-config \
  xvfb \
  libnss3 \
  libnspr4 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libdbus-1-3 \
  libxcb1 \
  libxkbcommon0 \
  libx11-6 \
  libxcomposite1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libpango-1.0-0 \
  libcairo2 \
  libasound2t64 \
  libatspi2.0-0 \
  libwayland-client0 \
  libgtk-3-0 \
  libxshmfence1 \
  fonts-liberation \
  xauth \
  && rm -rf /var/lib/apt/lists/*

# Node.js 22.x + npm
RUN install -m 0755 -d /etc/apt/keyrings \
  && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
  | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
  && chmod a+r /etc/apt/keyrings/nodesource.gpg \
  && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" \
  > /etc/apt/sources.list.d/nodesource.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends nodejs \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
