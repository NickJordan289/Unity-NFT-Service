FROM node:19.0.0-alpine3.16

#Create app directory
RUN mkdir -p /srv/app/server
WORKDIR /srv/app/server

COPY package.json /srv/app/server

RUN yarn install

COPY . /srv/app/server

CMD ["node", "index.js"]