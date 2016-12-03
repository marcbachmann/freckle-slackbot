FROM mhart/alpine-node:6

ADD . /app
WORKDIR /app
RUN npm install

CMD ["npm", "start"]
