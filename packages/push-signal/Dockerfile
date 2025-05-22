ARG NODE_REGISTRY="docker.io"

FROM ${NODE_REGISTRY}/node:20.14.0@sha256:02cd2205818f121c13612721876f28c18bd50148bb8af532ea121c96ffcb59bf AS build

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app
COPY package.json /app/
COPY pnpm-lock.yaml /app/
COPY pnpm-workspace.yaml /app/

COPY ./packages/push-signal/package.json /app/packages/push-signal/package.json
COPY ./packages/commons/package.json /app/packages/commons/package.json
COPY ./packages/tsrest-openapi-parser/package.json /app/packages/tsrest-openapi-parser/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY tsconfig.json /app/
COPY turbo.json /app/
COPY ./packages/push-signal /app/packages/push-signal
COPY ./packages/commons /app/packages/commons
COPY ./packages/tsrest-openapi-parser /app/packages/tsrest-openapi-parser

RUN pnpm build && \
  rm -rf /app/node_modules/.modules.yaml && \
  rm -rf /app/node_modules/.cache && \
  mkdir /out && \
  cp -a --parents -t /out \
  node_modules packages/push-signal/node_modules \
  package*.json packages/push-signal/package*.json \
  packages/commons \
  packages/tsrest-openapi-parser \
  packages/push-signal/dist && \
  find /out -exec touch -h --date=@0 {} \;

FROM ${NODE_REGISTRY}/node:20.14.0@sha256:02cd2205818f121c13612721876f28c18bd50148bb8af532ea121c96ffcb59bf AS final 

COPY --from=build /out /app

RUN groupadd -r app && useradd -rm -g app app
RUN chown -R app:app /app && chmod -R 700 /app
USER app

WORKDIR /app/packages/push-signal
EXPOSE 8088

CMD [ "node", "." ]
