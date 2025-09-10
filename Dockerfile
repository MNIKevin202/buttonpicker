# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose port 3117
EXPOSE 3117

# Set environment variable for port
ENV PORT=3117

# Start the application
CMD ["npm", "start"]
