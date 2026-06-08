module.exports = {
    cmd: 'alive',
    desc: 'Check bot status',
    async execute({ socket, msg, from, config }) {
        await socket.sendMessage(from, { text: `🚀 *${config.botName}* is alive and working perfectly! ✨` }, { quoted: msg });
    }
};
