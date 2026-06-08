const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
module.exports = {
    cmd: 'vv',
    desc: 'Bypass viewonce shorthand',
    async execute({ socket, msg, from, sender, number }) {
        try {
            let quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            let isViewOnce = quotedMsg?.viewOnceMessageV2 || quotedMsg?.viewOnceMessage;
            if (!isViewOnce) return await socket.sendMessage(from, { text: "❌ Please reply to a View Once message!" }, { quoted: msg });

            await socket.sendMessage(from, { react: { text: '👁️‍🗨️', key: msg.key } });

            let content = quotedMsg.viewOnceMessageV2?.message || quotedMsg.viewOnceMessage?.message;
            const type = Object.keys(content)[0];
            const stream = await downloadContentFromMessage(content[type], type.replace('Message', ''));
            let buffer = Buffer.alloc(0);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            let captionText = `👁️‍🗨️ *𝘕𝘌𝘟𝘜𝘚 𝘟開 𝘝𝘐𝘌運行 𝘉𝘓𝘈𝘚𝘛𝘌𝘙*\n\n👤 *Sender:* @${number}`;

            if (type === 'imageMessage') await socket.sendMessage(from, { image: buffer, caption: captionText, mentions: [sender] }, { quoted: msg });
            else if (type === 'videoMessage') await socket.sendMessage(from, { video: buffer, caption: captionText, mentions: [sender] }, { quoted: msg });
        } catch (e) { console.error(e); }
    }
};
