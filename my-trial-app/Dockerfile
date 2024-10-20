FROM node:latest
# Install telnet or any other tools you need
RUN apt-get update && apt-get install -y telnet

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npx","nodemon","server.js"]