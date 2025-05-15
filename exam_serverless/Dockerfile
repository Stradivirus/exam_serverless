FROM golang:1.23 AS builder

WORKDIR /app

COPY GCP/go.mod ./
COPY GCP/go.sum ./

RUN go mod download

COPY GCP/ .

RUN go build -o exam_serverless .

FROM gcr.io/distroless/base

COPY --from=builder /app/exam_serverless /exam_serverless

CMD ["/exam_serverless"]