### STAGE 1: Build ###
FROM node:12.7-alpine AS build
WORKDIR /buguette
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .

