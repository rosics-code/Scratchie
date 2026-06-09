const get = require('../functions/fetch');
const components = require('../components/export');

async function news(interaction) {
    await interaction.deferReply();
try {
    const information = await get('https://api.scratch.mit.edu/news?limit=3');

    if (information && response.length > 0) {
        const newsList = response.map(function(item) {
            return {
                headline: item.headline,
                copy: item.copy
            };
        });
        return interaction.editReply(components.news(newsList));
    } else {
        throw new Error("500: News might be down from the API");
    }    
} catch (error) {
        return interaction.editReply(components.container(
            "Error while fetching news information",
            16756224
        ));
    }
}

module.exports = news;
