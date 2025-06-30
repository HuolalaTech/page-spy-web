FROM golang:1.23 AS backend
WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/. .
RUN go build -o main .

FROM debian:bullseye-slim
WORKDIR /app
COPY --from=backend /app/main /app/main
CMD ["/app/main"]
