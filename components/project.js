const escape = require('../functions/escape');
const truncate = require('../functions/truncate');
const emojis = require('../data/emojis.json');

/**
 * Build component with project information
 * @param {object} information 
 * @returns {object}
 */

function project(information) {
    return {
        components: [
            {
                type: 17,
                accent_color: 16756224,
                spoiler: false,
                components: [
                    {
                        type: 9,
                        components: [
                            {
                                type: 10,
                                content: `# ${escape(information.title)}\n-# By [${information.author.username}](https://scratch.mit.edu/users/${information.author.username})\n`
                            },
                            ...((information.instructions.length > 0) ? [{
                                type: 10,
                                content: `### Instructions\n${escape(truncate(information.instructions, 300))}`
                            }] : []),
                            ...((information.description.length > 0) ? [{
                                type: 10,
                                content: `### Notes and Credits\n${escape(truncate(information.description, 300))}`
                            }] : [])
                        ],
                        accessory: {
                            type: 11,
                            media: {
                                url: information.image
                            }
                        },
                    },
                    {
                        type: 10,
                        content: `**${emojis.love} ${information.stats.loves} ${emojis.favorite} ${information.stats.favorites} ${emojis.remix} ${information.stats.remixes} ${emojis.views} ${information.stats.views}**`
                    },
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 5,
                                url: `https://scratch.mit.edu/projects/${information.id}/`,
                                label: "Scratch",
                                emoji: {
                                    name: "😺"
                                },
                                disabled: false
                            },
                            {
                                type: 2,
                                style: 5,
                                url: `https://turbowarp.org/${information.id}/`,
                                label: "TurboWarp",
                                emoji: {
                                    name: "🍡"
                                },
                                disabled: false
                            }
                        ]
                    }
                ]
            }
        ],
        flags: 32768
    }
}

module.exports = project;
