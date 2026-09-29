const get = require('../functions/fetch');
const components = require('../components/export');
const channels = require('../data/channels.json');
const answers = require('../data/eightball.json');
const { clientId } = require('../config.json');
const normalize = require('../functions/normalize');
const crypto = require('crypto');
const semanticize = require('../functions/semanticize');
const challenges = require('../data/challenges.json');
const randomArrayInt = require('../functions/random');
const type = require('../functions/type.js');
const { PermissionFlagsBits } = require('discord.js');

const reactions = [
    { regex: /penguinmod/i, emoji: '🐧' },
    { regex: /scratch/i, emoji: '1216005306090393680' },
    { regex: /nitrobolt/i, emoji: '⚡' },
    { regex: /turbowarp/i, emoji: '🍡' },
    { regex: /\b(hi|hello|hiya|sup|hey)\b/i, emoji: '1359604048801829114' },
    { regex: /gobo/i, emoji: '1465845363326976343' },
    { regex: /giga/i, emoji: '1465845449524252703' },
    { regex: /tera/i, emoji: '1465845334126100695' },
    { regex: /nano/i, emoji: '1465845395753271316' },
    { regex: /rayne/i, emoji: '🌧️' },
    { regex: /john/i, emoji: '🐱' },
    { regex: /blu/i, emoji: '🔵' },
    { regex: /\b(mov|man o valor|man-o-valor)\b/i, emoji: '🚂' }
];

/**
 * Capture Scratch profile links and send a preview of them
 * @param {object} message 
 */

async function linkProfile(message) {
    if (message.author.id === clientId) return;
    if (channels["allowed_channels"].includes(message.channelId) || channels["allowed_channels"].includes(message.channel.parentId)) {
        const matches = (message.content).match(/scratch\.mit\.edu\/users\/([a-zA-Z0-9-_]+)/);
        if (matches) {
            const username = matches[1];

            const information = await get(`https://api.scratch.mit.edu/users/${username}`);

            if (information) {
                message.reply(components.profile(information));
            }
        }
    }
}

/**
 * Capture Scratch project links and send a preview of them
 * @param {object} message 
 */

async function linkProject(message) {
    if (message.author.id === clientId) return;
    if (channels["allowed_channels"].includes(message.channelId) || channels["allowed_channels"].includes(message.channel.parentId)) {
        const matches = (message.content).match(/scratch\.mit\.edu\/projects\/([0-9]+)/);
        if (matches) {
            const id = matches[1];

            const information = await get(`https://api.scratch.mit.edu/projects/${id}`);

            if (information) {
                message.reply(components.project(information));
            }
        }
    }
}

/**
 * Capture Scratch studio links and send a preview of them
 * @param {object} message 
 */

async function linkStudio(message) {
    if (message.author.id === clientId) return;
    if (channels["allowed_channels"].includes(message.channelId) || channels["allowed_channels"].includes(message.channel.parentId)) {
        const matches = (message.content).match(/scratch\.mit\.edu\/studios\/([0-9]+)/);
        if (matches) {
            const id = matches[1];

            const information = await get(`https://api.scratch.mit.edu/studios/${id}`);

            if (information) {
                message.reply(components.studio(information));
            }
        }
    }
}

/**
 * Capture Scratch profile and project links to warn the user not to advertise
 * @param {object} message 
 */

function captureLinks(message) {
    if (message.author.id === clientId) return;
    if (!channels["allowed_channels"].includes(message.channelId) && !channels["allowed_channels"].includes(message.channel.parentId)) {
        const userLink = /https:\/\/scratch\.mit\.edu\/users\/\S+/g;
        const projectLink = /https:\/\/scratch\.mit\.edu\/projects\/\S+/g;
        const studioLink = /https:\/\/scratch\.mit\.edu\/studios\/\S+/g;

        if (userLink.test(message.content)) {
            message.reply(components.container(
                `Hey <@${message.author.id}>, please keep profile advertisements to https://discord.com/channels/1140996822131802192/1140996823364943939. \n-# If you weren't advertising, you can ignore this message.`,
                16756224
            ));
        }
        if (projectLink.test(message.content)) {
            message.reply(components.container(
                `Hey <@${message.author.id}>, please keep project advertisements to https://discord.com/channels/1140996822131802192/1140996823364943939 and https://discord.com/channels/1140996822131802192/1145818943462850581. \n-# If you weren't advertising, you can ignore this message.`,
                16756224
            ));
        }
        if (studioLink.test(message.content)) {
            message.reply(components.container(
                `Hey <@${message.author.id}>, please keep studio advertisements to https://discord.com/channels/1140996822131802192/1140996823364943939 and https://discord.com/channels/1140996822131802192/1141402927999762462. \n-# If you weren't advertising, you can ignore this message.`,
                16756224
            ));
        }
    }
}

async function eightball(message) {
    if (message.author.id === clientId) return;
    const content = message.content.toLowerCase();
    const normalized = normalize(message.content);
    const keywords = [
        "true",
        "false",
        "right",
        "wrong",
        "bad",
        "correct",
        "incorrect",
        "good",
        "real"
    ];

    if (
        (message.mentions.users.has(clientId) || content.includes('scratchie')) &&
        keywords.some(word =>
            content.includes(word)
        )
    ) {
        let toHash = normalized;

        if (message.reference?.messageId) {
            const reply = await message.fetchReference().catch(() => null);

            if (reply) {
                toHash = `${normalize(reply.content)} ${normalized}`;
            }
        }

        if (semanticize(toHash).split(' ').length > 2 || message.reference?.messageId) {
            const hash = crypto.createHash('sha256').update(semanticize(toHash)).digest();
            await type(message);
            return message.reply(
                answers[hash.readUInt32BE(0) % answers.length]
            );
        } else {
            await type(message);
            return message.reply(
                answers[Math.floor(Math.random() * answers.length)]
            );
        }
    }
}

async function greet(message) {
    if (message.author.id === clientId) return;
    const content = message.content.toLowerCase();
    const replies = ['Hi!!', 'Nice to see you, hi!', 'Hello there!', 'Yo!', 'How\'s it going?'];

    const mentioned = message.mentions.users.has(clientId) || /\bscratchie\b/i.test(content);

    const greeting = /\b(hi|hello)\b/i.test(content);

    if (mentioned && greeting) {
        await type(message);
        return message.reply(
            replies[Math.floor(Math.random() * replies.length)]
        );
    }
}

async function truthOrDare(message) {
    if (message.author.id === clientId) return;
    const content = message.content.toLowerCase();
    const normalized = normalize(message.content);

    function truth() {
        const beginning = challenges.message[randomArrayInt(challenges.message.length)];
        const truth = challenges.truths[randomArrayInt(challenges.truths.length)];
        return `${beginning} ${truth}`;
    }

    function dare() {
        const beginning = challenges.message[randomArrayInt(challenges.message.length)];
        const dare = challenges.dares[randomArrayInt(challenges.dares.length)];
        return `${beginning} ${dare}`;
    }

    if ((message.mentions.users.has(clientId) || content.includes('scratchie'))) {
        if (normalized.includes('truth') && normalized.includes('dare')) {
            await type(message);
            if (Math.random() >= 0.5) {
                return message.reply(truth());
            } else {
                return message.reply(dare());
            }
        } else if (normalized.includes('truth')) {
            await type(message);
            return message.reply(truth());
        } else if (normalized.includes('dare')) {
            await type(message);
            return message.reply(dare());
        }
    }
}

async function autoReact(message) {
    if (message.channelId === channels['arts-creations']) {
        const snapshot = message.messageSnapshots.first();

        const hasAttachment = (message.attachments.size > 0) || (snapshot?.attachments.size > 0);

        if (hasAttachment) {
            message.react('⭐').catch(() => null);
            message.react('❤️').catch(() => null);
            message.react('🔥').catch(() => null);
        }
    }

    for (const reaction of reactions) {
        if (reaction.regex.test(message.content.toLowerCase())) {
            message.react(reaction.emoji).catch(() => null);
        }
    }
}

async function captureHelp(message) {
    if (message.author.id === clientId) return;
    const content = message.content.toLowerCase();

    const keyphrases = [
        "get help",
        "help me",
        "help with",
        "i need help",
        "i need support",
        "can you guide me"
    ];

    if (keyphrases.some(phrase =>
        content.includes(phrase)
    )) {
        message.reply(components.container(
            `👋 Hey <@${message.author.id}>, please check out https://discord.com/channels/1140996822131802192/1141083052076957887 if you need help!`,
            16756224
        ));
    }
}

/**
 * Capture Discord server links to warn the user not to advertise
 * @param {object} message 
 */

async function antiAdvertise(message) {
    if (message.author.id === clientId) return;
    if (message.channel.id === '1140996823364943939') return;
    if (message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return;

    if (/discord.com\/invite\/[a-zA-Z0-9-]+/i.test(message.content) || /discord.gg\/[a-zA-Z0-9-]+/i.test(message.content)) {
        message.reply(components.container(
            `‼️ Hey <@${message.author.id}>, server advertisements aren't allowed here. Please move to https://discord.com/channels/1140996822131802192/1140996823364943939 if you wish to advertise.`,
            16756224
        ));

        setTimeout(() => {
            message.delete().catch(() => null);
        }, 1000);
    }
}

module.exports = [
    linkProfile,
    linkProject,
    linkStudio,
    captureLinks,
    eightball,
    greet,
    truthOrDare,
    autoReact,
    captureHelp,
    antiAdvertise
]
