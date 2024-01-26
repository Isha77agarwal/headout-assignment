FROM node:slim
WORKDIR /app
COPY . /app
RUN npm install
EXPOSE 8080
CMD ["node", "--max-old-space-size=1500", "--cpu-shares=2000", "server.js"]