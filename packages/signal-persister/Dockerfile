ARG NODE_REGISTRY="docker.io"

FROM ${NODE_REGISTRY}/node:20.14.0@sha256:02cd2205818f121c13612721876f28c18bd50148bb8af532ea121c96ffcb59bf AS build

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app
COPY package.json /app/
COPY pnpm-lock.yaml /app/
COPY pnpm-workspace.yaml /app/

COPY ./packages/signal-persister/package.json /app/packages/signal-persister/package.json
COPY ./packages/commons/package.json /app/packages/commons/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY tsconfig.json /app/
COPY turbo.json /app/
COPY ./packages/signal-persister /app/packages/signal-persister
COPY ./packages/commons /app/packages/commons

RUN pnpm build && \
  rm -rf /app/node_modules/.modules.yaml && \
  rm -rf /app/node_modules/.cache && \
  mkdir /out && \
  cp -a --parents -t /out \
  node_modules packages/signal-persister/node_modules \
  package*.json packages/signal-persister/package*.json \
  packages/commons \
  packages/signal-persister/dist && \
  find /out -exec touch -h --date=@0 {} \;

FROM ${NODE_REGISTRY}/node:20.14.0@sha256:02cd2205818f121c13612721876f28c18bd50148bb8af532ea121c96ffcb59bf AS final 

COPY --from=build /out /app

RUN groupadd -r app && useradd -rm -g app app
RUN chown -R app:app /app && chmod -R 700 /app
USER app

WORKDIR /app/packages/signal-persister
EXPOSE 8088

CMD [ "node", "." ]
