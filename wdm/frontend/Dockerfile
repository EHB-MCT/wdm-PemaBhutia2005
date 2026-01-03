FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev

COPY . .

# vite port
EXPOSE 5173

CMD ["npm", "run", "start"]
