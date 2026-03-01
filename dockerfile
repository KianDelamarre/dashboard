FROM node:20

WORKDIR /app

# Install PM2 globally
RUN npm install -g pm2

# Copy backend & frontend
COPY backend ./backend
COPY frontend ./frontend

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Optionally install frontend dependencies if needed
# WORKDIR /app/frontend
# RUN npm install

# Back to root
WORKDIR /app

# Copy PM2 config
COPY processes.json .

EXPOSE 4001 3000

CMD ["pm2-runtime", "processes.json"]