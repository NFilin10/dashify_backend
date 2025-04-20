FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install --force

COPY . .

EXPOSE 8080

CMD ["node", "src/server.js"]
