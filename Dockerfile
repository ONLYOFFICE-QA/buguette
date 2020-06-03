FROM node:12.18.0
RUN mkdir /buguette
ADD . /buguette
RUN npm install
RUN apt update && apt install -y nginx vim

