#!/bin/bash

pidfile="pid.txt"
pid=$(<"$pidfile")

if ps -p $pid
then
    exit
fi

pathsfile="paths.txt"
paths=$(<"$pathsfile")

git pull origin master
npm install
npm start $paths