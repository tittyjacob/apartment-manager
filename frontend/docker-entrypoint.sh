#!/bin/bash

# Replace env vars in JavaScript files
echo "Injecting runtime environment variables..."

# Create env-config.js with runtime variables
cat <<EOF > /usr/share/nginx/html/env-config.js
window.ENV = {
  REACT_APP_BACKEND_URL: "${REACT_APP_BACKEND_URL:-http://localhost:8001}"
};
EOF

echo "Environment variables injected successfully"

# Execute the main command
exec "$@"
