FROM node:18-alpine as build

WORKDIR /app

# Accept build arguments
ARG REACT_APP_BACKEND_URL=http://localhost:8001

# Set environment variable
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Copy package files
COPY package.json ./
COPY yarn.lock* ./

# Install dependencies
RUN if [ -f yarn.lock ]; then \
      yarn install --frozen-lockfile; \
    else \
      yarn install; \
    fi

# Copy application code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Add script to inject runtime env variables
RUN apk add --no-cache bash
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]