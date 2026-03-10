FROM node:20-alpine AS base
WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
COPY data ./data

RUN npm run build

EXPOSE 8787
CMD ["npm", "run", "start"]
