# FROM docker.sfere.local/ci-images/node:22.22.0
# WORKDIR /app
# COPY . .
# RUN pnpm install
# RUN pnpm run build
# RUN cp -r dist /dist

FROM docker.sfere.local/docker-hub/alpine:3.23-linux-arm64

LABEL maintainer="zhenwei.li@sfere-elec.com"

COPY dist/ /dist