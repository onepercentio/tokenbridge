#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the ganache instance that we started (if we started one and if it's still running).
  if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
    kill -9 $ganache_pid
    echo "Instance killed"
  fi
}

ganache_port=8545

ganache_running() {
  nc -z localhost "$ganache_port"
}

start_ganache() {
    node_modules/.bin/ganache-cli --accounts=10 -l 8000000 --mnemonic="day behind kiss talent bonus unfold expire hidden sorry culture collect layer" --defaultBalanceEther=1000000 > /dev/null &
    ganache_pid=$!
}

if ganache_running; then
    echo "Killing existing ganache instance"
    cleanup
fi

echo "Starting our own ganache instance"
start_ganache
node_modules/.bin/truffle test "$@" --verbose --show-events --compile-none
