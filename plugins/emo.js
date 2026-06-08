module.exports = {
    cmd: 'emo',
    desc: 'Emoji animation',
    async execute({ socket, msg, from, args }) {
        let type = args[0]?.toLowerCase();
        const delay = ms => new Promise(res => setTimeout(res, ms));
        if (type === 'love') {
            let { key } = await socket.sendMessage(from, { text: '❤️' }, { quoted: msg });
            for (let h of ['🧡', '💛', '💚', '💙', '💜', '💖']) { await delay(600); await socket.sendMessage(from, { text: h, edit: key }); }
        } else if (type === 'fire') {
            let { key } = await socket.sendMessage(from, { text: '☁️' }, { quoted: msg });
            for (let f of ['💨', '🔥', '💥', '🌋']) { await delay(600); await socket.sendMessage(from, { text: f, edit: key }); }
        } else {
            await socket.sendMessage(from, { text: "📌 Use: .emo love | .emo fire" });
        }
    }
