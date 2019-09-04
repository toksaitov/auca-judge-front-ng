FROM node:10.16.3-buster-slim

EXPOSE 4112
WORKDIR /react-redux-front

COPY package.json /react-redux-front
RUN npm install

COPY . /react-redux-front

CMD ["npm", "start"]
