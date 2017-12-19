const fs = require('fs');
const path = require('path');
const MayushiiFunctions = require('./MayushiiFunctions.js');

const FILE_TYPES = ['mp3', 'wav'];

let MayushiiProcessor = class MayushiiProcessor {
    static initialize(client, folders) {
        MayushiiProcessor._client = client;

        for (let i = 0; i < folders.length; i++) {
            MayushiiProcessor._folders.push(path.resolve(folders[i]));
        }
    }

    static removeMessages(guild) {
        console.log('Will remove messages in ' + guild.name + '.');
        MayushiiProcessor._guildIDToRemoveMessages[guild.id] = true;
    }

    static shouldRemoveMessages(guild) {
        return !!MayushiiProcessor._guildIDToRemoveMessages[guild.id];
    }

    static join(voiceChannel) {
        voiceChannel.join().then(() => {
            MayushiiProcessor.tuturu(voiceChannel);
        });
    }

    static play(voiceChannel, sound) {
        let guildNames = [voiceChannel.guild.name, null];
        for (let i = 0; i < guildNames.length; i++) {
            let guildName = guildNames[i];
            let guildNamePart = guildName ? guildName + '/' : '';

            for (let a = 0; a < FILE_TYPES.length; a++) {
                let type = FILE_TYPES[a];

                for (let b = 0; b < MayushiiProcessor._folders.length; b++) {
                    let folder = MayushiiProcessor._folders[b];
                    let absolutePath = path.resolve(folder + '/' + guildNamePart + sound + '.' + type);

                    if (fs.existsSync(absolutePath)) {
                        if (MayushiiProcessor._isValidFile(absolutePath)) {
                            MayushiiProcessor._play(voiceChannel, absolutePath);
                            return;
                        }
                    }
                }
            }
        }
    }

    static tuturu(voiceChannel, tuturuType) {
        if (!tuturuType) {
            MayushiiProcessor._play(voiceChannel, 'assets/tuturus/tuturu.mp3');
            return;
        }

        MayushiiProcessor._play(voiceChannel, 'assets/tuturus/tuturu-' + tuturuType + '.mp3');
    }

    static stop(voiceChannel) {
        if (MayushiiProcessor._guildIDDispatchers[voiceChannel.guild.id]) {
            MayushiiProcessor._guildIDDispatchers[voiceChannel.guild.id].pause();
        }
    }

    static kill(user) {
        if (MayushiiFunctions.isGod(user)) {
            process.exit(0);
        }
    }

    static volume(user, message, volume) {
        let guild = message.guild;
        if (!guild) {
            message.reply('You need to tell me this in a server!');
            return;
        }

        if (volume < 0 || volume > 1) {
            volume = Math.min(1, Math.max(0, volume));
            message.reply('That volume wasn\'t between 0 and 1! I set it to ' + volume + '.');
        } else {
            message.reply('I set my volume to ' + volume + '!');
        }

        MayushiiProcessor._guildIDToVolume[guild.id] = volume;
    }

    static _play(voiceChannel, file) {
        let absolutePath = path.resolve(file);

        if (!MayushiiProcessor._isValidFile(absolutePath)) {
            return;
        }

        if (MayushiiProcessor._guildIDDispatchers[voiceChannel.guild.id]) {
            MayushiiProcessor._guildIDDispatchers[voiceChannel.guild.id].pause();
        }

        voiceChannel.guild.fetchMember(MayushiiProcessor._client.user).then(clientGuildMember => {
            let playFile = (connection, absolutePath) => {
                let volume = MayushiiProcessor._guildIDToVolume[voiceChannel.guild.id] || 1;

                MayushiiProcessor._guildIDDispatchers[voiceChannel.guild.id] = voiceChannel.connection.playFile(absolutePath);
                MayushiiProcessor._guildIDDispatchers[voiceChannel.guild.id].setVolume(volume);
                MayushiiProcessor._guildIDDispatchers[voiceChannel.guild.id].on('start', () => {
                    voiceChannel.connection.player.streamingData.pausedTime = 0;
                });
            };

            let foundInChannel = false;
            for (let i = 0; i < voiceChannel.members.length; i++) {
                let guildMember = voiceChannel.members[i];
                if (guildMember === clientGuildMember) {
                    foundInChannel = true;
                    break;
                }
            }

            if (!foundInChannel) {
                voiceChannel.join().then(connection => {
                    playFile(connection, absolutePath);
                });

                return;
            }

            playFile(voiceChannel.connection, absolutePath);
        });
    }

    static _isValidFile(file) {
        let absolutePath = path.resolve(file);

        for (let i = 0; i < MayushiiProcessor._folders.length; i++) {
            let folder = MayushiiProcessor._folders[i];

            if (absolutePath.startsWith(folder)) {
                return true;
            }
        }

        return false;
    }
};

MayushiiProcessor._client = null;
MayushiiProcessor._folders = [path.resolve('assets/tuturus')];
MayushiiProcessor._guildIDDispatchers = {};
MayushiiProcessor._guildIDToRemoveMessages = {};
MayushiiProcessor._guildIDToVolume = {};

module.exports = MayushiiProcessor;