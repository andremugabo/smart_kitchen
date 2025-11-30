FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --production

# Copy app source
COPY . .

# Build the app
RUN yarn build

# Expose the app port
EXPOSE 3000

# Start the app
CMD ["yarn", "start:prod"]
