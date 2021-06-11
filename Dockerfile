FROM node:12.22.1-alpine3.10

RUN apk add --no-cache python2 build-base

COPY ./federator /app/federator

RUN chown -R node:node /app
USER node
WORKDIR /app/federator

RUN npm install

ENTRYPOINT [ "npm", "start" ]