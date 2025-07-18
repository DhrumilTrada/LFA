FROM node:20-bookworm

# RUN npm install --global rimraf && npm install --global parcel-bundler

WORKDIR /nestjs-base-project

RUN apt-get update && apt-get install rsync -y

COPY package*.json /nestjs-base-project

RUN npm install

COPY . /nestjs-base-project

ENV NODE_OPTIONS=--max_old_space_size=4096

RUN npm run build

# start the server
CMD ["npm", "run", "start"]
