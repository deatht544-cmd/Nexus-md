module.exports = {
    cmd: 'kick',
    desc: 'Kick member',
    async execute({ socket, msg, from, isGroup }) {
        if (!isGroup) return;
        let target = msg.message.extendedTextMessage?.contextInfo?.participant;
        if (!target) return await socket.sendMessage(from, { text: "📌 Reply to user!" });
        await socket.groupParticipantsUpdate(from, [target], "remove");
        await socket.sendMessage(from, { text: "✅ Kicked!" });
    }
};
