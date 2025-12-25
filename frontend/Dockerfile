FROM node:18-alpine as build

WORKDIR /app

# Set build argument
ARG REACT_APP_BACKEND_URL=http://localhost:8001
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV NODE_ENV=production

# Copy all package manager files
COPY package*.json ./
COPY yarn.loc* ./

# Install dependencies with yarn (handles resolutions for ajv fix)
RUN corepack enable && \
    corepack prepare yarn@stable --activate && \
    yarn install || npm install --force --legacy-peer-deps

# Copy rest of the code
COPY . .

# Build the app
RUN yarn build || npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build files
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]