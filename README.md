### Setup

Normal:

1. create secret.txt and paste your bot's secret key inside
2. npm install
3. npm start [/optional/path/sound/clip/folder] [/you/can/have/multiple]

Cron job:

1. create secret.txt and paste your bot's secret key inside
2. create paths.txt to be [/optional/path/sound/clip/folder] [/you/can/have/multiple]
3. so the contents will look like this:

  /optional/path/sound/clip/folder /you/can/have/multiple

4. it should all be on one line
5. set up your cron job to run the continuous.sh scriptevery minute or something
6. if mayushii ever crashes it will start again

Note: Probably requires ECMAScript 6.