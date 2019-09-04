FROM node:10.16.3-buster-slim

EXPOSE 8085
WORKDIR /auca-judge-front-ng

COPY package.json /auca-judge-front-ng
RUN npm install

COPY . /auca-judge-front-ng

CMD ["npm", "start"]
