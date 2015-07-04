#!/bin/bash

if [ -z "$1" ]; then
  parse deploy
else
  for var in "$@"; do
    if [ "$var" == "all" ]; then
      parse deploy dev
      parse deploy release
    else
      parse deploy $var
    fi
  done
fi
