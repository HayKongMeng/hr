FROM node:20

WORKDIR /app

COPY package*.json ./

# Install all dependencies (including dev, needed for build)
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
