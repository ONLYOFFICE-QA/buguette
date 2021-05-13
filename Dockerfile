### STAGE 1: Build ###
FROM node:12.14-alpine AS build

ENV NODE_OPTIONS=--max-old-space-size=1024
WORKDIR /buguette
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .

