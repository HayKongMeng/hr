FROM node:20 AS builder

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/standalone ./standalone

EXPOSE 3000

CMD ["npm", "run", "start"]