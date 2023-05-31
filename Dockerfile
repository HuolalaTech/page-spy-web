FROM node:19-buster AS frontend
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN npm run build:client

FROM golang:1.20-buster AS backend
WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/. .
COPY --from=frontend /app/dist /app/dist
RUN go build -o main .

FROM debian:bullseye-slim
WORKDIR /app
COPY --from=backend /app/main /app/main
CMD ["/app/main"]
