module.exports = {
    cmd: 'csong',
    desc: 'Send song to channel',
    async execute({ socket, msg, from, args }) {
        try {
            let quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            let quotedKey = msg.message.extendedTextMessage?.contextInfo?.stanzaId;
            let channelJid = args[0];

            if (!quotedMsg?.audioMessage || !channelJid || !channelJid.endsWith('@newsletter')) {
                return await socket.sendMessage(from, { text: "📌 Reply to an audio message and provide a valid Channel JID!\n*Example:* `.sendmusic 120363xxxxxx@newsletter`" }, { quoted: msg });
            }
            
            await socket.sendMessage(from, { react: { text: '🎵', key: msg.key } });
            await socket.sendMessage(channelJid, { forward: { key: { remoteJid: from, id: quotedKey, fromMe: false }, message: quotedMsg } });
            await socket.sendMessage(from, { text: "✅ Song successfully sent to the channel!" }, { quoted: msg });
        } catch (e) { 
            console.error(e); 
            await socket.sendMessage(from, { text: "❌ Failed! Make sure the bot is an Admin in that channel." }, { quoted: msg });
        }
    }
};
