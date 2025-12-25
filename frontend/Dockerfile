FROM node:18-alpine as build

WORKDIR /app

# Set build argument
ARG REACT_APP_BACKEND_URL=http://localhost:8001
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV NODE_ENV=production

# Copy package files - handle both yarn.lock and package-lock.json
COPY package.json ./

# Check if yarn.lock exists and copy it
COPY yarn.loc[k] ./ 2>/dev/null || true

# Install dependencies - use yarn if yarn.lock exists, otherwise npm
RUN if [ -f yarn.lock ]; then \
      corepack enable && \
      corepack prepare yarn@stable --activate && \
      yarn install --frozen-lockfile; \
    else \
      npm install --force --legacy-peer-deps; \
    fi

# Copy rest of the code
COPY . .

# Build the app
RUN if [ -f yarn.lock ]; then yarn build; else npm run build; fi

# Production stage with Nginx
FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build files
COPY --from=build /app/build /usr/share/nginx/html

# Create entrypoint script inline
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'echo "Starting Nginx..."' >> /docker-entrypoint.sh && \
    echo 'exec "$@"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]