FROM node:20.14.0-slim@sha256:a16301294ba66d2ad22d3beded4a52720f96ab208c1db0973c034d0127a4ccb0 as build

RUN corepack enable

WORKDIR /app
COPY package.json /app/
COPY pnpm-lock.yaml /app/
COPY pnpm-workspace.yaml /app/

COPY ./packages/batch-update/package.json /app/packages/batch-update/package.json
COPY ./packages/commons/package.json /app/packages/commons/package.json
COPY ./packages/interop-client/package.json /app/packages/interop-client/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY tsconfig.json /app/
COPY turbo.json /app/
COPY ./packages/batch-update /app/packages/batch-update
COPY ./packages/commons /app/packages/commons
COPY ./packages/interop-client /app/packages/interop-client

RUN pnpm build && \
    rm -rf /app/node_modules/.modules.yaml && \
    rm -rf /app/node_modules/.cache && \
    mkdir /out && \
    cp -a --parents -t /out \
      node_modules packages/batch-update/node_modules \
      package*.json packages/batch-update/package*.json \
      packages/commons \
      packages/interop-client \
      packages/batch-update/dist && \
    find /out -exec touch -h --date=@0 {} \;

FROM node:20.14.0-slim@sha256:a16301294ba66d2ad22d3beded4a52720f96ab208c1db0973c034d0127a4ccb0 as final 

COPY --from=build /out /app

WORKDIR /app/packages/batch-update

CMD [ "node", "." ]
