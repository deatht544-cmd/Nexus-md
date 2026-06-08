module.exports = {
    cmd: 'gropen',
    desc: 'Group settings',
    async execute({ socket, msg, from, isGroup, args }) {
        if (!isGroup) return;
        let action = args[0]?.toLowerCase();
        if (action === 'open') await socket.groupSettingUpdate(from, 'not_announcement');
        else if (action === 'close') await socket.groupSettingUpdate(from, 'announcement');
        await socket.sendMessage(from, { text: `✅ Group status updated to ${action}!` });
    }
};
