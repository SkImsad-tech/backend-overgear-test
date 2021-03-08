FROM node:14.16.0

RUN mkdir /app
WORKDIR /app

COPY package.json .

RUN npm install --silent --progress=false --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]