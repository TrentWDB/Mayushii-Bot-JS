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
        MayushiiProcessor._guildToRemoveMessages[guild] = true;
    }

    static join(voiceChannel) {
        voiceChannel.join().then(() => {
            MayushiiProcessor.tuturu(voiceChannel);
        });
    }

    static play(voiceChannel, sound) {
        for (let i = 0; i < FILE_TYPES.length; i++) {
            let type = FILE_TYPES[i];

            for (let a = 0; a < MayushiiProcessor._folders.length; a++) {
                let folder = MayushiiProcessor._folders[a];
                let absolutePath = path.resolve(folder + '/' + sound + '.' + type);

                if (fs.existsSync(absolutePath)) {
                    if (MayushiiProcessor._isValidFile(absolutePath)) {
                        MayushiiProcessor._play(voiceChannel, absolutePath);
                        return;
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
        if (voiceChannel.connection && voiceChannel.connection.dispatcher) {
            voiceChannel.connection.dispatcher.end();
        }
    }

    static _play(voiceChannel, file) {
        let absolutePath = path.resolve(file);

        if (!MayushiiProcessor._isValidFile(absolutePath)) {
            return;
        }

        if (voiceChannel.connection && voiceChannel.connection.dispatcher) {
            voiceChannel.connection.dispatcher.end();
        }

        voiceChannel.guild.fetchMember(MayushiiProcessor._client.user).then(clientGuildMember => {
            let foundInChannel = false;

            for (let i = 0; i < voiceChannel.members.length; i++) {
                let guildMember = voiceChannel.members[i];
                if (guildMember === clientGuildMember) {
                    foundInChannel = true;
                    break;
                }
            }

            if (!foundInChannel) {
                voiceChannel.join().then(() => {
                    voiceChannel.connection.playFile(absolutePath);
                });

                return;
            }

            voiceChannel.connection.playFile(absolutePath);
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
MayushiiProcessor._guildToRemoveMessages = {};

module.exports = MayushiiProcessor;