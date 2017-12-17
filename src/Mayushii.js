const fs = require('fs');
const Discord = require('discord.js');
const Permissions = Discord.Permissions;
const client = new Discord.Client();
const MayushiiProcessor = require('./MayushiiProcessor.js');

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

    client.guilds.forEach(guild => {
        // remove message from server if have permission
        guild.fetchMember(client.user).then(guildMember => {
            if (guildMember.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES)) {
                MayushiiProcessor.removeMessages(guild);
            }
        });
    });
});

client.on('voiceStateUpdate', (oldGuildMember, newGuildMember) => {
    let voiceChannel = newGuildMember.voiceChannel;
    if (!voiceChannel) {
        return;
    }

    MayushiiProcessor.play(voiceChannel, newGuildMember.nickname || newGuildMember.user.username);
});

client.on('message', message => {
    if (message.content.toLowerCase().contains('mayushii') || message.content.toLowerCase().contains('tuturu')) {
        message.react('heart');
    }

    // this is not a command for mayu
    if (message.content.length === 0 || message.content.charAt(0) !== '?') {
        return;
    }

    let messageParts = message.content.substr(1).toLowerCase().split(' ');
    if (messageParts.length === 0) {
        return;
    }

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
            message.reply('You\'re not in a server.');
        }
    } else {
        commandSwitch(voiceChannel, messageParts);
    }
});

process.on('beforeExit', () => {
    client.destroy();
});

process.on('exit', () => {
    client.destroy();
});