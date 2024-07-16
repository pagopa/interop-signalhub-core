#!/usr/bin/env sh

set -o errexit
set -o nounset
set -o pipefail

# Function to be executed upon receiving EXIT
cleanup() {
    echo "Caught EXIT. Cleaning up..."
    kill $pid1 # Terminate server process
    exit
}

# Set up the trap
trap cleanup EXIT

# Start push service in the background
pnpm start:pull &
pid1=$! # Get the process ID of the last backgrounded command

# Wait indefinitely. The cleanup function will handle interruption and cleanup.
wait
