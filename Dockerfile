FROM node:alpine
RUN apk add  --no-cache ffmpeg bash

WORKDIR /usr/local/src

# Custom Builds go here
RUN npm install -g fluent-ffmpeg


# Make sure Node.js is installed
RUN           node -v
RUN           npm -v

#Create app dir
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

#Install Dependencies
COPY package.json /usr/src/app
RUN npm install

#Bundle app source
COPY . /usr/src/app

EXPOSE 5000
CMD [ "node", "app.js" ]
