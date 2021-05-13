### STAGE 1: Build ###
FROM node:12.14-alpine AS build
WORKDIR /buguette
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .

