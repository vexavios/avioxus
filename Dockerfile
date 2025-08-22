# Use chosen Node.js version
FROM node:23-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Start the application
CMD ["npm", "start"]
