FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY entrypoint.sh .

EXPOSE 3030

COPY . .


ENTRYPOINT ["./entrypoint.sh"]
