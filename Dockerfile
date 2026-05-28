# ── Stage: production image ──────────────────────────────────────────────────
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (layer-cached unless package files change)
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source
COPY . .

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
