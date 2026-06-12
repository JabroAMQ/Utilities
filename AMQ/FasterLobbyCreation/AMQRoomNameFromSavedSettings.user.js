// ==UserScript==
// @name         AMQ Room Name from Saved Settings
// @namespace    https://github.com/JabroAMQ/
// @version      1.0.0
// @description  Automatically set the room name to the one stored when loading settings from saved settings
// @author       Jabro
// @match        https://*.animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @require      https://raw.githubusercontent.com/joske2865/AMQ-Scripts/master/common/amqScriptInfo.js
// @downloadURL  https://raw.githubusercontent.com/JabroAMQ/Utilities/main/AMQ/FasterLobbyCreation/AMQRoomNameFromSavedSettings.user.js
// @updateURL    https://raw.githubusercontent.com/JabroAMQ/Utilities/main/AMQ/FasterLobbyCreation/AMQRoomNameFromSavedSettings.user.js
// ==/UserScript==

const VERSION = '1.0.0';
const DELAY = 500;

if (document.getElementById('loginPage')) return;
let loadInterval = setInterval(() => {
    if ($('#loadingScreen').hasClass('hidden')) {
        clearInterval(loadInterval);
        initRoomNameFromSavedSettings();
    }
}, DELAY);

function initRoomNameFromSavedSettings() {
    $('#mhLoadListEntryContainer').on('click', '.mhLoadEntryNameContainer', function() {
        const roomName = $(this).find('.mhLoadEntryName').text().trim();
        if (roomName) {
            $('#mhRoomNameInput').val(roomName);
        }
    });
}

AMQ_addScriptData({
    name: 'Room Name from Saved Settings',
    author: 'Jabro',
    link: 'https://github.com/JabroAMQ/Utilities/blob/main/AMQ/FasterLobbyCreation/AMQRoomNameFromSavedSettings.user.js',
    version: VERSION,
    description: `
        <div style="max-width: 500px;">
            <p>Automatically set the room name to the one stored when loading settings from saved settings.</p>
            <img src="https://raw.githubusercontent.com/JabroAMQ/Utilities/main/AMQ/FasterLobbyCreation/images/RoomNameFromSavedSettings/example.png" alt="example" style="max-width: 100%; height: auto; margin-top: 5px; border-radius: 4px;" />
        </div>
    `
});