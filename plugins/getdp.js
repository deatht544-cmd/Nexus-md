module.exports = {
    cmd: 'getdp',
    desc: 'Get profile picture, name, and about status of a user',
    async execute({ socket, msg, from, args }) {
        try {
            let target = msg.message.extendedTextMessage?.contextInfo?.participant;
            if (!target && args[0]) target = `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net`;
            if (!target) target = msg.key.participant || from;

            await socket.sendMessage(from, { react: { text: '🔍', key: msg.key } });

            // Profile Picture
            let dpUrl = await socket.profilePictureUrl(target, 'image').catch(() => null);
            if (!dpUrl) dpUrl = await socket.profilePictureUrl(target, 'preview').catch(() => null);
            if (!dpUrl) dpUrl = "https://files.catbox.moe/bm2v7m.jpg"; 

            // About/Status
            let aboutStatus = "No About Status Available";
            try {
                let statusObj = await socket.fetchStatus(target);
                if (statusObj && statusObj.status) aboutStatus = statusObj.status;
            } catch (err) { aboutStatus = "❌ Private / Hidden"; }

            // Name
            let userName = "Unknown User";
            let cleanNumber = target.split('@')[0];

            if (socket.contacts && socket.contacts[target]) {
                userName = socket.contacts[target].name || socket.contacts[target].notify || userName;
            } else if (msg.message.extendedTextMessage?.contextInfo?.pushName) {
                userName = msg.message.extendedTextMessage.contextInfo.pushName;
            }

            let infoText = `👤 *°•.  𝘕𝘌𝘟𝘜𝘚 𝘜𝘚𝘌𝘙 𝘐𝘕𝘍𝘖  .•°* 👤\n\n` +
                           `✨ *Name:* ${userName}\n` +
                           `📱 *Number:* +${cleanNumber}\n` +
                           `📝 *About:* ${aboutStatus}\n\n` +
                           `> *Powered by Nexus Tech* 🚀`;

            await socket.sendMessage(from, { image: { url: dpUrl }, caption: infoText, mentions: [target] }, { quoted: msg });
            await socket.sendMessage(from, { react: { text: '✅', key: msg.key } });
        } catch (e) { 
            console.error(e); 
            await socket.sendMessage(from, { text: "❌ Error fetching user details!" }, { quoted: msg });
        }
    }
};
