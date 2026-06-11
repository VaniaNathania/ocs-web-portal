FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

ARG APP_ENV=production
ENV APP_ENV=$APP_ENV

RUN echo "APP_ENV=$APP_ENV"
RUN npm run build:$APP_ENV


FROM node:22-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]