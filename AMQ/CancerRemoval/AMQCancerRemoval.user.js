// ==UserScript==
// @name         AMQ Cancer Removal
// @namespace    https://github.com/JabroAMQ/
// @version      0.3
// @description  Automatically turns off dubs and rebroadcasts from lobby settings
// @author       Jabro
// @match        https://animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @require      https://raw.githubusercontent.com/joske2865/AMQ-Scripts/master/common/amqScriptInfo.js
// @downloadURL  https://github.com/JabroAMQ/Utilities/blob/main/AMQ/CancerRemoval/AMQCancerRemoval.user.js
// @updateURL    https://github.com/JabroAMQ/Utilities/blob/main/AMQ/CancerRemoval/AMQCancerRemoval.user.js
// ==/UserScript==


// Do not load the script in the login page
if (document.getElementById('loginPage'))
    return;


const VERSION = '0.3';      // Documentation purposes only. Make sure this value matches with the @version one from the userscript header
const DELAY = 500;          // Manual delay among functions (milliseconds) to ensure instructions are executed in a fashion order

let ignoreScript;           // Modified in-game through an in-game button located in the footer of the settings container
loadConfig();               // Set a value for the configuration variables (ignoreScript only in this case) retrieved through cookies


AMQ_addScriptData({
    name: 'AMQ Cancer Removal',
    author: 'Jabro',
    link: 'https://github.com/JabroAMQ/Utilities/blob/main/AMQ/CancerRemoval/AMQCancerRemoval.user.js',
    version: VERSION,
    description: `
        <div>
            <p>Automatically change some settings modifiers from the lobby:</p>
            <ul>
                <li>- Turns off rebroadcast and dubs songs.</li>
                <li>- Turns on skip guessing and skip replay options.</li>
            </ul>
        </div>

        <div>
            <p>The changes are applied when:</p>
            <ul>
                <li>- The lobby is created.</li>
                <li>- The host (using this script) modifies the lobby settings.</li>
                <li>- The player (using this script) is promoted to host while in the lobby.</li>
            </ul>
        </div>

        <div>
            <p>You can turn off this behavior from the own game by clicking on the "Cancer" button found in the footer of the settings modal:</p>
            <img src='https://github.com/JabroAMQ/Utilities/raw/main/AMQ/CancerRemoval/images/cancer_button.png' alt='Cancer Button'>
        </div>
    `
});


//////////////
// UI STUFF //
//////////////
// Create a button to allow the user to ignore this script when clicked
var ignoreButton = document.createElement('button');
ignoreButton.type = 'button';
ignoreButton.className = ignoreScript ? 'btn btn-default' : 'btn btn-primary';
ignoreButton.id = 'mhCancerButton'
ignoreButton.innerHTML = '♋';

// Add the desired functionallity to the button
ignoreButton.addEventListener('click', function() {
    // Modify the value of ignoreScript and save it as cookie to remember it in future sessions
    ignoreScript = !ignoreScript;
    saveConfig();

    // Modify the cancer button class and the text of the modal based on the value of ignoreScript var
    ignoreButton.className = ignoreScript ? 'btn btn-default' : 'btn btn-primary';
    var modalText = ignoreScript
        ? 'The script has now been disabled. The settings won\'t be changed by the script anymore.'
        : 'The script has now been enabled. The settings can now be modified by the script to prevent unpleasant game modifiers.';

    // Send a "debug" modal to inform the user that the change was applied
    Swal.fire({
        title: 'AMQ Cancer Removal Script',
        text: modalText,
        showConfirmButton: true,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
});

// Insert the button in the settings container's footer
var modalFooter = document.querySelector('#mhHostSettingContainer .modal-footer');
var mainButton = modalFooter.querySelector('.btn-primary');
modalFooter.insertBefore(ignoreButton, mainButton);


///////////////////////////////////////////////////
// MODIFIED BEHAVIOUR OF THE "HOST LOBBY" BUTTON //
///////////////////////////////////////////////////
// Ideally rather than modifying the onclick behaviour, we should add an event listener to perform the additional behaviour
$('#mhHostButton').removeAttr('onclick');
$('#mhHostButton').click(() => {
    // Host a lobby with the settings stablished by the host
    roomBrowser.host();

    // Check for cancer settings and modify them if so...
    setTimeout(() => {
        if (cancerFound())
            changeSettings();
    }, DELAY);
});


//////////////////////////////////////////////////////////////
// MODIFIED BEHAVIOUR OF THE "CHANGE LOBBY SETTINGS" BUTTON //
//////////////////////////////////////////////////////////////
// Ideally rather than modifying the onclick behaviour, we should add an event listener to perform the additional behaviour
$('#mhChangeButton').removeAttr('onclick');
$('#mhChangeButton').click(() => {
    // Change the lobby with the settings established by the host
    lobby.changeGameSettings();

    // Check for cancer settings and modify them if so...
    setTimeout(() => {
        if (cancerFound())
            changeSettings();
    }, DELAY);
});


//////////////////////////////////////////////////////////
// MODIFIED BEHAVIOUR WHEN BEING PROMOTED TO LOBBY HOST //
//////////////////////////////////////////////////////////
new Listener('Host Promotion', (payload) => {
	var newHost = payload.newHost;

    // If we have just been promoted to host while in lobby
    if (newHost === selfName && lobby.inLobby) {
        // Check for cancer settings and modify them if so...
        if (cancerFound())
            changeSettings();
    }
}).bindListener();


/////////////////////////////////
// SHARED SCRIPT FUNCTIONALITY //
/////////////////////////////////
function cancerFound() {
    if (ignoreScript)
        return false;

    // Cancer detected if:
    //  - Rebroadcasts and/or Dubs are On
    //  - Skip Guessing and/or Skip Results are Off
    var cancerDetected = lobby.settings.modifiers.rebroadcastSongs ||
                         lobby.settings.modifiers.dubSongs ||
                         !lobby.settings.modifiers.skipGuessing ||
                         !lobby.settings.modifiers.skipReplay;

    return cancerDetected;
}

function changeSettings() {
    // Notify the players that cancer settings were found
    setTimeout(() => {
        sendChatMessage('**Script:** Unpleasant settings detected...');

        // Modify the lobby settings accordingly
        setTimeout(() => {
            removeCancer();

            // Confirm changes applied
            setTimeout(() => {
                sendChatMessage('**Script:** :sweat_smile:');

            }, DELAY);
        }, DELAY);
    }, DELAY);
}

function removeCancer() {
    // Turn off Rebroadcasts and Dubs
    $('#mhRebroadcastSongs').prop('checked', false);
    $('#mhDubSongs').prop('checked', false);

    // Turn on Skip Guessing and Skip Results
    $('#mhGuessSkipping').prop('checked', true);
    $('#mhReplaySkipping').prop('checked', true);

    // Apply the changes
    lobby.changeGameSettings();
}

function sendChatMessage(content) {
    // NOTE: ideally we want to send a system message rather than a player message like in the line below.
    // NOTE: line below not ideal since it makes the message only visible to the player running this script, not everyone in the lobby
    //gameChat.systemMessage(content);

    var chatInput = document.getElementById('gcInput');
    chatInput.value = content;

    var enterEvent = new KeyboardEvent('keypress', { key: 'Enter', keyCode: 13 });
    chatInput.dispatchEvent(enterEvent);
}


///////////////////
// COOKIES STUFF //
///////////////////
// https://stackoverflow.com/a/24103596/20214407
function getCookie(name) {
    let nameEQ = name + '=';
    let ca = document.cookie.split(';');
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
        let date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + value + expires + '; path=/';
}

function loadConfig() {
    let ignoreScriptString = getCookie('ignoreScript');
    ignoreScript = ignoreScriptString === 'true';
}

function saveConfig() {
    let ignoreScriptString = ignoreScript.toString();
    setCookie('ignoreScript', ignoreScriptString, 9999);
}