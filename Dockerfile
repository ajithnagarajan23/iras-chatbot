FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN rm -f .env
EXPOSE 3000
CMD ["node", "api/main.js"]