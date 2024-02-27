// ==UserScript==
// @name         AMQ Cancer Removal
// @namespace    https://github.com/JabroAMQ/
// @version      0.1
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


const VERSION = 0.1;        // Documentation purposes only. Make sure this value matches with the @version one from the userscript header
let ignoreScript = false;   // Modified in-game through an in-game button located in the footer of the settings container
const DELAY = 500;          // Manual delay among functions (milliseconds) to ensure instructions are executed in a fashion order


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
                <li>- [TODO] The player (using this script) is promoted to host while in the lobby.</li>
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
ignoreButton.className = 'btn btn-primary';
ignoreButton.id = 'mhCancerButton'
ignoreButton.textContent = 'Cancer';    // No space for a more descriptive button name :(

// Add the desired functionallity to the button
ignoreButton.addEventListener('click', function() {
    ignoreScript = !ignoreScript;

    // Modify the modal text based on the value of ignoreScript var
    var modalText = ignoreScript
        ? 'The script has now been disabled. The settings won\'t be changed by the script anymore.'
        : 'The script has now been enabled. The settings can now be modified by the script to prevent unpleasant game modifiers.';

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
// TODO


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