module.exports = {
    cmd: 'tagall',
    desc: 'Tag separate',
    async execute({ socket, msg, from, isGroup, args }) {
        if (!isGroup) return;
        const groupMetadata = await socket.groupMetadata(from);
        let mentors = [], adminsList = "", membersList = "";
        
        for (let p of groupMetadata.participants) {
            mentors.push(p.id);
            if (p.admin) adminsList += `👑 @${p.id.split('@')[0]}\n`;
            else membersList += `👤 @${p.id.split('@')[0]}\n`;
        }
        let text = `✨ *𝘕𝘌𝘟𝘜𝘚 𝘛𝘈𝘎* ✨\n\n📝: ${args.join(' ') || 'None'}\n\n👑 *ADMINS*\n${adminsList}\n👥 *MEMBERS*\n${membersList}`;
        await socket.sendMessage(from, { text, mentions: mentors }, { quoted: msg });
    }
};
