const { 
    makeWASocket, 
    useMultiFileAuthState, 
    downloadContentFromMessage,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const os = require('os');
const fs = require('fs');
const path = require('path');

if (!global.msgStorage) global.msgStorage = new Map();
global.plugins = new Map();

const config = {
    PREFIX: '.',
    version: '1.0.0',
    botName: 'NEXUS XD',
    ownerName: 'VISHATH'
};

const settingsPath = path.join(__dirname, 'settings.json');
function getSettings() {
    if (fs.existsSync(settingsPath)) {
        let data = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        if (!data.disabled_cmds) data.disabled_cmds = [];
        return data;
    }
    return { auto_status_seen: true, auto_chat_react: true, anti_delete: true, anti_view_once: true, disabled_cmds: [] };
}

function loadPlugins() {
    const pluginsPath = path.join(__dirname, 'plugins');
    if (!fs.existsSync(pluginsPath)) fs.mkdirSync(pluginsPath);
    global.plugins.clear();
    const files = fs.readdirSync(pluginsPath).filter(file => file.endsWith('.js'));
    for (const file of files) {
        try {
            const filePath = path.join(pluginsPath, file);
            delete require.cache[require.resolve(filePath)];
            const plugin = require(filePath);
            if (plugin.cmd && plugin.execute) global.plugins.set(plugin.cmd, plugin);
        } catch (e) { console.error(`❌ Error loading plugin ${file}:`, e); }
    }
    console.log(`🔄 Plugins Loaded! Total: ${global.plugins.size}`);
}

const pluginsPath = path.join(__dirname, 'plugins');
fs.watch(pluginsPath, (eventType, filename) => {
    if (filename && filename.endsWith('.js')) loadPlugins();
});

async function startBot() {
    loadPlugins();
    const { state, saveCreds } = await useMultiFileAuthState('./session_auth');
    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }) 
    });

    if (!socket.authState.creds.registered) {
        let phoneNumber = process.argv[2];
        if (!phoneNumber) {
            console.log('\n❌ Provide number! e.g., node index.js 94771234567\n');
            process.exit(0);
        }
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        setTimeout(async () => {
            try {
                let code = await socket.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                console.log(`\n🔥 PAIRING CODE: ${code}\n`);
            } catch (error) { console.error(error); }
        }, 3000); 
    }

    socket.ev.on('creds.update', saveCreds);
    const socketCreationTime = new Map();

    socket.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message) return;

            const currentSettings = getSettings();
            const from = msg.key.remoteJid;
            const isGroup = from.endsWith('@g.us');
            const sender = isGroup ? (msg.key.participant || '') : msg.key.remoteJid;
            const number = sender.split('@')[0];
            const botNumber = socket.user.id.split(':')[0];
            const msgType = Object.keys(msg.message)[0];

            // 👁️ STATUS AUTO SEEN
            if (from === 'status@broadcast') {
                if (currentSettings.auto_status_seen) await socket.readMessages([msg.key]);
                return;
            }

            const body = (msgType === 'conversation') ? msg.message.conversation : 
                         (msgType === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : 
                         (msgType === 'imageMessage') ? msg.message.imageMessage.caption : 
                         (msgType === 'videoMessage') ? msg.message.videoMessage.caption : '';

            const isCmd = body.startsWith(config.PREFIX);
            const command = isCmd ? body.slice(config.PREFIX.length).trim().split(' ')[0].toLowerCase() : '';
            const args = body.trim().split(/ +/).slice(1);

            // ❤️ AUTO CHAT REACT
            if (!isCmd && !msg.key.fromMe && currentSettings.auto_chat_react) {
                const emojis = ['🐦‍🔥', '💞', '🛸', '🍁', '❤️‍🔥'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await socket.sendMessage(from, { react: { text: randomEmoji, key: msg.key } });
            }

            if (msgType !== 'protocolMessage' && msg.key.id) {
                global.msgStorage.set(msg.key.id, msg);
                setTimeout(() => { global.msgStorage.delete(msg.key.id); }, 3600000);
            }

            // 📸 ANTI-VIEW ONCE
            let isViewOnce = (msgType === 'viewOnceMessageV2' || msgType === 'viewOnceMessage');
            let viewOnceContent = isViewOnce ? (msg.message.viewOnceMessageV2?.message || msg.message.viewOnceMessage?.message) : null;

            if (isViewOnce && viewOnceContent && currentSettings.anti_view_once) {
                try {
                    const innerType = Object.keys(viewOnceContent)[0];
                    const mediaMessage = viewOnceContent[innerType];
                    const stream = await downloadContentFromMessage(mediaMessage, innerType.replace('Message', ''));
                    let buffer = Buffer.alloc(0);
                    for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
                    let captionText = `👁️‍🗨️ *ANTI-VIEW ONCE* \n\n👤 *Sender:* @${number}`;
                    if (innerType === 'imageMessage') {
                        await socket.sendMessage(from, { image: buffer, caption: captionText, mentions: [sender] }, { quoted: msg });
                    } else if (innerType === 'videoMessage') {
                        await socket.sendMessage(from, { video: buffer, caption: captionText, mentions: [sender] }, { quoted: msg });
                    }
                } catch (err) { console.error(err); }
            }

            // 🗑️ ANTI-DELETE
            if (msgType === 'protocolMessage' && msg.message.protocolMessage?.type === 0 && currentSettings.anti_delete) {
                const deletedKey = msg.message.protocolMessage.key;
                if (global.msgStorage.has(deletedKey.id)) {
                    const oldMsg = global.msgStorage.get(deletedKey.id);
                    const deleteSender = oldMsg.key.participant || oldMsg.key.remoteJid;
                    const deleteNumber = deleteSender.split('@')[0];
                    if (!oldMsg.key.fromMe && deleteNumber !== botNumber) {
                        let deleteLog = `🚨 *ANTI-DELETE DETECTED* 🚨\n\n👤 *Sender:* @${deleteNumber}\n`;
                        const oldMsgType = Object.keys(oldMsg.message)[0];
                        if (oldMsgType === 'conversation' || oldMsgType === 'extendedTextMessage') {
                            deleteLog += `💬 *Msg:* ${oldMsg.message.conversation || oldMsg.message.extendedTextMessage.text}`;
                            await socket.sendMessage(from, { text: deleteLog, mentions: [deleteSender] }, { quoted: oldMsg });
                        }
                    }
                }
            }

            if (!isCmd) return;
            if (global.plugins.has(command)) {
                if (currentSettings.disabled_cmds.includes(command)) {
                    return await socket.sendMessage(from, { text: `❌ This command (*${config.PREFIX}${command}*) has been disabled by the admin!` }, { quoted: msg });
                }
                const plugin = global.plugins.get(command);
                const context = { socket, msg, from, sender, number, args, config, socketCreationTime, isGroup };
                await plugin.execute(context);
            }
        } catch (e) { console.error(e); }
    });
}
startBot().catch(err => console.log(err));
