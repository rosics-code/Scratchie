const get = require('../functions/fetch');
const components = require('../components/export');
const channels = require('../data/channels.json');
const answers = require('../data/eightball.json');
const {
    clientId
} = require('../config.json');
const normalize = require('../functions/normalize');
const crypto = require('crypto');
const semanticize = require('../functions/semanticize');
const cooldowns = new Set();
const warnedUsers = new Set();
const cooldownTime = 3000;

/**
 * Capture Scratch profile links and send a preview of them
 * @param {object} message 
 */

async function linkProfile(message) {
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

/**
 * Capture Scratch help with project keywords to warn the user to use project help
 * @param {object} message 
 */

function captureHelp(message) {
    if (!channels["allowed_channels"].includes(message.channelId) && !channels["allowed_channels"].includes(message.channel.parentId)) {
        const keywords = [
            /\bneed\s+help\s+(with|on|for)\s+(my\s+)?projects?\b/i,
            /\b(can|could|anyone|someone)\s+help\s+me\b/i,
            /\bstuck\s+(on|with)\s+(my\s+)?(project|code|script|scratch)\b/i,
            /\bhow\s+(do\s+i|to)\s+(make|fix|code|program)\b/i,
            /\b(project|code|script|game|bot)\s+(is\s+broken|isnt\s+working|not\s+working|glitched)\b/i,
            /\b(looking\s+for|need|want)\s+(a\s+)?(coder|programmer|developer|collaborator)s?\b/i,
            /\b(help\s+with\s+a\s+)?(bug|error|glitch|issue)s?\b/i
        ];

        if (keywords.some(regex => regex.test(message.content))) {
            message.reply(components.container(
                `Hey <@${message.author.id}>, please check out https://discord.com/channels/1140996822131802192/1141083052076957887⁠ if you need help!`,
                16756224
            ));
        }

    }
}

async function eightball(message) {
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
        const username = message.author.username;

        if (cooldowns.has(username)) {
            if (!warnedUsers.has(username)) {
                warnedUsers.add(username);
                return message.reply("stop spamming");
            }
            return;
        }

        cooldowns.add(username);

        setTimeout(() => {
            cooldowns.delete(username);
            warnedUsers.delete(username);
        }, cooldownTime);


        let toHash = normalized;

        if (message.reference?.messageId) {
            const reply = await message.fetchReference().catch(() => null);

            if (reply) {
                toHash = `${normalize(reply.content)} ${normalized}`;
            }
        }

        if (semanticize(toHash).split(' ').length > 2 || message.reference?.messageId) {
            const hash = crypto.createHash('sha256').update(semanticize(toHash)).digest();
            return message.reply(
                answers[hash.readUInt32BE(0) % answers.length]
            );
        } else {
            return message.reply(
                answers[Math.floor(Math.random() * answers.length)]
            );
        }
    }
}

function greet(message) {
    const content = message.content.toLowerCase();
    const replies = ['Hi!!', 'Nice to see you, hi!', 'Hello there!'];

    const mentioned = message.mentions.users.has(clientId) || /\bscratchie\b/i.test(content);

    const greeting = /\b(hi|hello)\b/i.test(content);

    if (mentioned && greeting) {
        return message.reply(
            replies[Math.floor(Math.random() * replies.length)]
        );
    }
}

module.exports = [
    linkProfile,
    linkProject,
    linkStudio,
    captureLinks,
    eightball,
    greet,
    captureHelp
]
