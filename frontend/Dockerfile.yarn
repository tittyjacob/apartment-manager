FROM node:18-alpine as build

WORKDIR /app

# Set build argument
ARG REACT_APP_BACKEND_URL=http://localhost:8001
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV NODE_ENV=production

# Copy package files
COPY package.json ./
COPY yarn.lock ./

# Install yarn and dependencies
RUN corepack enable && \
    corepack prepare yarn@stable --activate && \
    yarn install --frozen-lockfile

# Copy rest of the code
COPY . .

# Build the app
RUN yarn build

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