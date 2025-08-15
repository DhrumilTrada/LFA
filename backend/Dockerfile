FROM node:20-alpine

WORKDIR /app

RUN apk update && apk add rsync

COPY package*.json /app/

RUN npm install

COPY . /app/

ENV NODE_OPTIONS=--max_old_space_size=4096

RUN npm run build

# start the server
CMD ["npm", "run", "start"]
