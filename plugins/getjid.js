module.exports = {
    cmd: 'getjid',
    desc: 'Get channel JID clean format',
    async execute({ socket, msg, from, args }) {
        try {
            let link = args[0];
            if (!link || !link.includes('whatsapp.com/channel/')) {
                return await socket.sendMessage(from, { text: "📌 Please provide a valid WhatsApp Channel Link!" }, { quoted: msg });
            }
            let code = link.split('/channel/')[1].split('?')[0];
            await socket.sendMessage(from, { react: { text: '🔍', key: msg.key } });
            
            let meta = await socket.newsletterMetadata("invite", code);
            if (!meta || !meta.id) return await socket.sendMessage(from, { text: "❌ Invalid link or cannot fetch details!" });

            let jidText = `📢 *𝘕𝘌𝘟𝘜𝘚 𝘟𝘎 𝘊𝘏𝘈𝘕𝘕𝘌𝘓 𝘑𝘐𝘋* 📢\n\n` +
                          `✨ *Channel:* ${meta.name}\n` +
                          `👥 *Followers:* ${meta.subscribers}\n\n` +
                          `🆔 *JID:* \n\`${meta.id}\`\n\n` +
                          `📌 Click to copy the JID string above easily!`;

            await socket.sendMessage(from, { text: jidText }, { quoted: msg });
            await socket.sendMessage(from, { react: { text: '✅', key: msg.key } });
        } catch (e) { 
            console.error(e); 
            await socket.sendMessage(from, { text: "❌ Error fetching channel details!" }, { quoted: msg });
        }
    }
};
