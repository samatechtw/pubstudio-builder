#!/bin/bash

BIN_FOLDER=../target/aarch64-unknown-linux-gnu/debug
COPIED_BIN=$BIN_FOLDER/$1
ACTIVE_BIN=$BIN_FOLDER/$1-a

cp $COPIED_BIN $ACTIVE_BIN
eval $ACTIVE_BIN &

inotifywait -e close_write -m $BIN_FOLDER |
while read -r directory events filename; do
  if [ "$filename" = "$1" ]; then
    killall "$1-a"
    rm $ACTIVE_BIN
    cp $COPIED_BIN $ACTIVE_BIN
    eval $ACTIVE_BIN &
  fi
done
