# 1단계: 빌드
FROM golang:1.23 as builder

WORKDIR /app

# go.mod, go.sum 복사 및 의존성 설치
COPY go.mod go.sum ./
RUN go mod download

# 소스 코드 복사
COPY . .

# 빌드
RUN CGO_ENABLED=0 GOOS=linux go build -o server .

# 2단계: 실행 (distroless)
FROM gcr.io/distroless/base-debian12

WORKDIR /app

COPY --from=builder /app/server .

# 환경변수 주입 (Cloud Run, 도커 run, github actions에서 사용)
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

EXPOSE 8080

CMD ["./server"]