const fs = require('fs');
const Discord = require('discord.js');
const Permissions = Discord.Permissions;
const client = new Discord.Client();
const MayushiiProcessor = require('./MayushiiProcessor.js');

const COMMAND_INDICATORS = {'~': true, '?': true};

// login
let token = fs.readFileSync('secret.txt', 'utf8');
if (!token) {
    throw new Error('Can not read token from file secret.txt.');
} else {
    console.log('Secret token has been read.');
    console.log('Logging in...');
}

client.login(token);

// location folders
let folders = [];
for (let i = 2; i < process.argv.length; i++) {
    let arg = process.argv[i];
    folders.push(arg);
}

// initialize
MayushiiProcessor.initialize(client, folders);

client.on('ready', () => {
    console.log('Logged in.');
    if (process.pid) {
        console.log('Writing PID to pid.txt...');
        fs.writeFile('pid.txt', '' + process.pid, 'utf8', () => {
            console.log('Done writing PID.');
        });
    } else {
        console.log('Cannot find PID of Mayushii.');
    }

    client.guilds.forEach(guild => {
        // remove message from server if have permission
        guild.fetchMember(client.user).then(guildMember => {
            if (guildMember.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES)) {
                MayushiiProcessor.removeMessages(guild);
            }
        });
    });
});

client.on('error', error => {
    console.error('Error! ', error);
    process.exit(1);
});

client.on('voiceStateUpdate', (oldGuildMember, newGuildMember) => {
    // leave the voice channel if everyone else has
    let guild = (oldGuildMember || newGuildMember).guild;
    if (guild) {
        guild.fetchMember(client.user).then(guildMember => {
            let clientVoiceChannel = guildMember.voiceChannel;
            if (clientVoiceChannel) {
                if (clientVoiceChannel.members.array().length === 1) {
                    clientVoiceChannel.leave();
                }
            }
        });
    }

    // play audio clip
    let voiceChannel = newGuildMember.voiceChannel;
    if (!voiceChannel) {
        return;
    }

    // the event wasn't a channel change event
    if (oldGuildMember.voiceChannel && newGuildMember.voiceChannel.id === oldGuildMember.voiceChannel.id) {
        return;
    }

    MayushiiProcessor.play(voiceChannel, newGuildMember.nickname || newGuildMember.user.username);
});

client.on('message', message => {
    if (message.content.toLowerCase().includes('mayushii') || message.content.toLowerCase().includes('tuturu')) {
        message.react('❤');
    }

    // this is not a command for mayu
    if (message.content.length === 0 || !COMMAND_INDICATORS[message.content.charAt(0)]) {
        return;
    }

    let messageParts = message.content.substr(1).toLowerCase().split(' ');
    if (messageParts.length === 0) {
        return;
    }

    // if (MayushiiProcessor.shouldRemoveMessages(message.guild)) {
    //     message.delete();
    // }
    message.delete();

    let commandSwitch = (voiceChannel, messageParts) => {
        let command = messageParts[0];
        switch (command) {
            case 'join': {
                MayushiiProcessor.join(voiceChannel);

                break;
            }

            case 'tuturu': {
                MayushiiProcessor.tuturu(voiceChannel, messageParts[1]);

                break;
            }

            case 'stop': {
                MayushiiProcessor.stop(voiceChannel);

                break;
            }

            case 'volume': {
                let volume = 1;
                try {
                    volume = Number.parseFloat(messageParts[1]);
                } catch (error) {
                    message.reply('I couldn\'t read the volume from your message!');
                    return;
                }

                MayushiiProcessor.volume(message.author, message, volume);

                break;
            }

            case 'byebye': {
                MayushiiProcessor.kill(message.author);

                break;
            }

            default: {
                MayushiiProcessor.play(voiceChannel, command);

                break;
            }
        }
    };


    let voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) {
        if (message.guild) {
            message.guild.fetchMember(client.user).then(guildMember => {
                voiceChannel = guildMember.voiceChannel;
                commandSwitch(voiceChannel, messageParts);
            });
        } else {
            message.reply('You\'re not in a server.');
        }
    } else {
        commandSwitch(voiceChannel, messageParts);
    }
});

const onExit = () => {
    client.destroy();
    process.exit(0);
};

process.on('beforeExit', onExit);
process.on('exit', onExit);
process.on('SIGINT', onExit);
process.on('SIGUSR1', onExit);
process.on('SIGUSR2', onExit);
process.on('uncaughtException', onExit);
