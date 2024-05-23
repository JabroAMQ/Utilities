// ==UserScript==
// @name         AMQ Room Name and Password Autosetters
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  Automatically set the room's name and password (if any) to the last ones you used so that you don't have to write them again each time you host a lobby
// @author       Jabro
// @match        https://animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @require      https://raw.githubusercontent.com/joske2865/AMQ-Scripts/master/common/amqScriptInfo.js
// @downloadURL  https://github.com/JabroAMQ/Utilities/blob/main/AMQ/FasterLobbyCreation/AMQRoomNameAndPasswordAutosetters.user.js
// @updateURL    https://github.com/JabroAMQ/Utilities/blob/main/AMQ/FasterLobbyCreation/AMQRoomNameAndPasswordAutosetters.user.js
// ==/UserScript==

const VERSION = '0.1.1';
const DELAY = 500;
let lastRoomName;
let lastRoomPassword;
let wasLastRoomPrivate;


if (document.getElementById('loginPage'))
    return;

const loadInterval = setInterval(() => {
    if ($('#loadingScreen').hasClass('hidden')) {
        clearInterval(loadInterval);
        loadConfig();
        loadRoomDataListener();
        saveRoomDataListeners();
    }
}, DELAY);


function loadRoomDataListener() {
    $('#roomBrowserHostButton').click(function() {
        document.getElementById('mhRoomNameInput').value = lastRoomName;
        if (wasLastRoomPrivate) {
            document.getElementById('mhPrivateRoom').checked = true;
            document.getElementById('mhPasswordInput').classList.remove('hide');
            document.getElementById('mhPasswordInput').value = lastRoomPassword;
        }
    });
}

function saveRoomDataListeners() {
    $('#mhHostButton').click(function() { saveConfig(); });
    $('#mhChangeButton').click(function() { saveConfig(); });
}


// Cookies stuff: https://stackoverflow.com/a/24103596/20214407
function loadConfig() {
    lastRoomName = getCookie('lastRoomName') || '';
    lastRoomPassword = getCookie('lastRoomPassword') || '';
    wasLastRoomPrivate = getCookie('wasLastRoomPrivate') === 'true';
}

function saveConfig() {
    lastRoomName = document.getElementById('mhRoomNameInput').value
    lastRoomPassword = document.getElementById('mhPasswordInput').value
    wasLastRoomPrivate = lastRoomPassword != ''

    setCookie('lastRoomName', lastRoomName, 9999);
    setCookie('lastRoomPassword', lastRoomPassword, 9999);
    setCookie('wasLastRoomPrivate', wasLastRoomPrivate, 9999);
}

function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ')
            c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0)
            return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function setCookie(name, value, days) {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + value + expires + '; path=/';
}


AMQ_addScriptData({
    name: 'AMQ Last Room Name and Password Autosetter',
    author: 'Jabro',
    link: 'https://github.com/JabroAMQ/Utilities/blob/main/AMQ/FasterLobbyCreation/AMQRoomNameAndPasswordAutosetters.user.js',
    version: VERSION,
    description: `
        <p>Automatically set the room's name and password (if any) to the last ones you used so that you don't have to write them again each time you host a lobby.</p>
        <p>The room's name and password stored values are updated once you host a lobby, or when you change the lobby settings.</p>
    `
});