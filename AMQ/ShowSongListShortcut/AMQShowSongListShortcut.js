// ==UserScript==
// @name         AMQ Show Song List Shortcut
// @namespace    https://github.com/JabroAMQ/
// @version      0.1
// @description  Open/Close the song list when pressing Ctrl+Q
// @author       Jabro
// @match        https://*.animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @downloadURL  https://github.com/JabroAMQ/Utilities/blob/main/AMQ/ShowSongListShortcut/AMQShowSongListShortcut.user.js
// @updateURL    https://github.com/JabroAMQ/Utilities/blob/main/AMQ/ShowSongListShortcut/AMQShowSongListShortcut.user.js
// ==/UserScript==

const DELAY = 500;

if (document.getElementById('loginPage'))
    return;

let loadInterval = setInterval(() => {
    if ($('#loadingScreen').hasClass('hidden')) {
        clearInterval(loadInterval);
        bindKey();
    }
}, DELAY);

function bindKey() {
    document.addEventListener('keyup', function(e) {
        if (e.ctrlKey && e.key.toLowerCase() === 'q') {
            e.preventDefault();
            e.stopPropagation();

            if (typeof songHistoryWindow !== 'undefined' && typeof songHistoryWindow.trigger === 'function') {
                songHistoryWindow.trigger();
            } else {
                console.error('songHistoryWindow.trigger() is not available in this context.');
            }
        }
    }, true);
}