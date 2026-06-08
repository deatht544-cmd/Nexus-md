const fs = require('fs');
const path = require('path');
const settingsPath = path.join(__dirname, '../settings.json');

module.exports = {
    cmd: 'settings',
    desc: 'Manage all commands and systems',
    async execute({ socket, msg, from, args, config }) {
        try {
            let settings = { auto_status_seen: true, auto_chat_react: true, anti_delete: true, anti_view_once: true, disabled_cmds: [] };
            if (fs.existsSync(settingsPath)) {
                settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
                if (!settings.disabled_cmds) settings.disabled_cmds = [];
            }

            let type = args[0]?.toLowerCase();
            let value = args[1]?.toLowerCase();

            if (!type) {
                let status_seen = settings.auto_status_seen ? '🟩 ON' : '🟥 OFF';
                let chat_react = settings.auto_chat_react ? '🟩 ON' : '🟥 OFF';
                let anti_del = settings.anti_delete ? '🟩 ON' : '🟥 OFF';
                let view_once = settings.anti_view_once ? '🟩 ON' : '🟥 OFF';

                let cmdStatusList = "";
                for (let [cmdName] of global.plugins) {
                    if (cmdName === 'settings') continue;
                    let isOff = settings.disabled_cmds.includes(cmdName);
                    cmdStatusList += `» *${config.PREFIX}${cmdName}* ──> ${isOff ? '🟥 OFF' : '🟩 ON'}\n`;
                }

                let text = `⚙️ *°•. 𝘕𝘌𝘟𝘜𝘚 𝘟推 𝘔𝘈𝘚𝘛𝘌𝘙 𝘚𝘌𝘛𝘛𝘐𝘕𝘎𝘚 .•°* ⚙️\n\n` +
                           `📊 *⚙️ BACKEND SYSTEMS*\n` +
                           `⚙️ *Status Seen:* ${status_seen} \`(.settings status on/off)\`\n` +
                           `⚙ *Chat React:* ${chat_react} \`(.settings react on/off)\`\n` +
                           `⚙️ *Anti-Delete:* ${anti_del} \`(.settings delete on/off)\`\n` +
                           `⚙️ *Anti-ViewOnce:* ${view_once} \`(.settings view on/off)\`\n\n` +
                           `🔌 *COMMANDS STATUS*\n${cmdStatusList}\n` +
                           `📌 \`${config.PREFIX}settings <cmd_name> on/off\``;
                return await socket.sendMessage(from, { text: text }, { quoted: msg });
            }

            if (value !== 'on' && value !== 'off') return await socket.sendMessage(from, { text: "❌ Use on/off!" });
            let boolValue = (value === 'on');

            if (type === 'status') settings.auto_status_seen = boolValue;
            else if (type === 'react') settings.auto_chat_react = boolValue;
            else if (type === 'delete') settings.anti_delete = boolValue;
            else if (type === 'view') settings.anti_view_once = boolValue;
            else if (global.plugins.has(type)) {
                if (type === 'settings') return;
                if (value === 'off') {
                    if (!settings.disabled_cmds.includes(type)) settings.disabled_cmds.push(type);
                } else {
                    settings.disabled_cmds = settings.disabled_cmds.filter(c => c !== type);
                }
            } else return await socket.sendMessage(from, { text: "❌ Invalid Name!" });

            fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
            await socket.sendMessage(from, { text: `✅ Updated successfully!` }, { quoted: msg });
        } catch (e) { console.error(e); }
    }
};
