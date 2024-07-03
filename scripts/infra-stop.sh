#!/usr/bin/env sh

set -o errexit
set -o nounset
set -o pipefail

__dir="$(cd "$(dirname "$0")" && pwd)"
docker compose -f $__dir/../docker/docker-compose.yml stop
