FROM node:18-alpine as build

WORKDIR /app

# Set build argument
ARG REACT_APP_BACKEND_URL=http://localhost:8001
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Copy everything (package.json, yarn.lock, source code)
COPY . .

# Enable yarn
RUN corepack enable && corepack prepare yarn@stable --activate

# Install dependencies
RUN yarn install --frozen-lockfile || yarn install

# Build
RUN yarn build

# Production stage
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]