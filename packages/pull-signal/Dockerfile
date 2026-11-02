ARG NODE_REGISTRY="docker.io"

FROM ${NODE_REGISTRY}/node:24.22.1-slim@sha256:be8204d4bd327363357f532187b752ff62759c31bedf98e9e18fc08c9cbd605c AS build

RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc /app/

COPY ./packages/pull-signal/package.json /app/packages/pull-signal/package.json
COPY ./packages/commons/package.json /app/packages/commons/package.json
COPY ./packages/tsrest-openapi-parser/package.json /app/packages/tsrest-openapi-parser/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY tsconfig.json /app/
COPY turbo.json /app/
COPY ./packages/pull-signal /app/packages/pull-signal
COPY ./packages/commons /app/packages/commons
COPY ./packages/tsrest-openapi-parser /app/packages/tsrest-openapi-parser

RUN pnpm build && \
  rm -rf /app/node_modules/.modules.yaml && \
  rm -rf /app/node_modules/.cache && \
  mkdir /out && \
  cp -a --parents -t /out \
  node_modules packages/pull-signal/node_modules \
  package*.json packages/pull-signal/package*.json \
  packages/commons \
  packages/tsrest-openapi-parser \
  packages/pull-signal/dist && \
  find /out -exec touch -h --date=@0 {} \;

FROM ${NODE_REGISTRY}/node:24.22.1-slim@sha256:be8204d4bd327363357f532187b752ff62759c31bedf98e9e18fc08c9cbd605c AS final 

COPY --from=build /out /app

RUN groupadd -r app && useradd -rm -g app app
RUN chown -R app:app /app && chmod -R 700 /app
USER app

WORKDIR /app/packages/pull-signal
EXPOSE 8088

CMD [ "node", "." ]
