// ==UserScript==
// @name         AMQ Room Name and Password Autosetters
// @namespace    https://github.com/JabroAMQ/
// @version      1.0.0
// @description  Automatically set the room's name and password (if any) to the last ones to avoid writting them each time you host a lobby
// @author       Jabro
// @match        https://*.animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @require      https://raw.githubusercontent.com/joske2865/AMQ-Scripts/master/common/amqScriptInfo.js
// @downloadURL  https://raw.githubusercontent.com/JabroAMQ/Utilities/main/AMQ/FasterLobbyCreation/AMQRoomNameAndPasswordAutosetters.user.js
// @updateURL    https://raw.githubusercontent.com/JabroAMQ/Utilities/main/AMQ/FasterLobbyCreation/AMQRoomNameAndPasswordAutosetters.user.js
// ==/UserScript==

const VERSION = '1.0.0';
const DELAY = 500;
let lastRoomName;
let lastRoomPassword;
let wasLastRoomPrivate;

if (document.getElementById('loginPage')) return;
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
        // Set the room name
        $('#mhRoomNameInput').val(lastRoomName);

        // Make the room public/private
        if (wasLastRoomPrivate && !$('#mhPrivateRoom').prop('checked')) {
            $('#mhPrivateRoom').click();
        } else if (!wasLastRoomPrivate && $('#mhPrivateRoom').prop('checked')) {
            $('#mhPrivateRoom').click();
        }

        // Set the password, if the room is private
        if (wasLastRoomPrivate) {
            $('#mhPasswordInput').val(lastRoomPassword);
        } else {
            $('#mhPasswordInput').val('');
        }
    });
}

function saveRoomDataListeners() {
    $('#mhHostButton').click(function() { saveConfig(); });
    $('#mhChangeButton').click(function() { saveConfig(); });
}

function loadConfig() {
    lastRoomName = localStorage.getItem('AMQ_lastRoomName') || '';
    lastRoomPassword = localStorage.getItem('AMQ_lastRoomPassword') || '';
    wasLastRoomPrivate = localStorage.getItem('AMQ_wasLastRoomPrivate') === 'true';
}

function saveConfig() {
    wasLastRoomPrivate = $('#mhPrivateRoom').prop('checked');
    lastRoomName = $('#mhRoomNameInput').val();
    lastRoomPassword = wasLastRoomPrivate ? $('#mhPasswordInput').val() : '';

    localStorage.setItem('AMQ_lastRoomName', lastRoomName);
    localStorage.setItem('AMQ_lastRoomPassword', lastRoomPassword);
    localStorage.setItem('AMQ_wasLastRoomPrivate', wasLastRoomPrivate);
}

AMQ_addScriptData({
    name: 'Last Room Name and Password Autosetter',
    author: 'Jabro',
    link: 'https://github.com/JabroAMQ/Utilities/blob/main/AMQ/FasterLobbyCreation/AMQRoomNameAndPasswordAutosetters.user.js',
    version: VERSION,
    description: `
        <p>Automatically set the room's name and password (if any) to the last ones you used so that you don't have to write them again each time you host a lobby.</p>
        <p>The room's name and password stored values are updated once you host a lobby, or when you change the lobby settings.</p>
    `
});