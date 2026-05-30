// ==UserScript==
// @name         AMQ Shortcuts
// @namespace    https://github.com/JabroAMQ/
// @version      0.2
// @description  Some window shortcuts to improve the game experience
// @author       Jabro
// @match        https://*.animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @require      https://raw.githubusercontent.com/joske2865/AMQ-Scripts/master/common/amqScriptInfo.js
// @require      https://github.com/Minigamer42/scripts/raw/master/lib/commands.js
// @downloadURL  https://github.com/JabroAMQ/Utilities/blob/main/AMQ/Shortcuts/AMQShortcuts.js
// @updateURL    https://github.com/JabroAMQ/Utilities/blob/main/AMQ/Shortcuts/AMQShortcuts.js
// ==/UserScript==

const VERSION = '0.2';
const DELAY = 500;

const shortcuts = [
    { key: 'q', callback: showSongList, description: 'Open/Close the song list' },
    { key: 'm', callback: showSettingsListTab, description: 'Open/Close the Anime List tab from the Settings modal' }
];

function showSongList() {
    if (typeof songHistoryWindow !== 'undefined' && typeof songHistoryWindow.trigger === 'function') {
        songHistoryWindow.trigger();
    }
}

function showSettingsListTab() {
    // Simulate a click event on the "Settings" element from the "menu bar option container"
    const settingsListItem = document.getElementById('optionListSettings');
    settingsListItem.click();

    // Simulate a click event on the "Anime List" tab from the "Settings" modal
    const animeListTab = document.getElementById('smAnimeListTab');
    animeListTab.click();
}


if (document.getElementById('loginPage'))
    return;

let loadInterval = setInterval(() => {
    if ($('#loadingScreen').hasClass('hidden')) {
        clearInterval(loadInterval);
        registerShortcuts();
    }
}, DELAY);


function registerShortcuts() {
    for (const shortcut of shortcuts) {
        bindKey(shortcut.key, shortcut.callback);
    }

    AMQ_addCommand({
        command: 'shortcuts',
        callback: showShortcutsInfo,
        description: 'Show information about the available shortcuts'
    });
}

function bindKey(pressedKey, callback) {
    document.addEventListener('keyup', function(e) {
        if (e.ctrlKey && e.key.toLowerCase() === pressedKey.toLowerCase()) {
            e.preventDefault();
            e.stopPropagation();
            callback();
        }
    }, true);
}

function showShortcutsInfo() {
    gameChat.systemMessage('Available shortcuts:');
    for (const shortcut of shortcuts) {
        gameChat.systemMessage(`Ctrl + ${shortcut.key.toUpperCase()}: ${shortcut.description}`);
    }
}


AMQ_addScriptData({
    name: 'Shortcuts',
    author: 'Jabro',
    link: 'https://github.com/JabroAMQ/Utilities/blob/main/AMQ/Shortcuts/AMQShortcuts.user.js',
    version: VERSION,
    description: `
        <div>
            <p>Some window shortcuts to improve the game experience</p>
            <p><strong>Ctrl + Q</strong>: Open/Close the song list</p>
            <p><strong>Ctrl + M</strong>: Open/Close the Anime List tab from the Settings modal</p>
        </div>
    `
});