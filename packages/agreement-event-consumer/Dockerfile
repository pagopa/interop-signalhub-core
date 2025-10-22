ARG NODE_REGISTRY="docker.io"

FROM ${NODE_REGISTRY}/node:20.19.4-slim@sha256:ef358d9fa0734e2c3b42482aa352c28a59245bc3d32e07ef57810cf8ba9092c5 AS build

RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc /app/

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

FROM ${NODE_REGISTRY}/node:20.19.4-slim@sha256:ef358d9fa0734e2c3b42482aa352c28a59245bc3d32e07ef57810cf8ba9092c5 AS final 

COPY --from=build /out /app

RUN groupadd -r app && useradd -rm -g app app
RUN chown -R app:app /app && chmod -R 700 /app
USER app

WORKDIR /app/packages/agreement-event-consumer

CMD [ "node", "." ]
