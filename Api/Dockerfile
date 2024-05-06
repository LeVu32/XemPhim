FROM node:18

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 1209

CMD ["npm", "start"]