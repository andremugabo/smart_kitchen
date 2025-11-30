FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Build the app (if needed)
# RUN npm run build

# Expose the app port
EXPOSE 3000

# Start the app
CMD ["node", "dist/main.js"]