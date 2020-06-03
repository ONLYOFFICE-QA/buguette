### STAGE 1: Build ###
FROM node:12.7-alpine AS build
WORKDIR /buguette
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

### STAGE 2: Run ###
# FROM nginx:1.17.1-alpine
# COPY --from=build ./dist /usr/share/nginx/html
