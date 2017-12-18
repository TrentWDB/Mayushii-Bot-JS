#!/bin/bash

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd $DIR

PIDFILE="pid.txt"
PID=$(<"$PIDFILE")

if ps -p $PID
then
    exit
fi

PATHSFILE="paths.txt"
PATHS=$(<"$PATHSFILE")

git pull origin master
npm install
npm start $PATHS