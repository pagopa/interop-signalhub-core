#!/usr/bin/env sh

set -o errexit
set -o nounset
set -o pipefail

# Function to be executed upon receiving EXIT
cleanup() {
    echo "Caught EXIT. Cleaning up..."
    kill $pid1 $pid2 # Terminates both server processes
    exit
}

# Set up the trap
trap cleanup EXIT

# Start push service in the background
pnpm start:push-signals &
pid1=$! # Get the process ID of the last backgrounded command

# Start persister service in the background
pnpm start:persister &
pid2=$! # Get the process ID of the last backgrounded command

# Wait indefinitely. The cleanup function will handle interruption and cleanup.
wait
