FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy server package scripts for caching dependencies
COPY server/package*.json ./

# Install server dependencies
RUN npm install

# Copy all server code over
COPY server/ .

# Hugging Face Spaces routes web traffic dynamically via PORT (usually 7860).
EXPOSE 7860

CMD [ "node", "index.js" ]
