FROM node:18-alpine as build

WORKDIR /app

# Set build argument
ARG REACT_APP_BACKEND_URL=http://localhost:8001
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Copy package manager lock files (if they exist)
COPY package.json yarn.lock* package-lock.json* ./

# Enable yarn via corepack
RUN corepack enable && corepack prepare yarn@stable --activate

# Install dependencies (yarn will use yarn.lock if it exists)
RUN yarn install --frozen-lockfile || yarn install || npm install --force

# Copy source code
COPY . .

# Build
RUN yarn build

# Production stage
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]