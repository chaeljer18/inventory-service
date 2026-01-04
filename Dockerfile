FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Expose port 9697 instead of 3001
EXPOSE 9697

# Set production environment
ENV NODE_ENV=production
ENV PORT=9697

CMD ["npm", "start"]