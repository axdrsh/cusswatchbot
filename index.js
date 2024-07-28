const { Client, GatewayIntentBits } = require('discord.js');
const Filter = require('bad-words');
const fs = require('fs');
const dotenv = require('dotenv')

dotenv.config()
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const filter = new Filter();


filter.addWords('chutiya', 'chutiye', 'randi', 'madarchod', 'rand', 'raand', 'bhadwa', 'bhadwe', 'bharwe', 'bharwa', 'gand', 'gaand', 'chut', 'lund', 'bhenchod', 'bc', 'madarjat', 'bhosdike', 'bhosdiwale', 'bsdk', 'loda', 'lawda', 'lawde', 'bhosda', 'chod', 'chud', 'chudi', 'chuda', 'suwar', 'kutte', 'kamine');

let profanityCount = {};

if (fs.existsSync('profanityCount.json')) {
    profanityCount = JSON.parse(fs.readFileSync('profanityCount.json'));
}

client.once('ready', () => {
    console.log('Ready!');
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    const content = message.content;

    if (content === '!help') {
        message.channel.send(
            `**Commands:**
            \n**!profanity** - Check your personal profanity count.
            \n**!leaderboard** - Display the top users with the most profanity.
            \n**!help** - Display this help message.
            `
        );
        return;
    }

      // Admin-only command: reset all users' profanity counts
      if (content === '!resetAll') {
        profanityCount = {};
        fs.writeFileSync('profanityCount.json', JSON.stringify(profanityCount, null, 2));
        message.channel.send('All profanity counts have been reset.');
        return;
    }

    if (content.startsWith('!profanity')) {
        const userId = message.author.id;
        const count = profanityCount[userId] || 0;

        message.reply(`**${message.author.username}**, You've cussed ${count} times.`);
        return;
    }

      // Check for the top users command
      if (content.startsWith('!leaderboard')) {
        const topUsers = Object.entries(profanityCount)
            .sort(([, a], [, b]) => b - a) // Sort by profanity count in descending order
            .slice(0, 5) // Limit to top 5 users
            .map(([id, count], index) => `#${index + 1}: <@${id}> - ${count} times`);

        message.channel.send(topUsers.length > 0 ? `Top users with most profanity:\n${topUsers.join('\n')}` : 'No profanity has been recorded yet.');
        return;
    }

    // Check if the message contains profanity
    if (filter.isProfane(content)) {
        const userId = message.author.id;

        // Increment the user's profanity count
        if (!profanityCount[userId]) {
            profanityCount[userId] = 0;
        }
        profanityCount[userId]++;

        // Save the updated counts to a file
        fs.writeFileSync('profanityCount.json', JSON.stringify(profanityCount, null, 2));
    }
});


client.login(process.env.TOKEN)