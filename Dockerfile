
FROM golang:1.20-buster AS backend

WORKDIR /app
COPY backend/go.mod backend/go.sum ./

RUN go mod download

COPY backend/. .
ARG VERSION=unknown
ARG COMMIT=unknown
RUN go build -ldflags="-X main.Version=$VERSION -X main.GitHash=$COMMIT" -o main . 

FROM debian:bullseye-slim
WORKDIR /app
COPY --from=backend /app/main /app/main
CMD ["/app/main"]
