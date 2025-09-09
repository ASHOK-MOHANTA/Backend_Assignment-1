# -----------------------------
# Base Image
# -----------------------------
FROM node:18-alpine

# -----------------------------
# Set Working Directory
# -----------------------------
WORKDIR /usr/src/app

# -----------------------------
# Install Dependencies
# -----------------------------
COPY package*.json ./
RUN npm ci --only=production

# -----------------------------
# Copy Application Code
# -----------------------------
COPY . .

# -----------------------------
# Expose Port
# -----------------------------
EXPOSE 4000

# -----------------------------
# Start Application
# -----------------------------
CMD ["node", "server.js"]
