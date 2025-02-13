FROM node:20.14.0-slim@sha256:a16301294ba66d2ad22d3beded4a52720f96ab208c1db0973c034d0127a4ccb0 as build

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app
COPY package.json /app/
COPY pnpm-lock.yaml /app/
COPY pnpm-workspace.yaml /app/

COPY ./packages/agreement-event-consumer/package.json /app/packages/agreement-event-consumer/package.json
COPY ./packages/commons/package.json /app/packages/commons/package.json
COPY ./packages/kafka-connector/package.json /app/packages/kafka-connector/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY tsconfig.json /app/
COPY turbo.json /app/
COPY ./packages/agreement-event-consumer /app/packages/agreement-event-consumer
COPY ./packages/commons /app/packages/commons
COPY ./packages/kafka-connector /app/packages/kafka-connector

RUN pnpm build && \
    rm -rf /app/node_modules/.modules.yaml && \
    rm -rf /app/node_modules/.cache && \
    mkdir /out && \
    cp -a --parents -t /out \
    node_modules packages/agreement-event-consumer/node_modules \
    package*.json packages/agreement-event-consumer/package*.json \
    packages/commons \
    packages/kafka-connector \
    packages/agreement-event-consumer/dist && \
    find /out -exec touch -h --date=@0 {} \;

FROM node:20.14.0-slim@sha256:a16301294ba66d2ad22d3beded4a52720f96ab208c1db0973c034d0127a4ccb0 as final 

COPY --from=build /out /app

WORKDIR /app/packages/agreement-event-consumer

CMD [ "node", "." ]
