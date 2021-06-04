### STAGE 1: Build ###
FROM node:16.3.0-alpine AS build

RUN apk update && \
    apk upgrade && \
    apk add --no-cache git
ENV NODE_OPTIONS=--max-old-space-size=1024
WORKDIR /buguette
COPY . .
RUN npm install
