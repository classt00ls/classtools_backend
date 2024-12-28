FROM node:22

WORKDIR /usr/src/classtools

COPY package*.json ./
RUN npm install --save --force
RUN  npm install pg --save --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "node", "dist/src/main.js" ]