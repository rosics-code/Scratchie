const {
    TextDisplayBuilder,
    ThumbnailBuilder,
    SectionBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ContainerBuilder,
    MessageFlags
} = require('discord.js');
const escape = require('../functions/escape');
const countries = require('../data/countries.json');
const formatMentions = require('../functions/mentions');

/**
 * Build component with user information
 * @param {object} information 
 * @returns {object}
 */

function profile(information) {
    const date = new Date(information.history.joined).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const body = [
        new TextDisplayBuilder().setContent(`# ${escape(information.username)}${information.scratchteam ? '*' : ''} ${countries[information.profile.country]}\n*${information.id} - ${information.profile.country} - ${date}*\n`)
    ]

    if (information.profile.bio.length > 0) {
        body.push(
            new TextDisplayBuilder().setContent(`## About me\n${formatMentions(escape(information.profile.bio))}`)
        );
    }

    if (information.profile.status.length > 0) {
        body.push(
            new TextDisplayBuilder().setContent(`## What I'm working on\n${formatMentions(escape(information.profile.status))}`)
        );
    }

    if (information.profile.status.length === 0 && information.profile.bio.length === 0) {
        body.push(
            new TextDisplayBuilder().setContent('This profile has no other information to display.')
        );
    };

    return {
        components: [
            new ContainerBuilder()
                .setAccentColor(16756224)
                .addSectionComponents(
                    new SectionBuilder()
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(information.profile.images['60x60'])
                        )
                        .addTextDisplayComponents(body)
                )
                .addActionRowComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Link)
                                .setLabel("Profile")
                                .setEmoji({
                                "name": "👤",
                                })
                                .setURL(`https://scratch.mit.edu/users/${information.username}/`)
                        )
                )
        ],
        flags: MessageFlags.IsComponentsV2
    }
}

module.exports = profile;
