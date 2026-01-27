FROM node:24.13.0-alpine 

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

COPY prisma ./prisma/

RUN yarn install --frozen-lockfile

RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["yarn", "dev"]
