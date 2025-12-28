# node image
FROM node:22-alpine

# set container directory
WORKDIR /app

#COPY <source> <destination>
COPY package*.json ./
RUN npm install

COPY . .

# port
EXPOSE 5000

CMD ["npm", "start"]
