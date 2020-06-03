FROM node:12.18.0
RUN mkdir /bugboard
ADD . /bugboard
RUN npm install

