module.exports = {
    cmd: 'channel',
    desc: 'Get Channel info',
    async execute({ socket, msg, from, args }) {
        try {
            let link = args[0];
            if (!link || !link.includes('whatsapp.com/channel/')) return await socket.sendMessage(from, { text: "📌 Please enter a valid channel link!" });
            let code = link.split('/channel/')[1].split('?')[0];
            let meta = await socket.newsletterMetadata("invite", code);
            let text = `📢 *𝘕𝘌𝘟𝘜𝘚 𝘊𝘏𝘈𝘕𝘕𝘌𝘓 𝘐𝘕𝘍𝘖* 📢\n\n✨ Name: ${meta.name}\n👥 Followers: ${meta.subscribers}`;
            if (meta.picture) await socket.sendMessage(from, { image: { url: meta.picture }, caption: text }, { quoted: msg });
            else await socket.sendMessage(from, { text }, { quoted: msg });
        } catch (e) { console.error(e); }
    }
};
