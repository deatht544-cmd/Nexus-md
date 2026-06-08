module.exports = {
    cmd: 'hidetag',
    desc: 'Hidden tag',
    async execute({ socket, msg, from, isGroup, args }) {
        if (!isGroup) return;
        let text = args.join(' ');
        const meta = await socket.groupMetadata(from);
        await socket.sendMessage(from, { text: `📢 ${text}`, mentions: meta.participants.map(p => p.id) });
    }
};
