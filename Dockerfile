### STAGE 1: Build ###
FROM node:16.1.0-alpine AS build

ENV NODE_OPTIONS=--max-old-space-size=1024
WORKDIR /buguette
COPY package*.json ./
RUN npm install
COPY . .

