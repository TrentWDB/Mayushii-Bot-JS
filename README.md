### Setup

Normal:

1. npm install
2. npm start [/optional/path/sound/clip/folder] [/you/can/have/multiple]

Cron job:

1. edit paths.txt to be [/optional/path/sound/clip/folder] [/you/can/have/multiple]
2. so the contents will look like this:

  /optional/path/sound/clip/folder /you/can/have/multiple

3. it should all be on one line
4. set up your cron job to run the continuous.sh scriptevery minute or something
5. if mayushii ever crashes it will start again

Note: Probably requires ECMAScript 6.