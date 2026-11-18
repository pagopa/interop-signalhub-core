ARG NODE_REGISTRY="docker.io"

FROM ${NODE_REGISTRY}/node:24.22.1-slim@sha256:be8204d4bd327363357f532187b752ff62759c31bedf98e9e18fc08c9cbd605c AS build

RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc /app/

COPY ./packages/purpose-event-consumer/package.json /app/packages/purpose-event-consumer/package.json
COPY ./packages/commons/package.json /app/packages/commons/package.json
COPY ./packages/kafka-connector/package.json /app/packages/kafka-connector/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY tsconfig.json /app/
COPY turbo.json /app/
COPY ./packages/purpose-event-consumer /app/packages/purpose-event-consumer
COPY ./packages/commons /app/packages/commons
COPY ./packages/kafka-connector /app/packages/kafka-connector

RUN pnpm build && \
    rm -rf /app/node_modules/.modules.yaml && \
    rm -rf /app/node_modules/.cache && \
    mkdir /out && \
    cp -a --parents -t /out \
    node_modules packages/purpose-event-consumer/node_modules \
    package*.json packages/purpose-event-consumer/package*.json \
    packages/commons \
    packages/kafka-connector \
    packages/purpose-event-consumer/dist && \
    find /out -exec touch -h --date=@0 {} \;

FROM ${NODE_REGISTRY}/node:24.22.1-slim@sha256:be8204d4bd327363357f532187b752ff62759c31bedf98e9e18fc08c9cbd605c AS final 

COPY --from=build /out /app

RUN groupadd -r app && useradd -rm -g app app
RUN chown -R app:app /app && chmod -R 700 /app
USER app

WORKDIR /app/packages/purpose-event-consumer

CMD [ "node", "." ]
