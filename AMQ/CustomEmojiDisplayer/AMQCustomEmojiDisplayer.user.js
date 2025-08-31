// ==UserScript==
// @name         AMQ Custom Emoji Displayer
// @namespace    https://github.com/JabroAMQ/
// @version      0.0
// @description  Change a specifc emoji code to display a custom emoji image
// @author       Jabro
// @match        https://*.animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @require      https://raw.githubusercontent.com/joske2865/AMQ-Scripts/master/common/amqScriptInfo.js
// @downloadURL  https://github.com/JabroAMQ/Utilities/blob/main/AMQ/CustomEmojiDisplayer/AMQCustomEmojiDisplayer.user.js
// @updateURL    https://github.com/JabroAMQ/Utilities/blob/main/AMQ/CustomEmojiDisplayer/AMQCustomEmojiDisplayer.user.js
// ==/UserScript==

const VERSION = '0.0';
const DELAY = 500;
const CUSTOM_EMOJIS_URL = 'https://raw.githubusercontent.com/JabroAMQ/Utilities/main/AMQ/CustomEmojiDisplayer/emojis.json?nocache=' + Date.now();
const CUSTOM_EMOJIS_DICT = {};


if (document.getElementById('loginPage'))
    return;

let loadInterval = setInterval(() => {
    if ($('#loadingScreen').hasClass('hidden')) {
        clearInterval(loadInterval);
        read_custom_emojis();
    }
}, DELAY);


function read_custom_emojis() {
    GM_xmlhttpRequest({
        method: 'GET',
        url: CUSTOM_EMOJIS_URL,
        onload: function (response) {
            try {
                const data = JSON.parse(response.responseText);
                for (const [key, file] of Object.entries(data)) {
                    CUSTOM_EMOJIS_DICT[`:${key}:`] = file;
                }
                console.log('Custom emojis loaded:', CUSTOM_EMOJIS_DICT);
                setup();
            } catch (err) {
                console.error('Failed to parse emojis.json:', err);
            }
        },
        onerror: function (err) {
            console.error('Error loading emojis.json:', err);
        }
    });
}


function setup() {
    let gameChatNode = document.getElementById('gcMessageContainer');

    let gameChatObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (!mutation.addedNodes) return;

             for (let i = 0; i < mutation.addedNodes.length; i++) {
                let node = mutation.addedNodes[i];
                if (node.nodeType !== 1) continue; // only element nodes

                // Replace any emoji codes in the message text
                let html = node.innerHTML;
                for (const [code, url] of Object.entries(CUSTOM_EMOJIS_DICT)) {
                    if (html.includes(code)) {
                        let imgTag = `<img src="${url}" alt="${code}" class="customEmoji" style="height:1.5em; vertical-align:middle;">`;
                        html = html.replaceAll(code, imgTag);
                    }
                }
                node.innerHTML = html;

                // scroll to bottom
                let chat = gameChat.$chatMessageContainer;
                let atBottom = chat.scrollTop() + chat.innerHeight() >= chat[0].scrollHeight - 25;
                if (atBottom) {
                    chat.scrollTop(chat.prop('scrollHeight'));
                }
            }
        });
    });

    gameChatObserver.observe(gameChatNode, {
        childList: true,
        attributes: false,
        CharacterData: false
    });
}


AMQ_addScriptData({
    name: 'AMQ Custom Emoji Displayer',
    author: 'Jabro',
    link: 'https://github.com/JabroAMQ/Utilities/blob/main/AMQ/CustomEmojiDisplayer/AMQCustomEmojiDisplayer.user.js',
    version: VERSION,
    description: `
        <div>
            <p>Placeholder</p>
        </div>
    `
});