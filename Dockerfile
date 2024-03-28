FROM golang:1.20-buster AS backend
WORKDIR /app
RUN apk add --no-cache \
    gcc \
    musl-dev
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/. .
RUN go build -ldflags "-linkmode external -extldflags -static"  -o main .

FROM debian:bullseye-slim
WORKDIR /app
COPY --from=backend /app/main /app/main
CMD ["/app/main"]
