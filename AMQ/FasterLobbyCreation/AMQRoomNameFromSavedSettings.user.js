// ==UserScript==
// @name         AMQ Room Name from Saved Settings
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  Automatically set the room name to the one stored when loading settings from saved settings
// @author       Jabro
// @match        https://animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @require      https://raw.githubusercontent.com/joske2865/AMQ-Scripts/master/common/amqScriptInfo.js
// @downloadURL  https://github.com/JabroAMQ/Utilities/blob/main/AMQ/FasterLobbyCreation/AMQRoomNameFromSavedSettings.user.js
// @updateURL    https://github.com/JabroAMQ/Utilities/blob/main/AMQ/FasterLobbyCreation/AMQRoomNameFromSavedSettings.user.js
// ==/UserScript==

const VERSION = '0.1.1';


if (document.getElementById('loginPage'))
    return;

let loadInterval = setInterval(() => {
    if ($('#loadingScreen').hasClass('hidden')) {
        clearInterval(loadInterval);
        roomNameFromSavedSettings();
    }
}, 500);


function roomNameFromSavedSettings() {
    const savedSettings = document.querySelectorAll('.mhLoadEntryName.clickAble');
    savedSettings.forEach(function(entry) {
        entry.addEventListener('click', function() {
            const roomName = entry.innerText;
            document.getElementById('mhRoomNameInput').value = roomName;
        });
    });
}


AMQ_addScriptData({
    name: 'AMQ Room Name from Saved Settings',
    author: 'Jabro',
    link: 'https://github.com/JabroAMQ/Utilities/blob/main/AMQ/FasterLobbyCreation/AMQRoomNameFromSavedSettings.user.js',
    version: VERSION,
    description: `
        <div>
            <p>Automatically set the room name to the one stored when loading settings from saved settings:</p>
            <img src='https://raw.githubusercontent.com/JabroAMQ/Utilities/main/AMQ/FasterLobbyCreation/images/RoomNameFromSavedSettings/example.png' alt='example'>
        </div>
    `
});