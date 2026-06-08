module.exports = {
    cmd: 'menu',
    desc: 'Show updated main menu',
    async execute({ socket, msg, from, sender, number, config, socketCreationTime }) {
        try {
            const startTime = socketCreationTime.get(number) || Date.now();
            const uptime = Math.floor((Date.now() - startTime) / 1000);
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);
            const usedMemory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
            const totalMemory = Math.round(require('os').totalmem() / 1024 / 1024);
            
            let menuText = `✨ *°•.  𝘕𝘌𝘟𝘜𝘚 𝘟放 𝘔𝘌𝘕𝘜  .•°* ✨\n\n` +
                           `╭───────────────⭓\n│ ʙᴏᴛ : ${config.botName}\n│ ᴜsᴇʀ: @${number}\n│ ᴘʀᴇғɪx: ${config.PREFIX}\n│ ᴜᴘᴛɪᴍᴇ: ${hours}ʜ ${minutes}ᴍ ${seconds}s\n│ ᴍᴇᴍᴏʀỹ : ${usedMemory}MB / ${totalMemory}ᴍʙ\n╰───────────────⭓\n\n` +
                           `🌐 *ɢᴇɴᴇʀᴀʟ ᴄᴏᴍᴍᴀันᴅs*\n» ${config.PREFIX}alive | ${config.PREFIX}menu\n» ${config.PREFIX}getdp [num/reply]\n» ${config.PREFIX}channel [link] | ${config.PREFIX}getjid [link]\n\n` +
                           `👑 *ɢʀᴏᴜප් ᴀᴅᴍɪɴ ᴛᴏᴏʟs*\n» ${config.PREFIX}tagall [text] | ${config.PREFIX}hidetag [text]\n» ${config.PREFIX}kick [reply] | ${config.PREFIX}gropen [open/close]\n\n` +
                           `🎭 *ғᴜɴ & ᴍᴇedia ᴛᴏᴏʟs*\n» ${config.PREFIX}emo [love/fire/loading/party]\n» ${config.PREFIX}vv [reply viewonce]\n» ${config.PREFIX}sendmusic [chan_jid]\n» ${config.PREFIX}autoschedule [sec | msg]\n\n` +
                           `⚙️ *ᴍᴀsᴛᴇʀ ᴘᴀɴᴇʟ*\n» ${config.PREFIX}settings - ᴍᴀɴᴀɢᴇ ᴇᴠᴇʀỹᴛʜɪɴɢ\n\n> *ᴍᴀᴅᴇ ʙʏ ${config.ownerName}*`;

            await socket.sendMessage(from, { image: { url: "https://files.catbox.moe/bm2v7m.jpg" }, caption: menuText, mentions: [sender] }, { quoted: msg });
        } catch (e) { console.error(e); }
    }
};
