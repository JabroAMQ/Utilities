// ==UserScript==
// @name         AMQ Messages Autosender
// @namespace    https://github.com/JabroAMQ/
// @version      0.1
// @description  Allow the user to store some messages and autosend them when clicked
// @author       Jabro
// @match        https://animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqScriptInfo.js
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqWindows.js
// ==/UserScript==

AMQ_addScriptData({
    name: 'AMQ Messages Autosender',
    author: 'Jabro',
    link: 'https://github.com/JabroAMQ/Utilities/AMQ/',
    description: `
        <p>Allow the player to save custom messages and, once they are clicked, autosend them to game chat.</p>
    `
});

/*

TODO list:

- Prettify the window stuff

- Add functions to convert ":free:" into the free emoji (also for AMQ custom emojis (marSurrender))
    - Check nyamu's EmojiAnswer userscript: https://github.com/nyamu-amq/amq_scripts/blob/master/amqEmojiAnswer.user.js

- Add a modal to optionsContainer to be able to open the window if not in game
    - Check TheJoseph98's RigTracker userscript: https://github.com/joske2865/AMQ-Scripts/blob/master/amqRigTracker.user.js

- Add a warning popup window in sendMessageToGameChat() function rather than using console.error

- Fix the issue where very long saved messages surpass the button's limit dimensions

- Add description for AMQ_addScriptData() function

- @downloadURL, @updateURL and AMQ_addScriptData()'s link argument

*/

///////////////////////////////////////////////////////////////////
////////////////////////  INITIALIZATION   ////////////////////////
///////////////////////////////////////////////////////////////////

const CHECK_INTERVAL = 500;
const MAX_MESSAGE_LENGTH = 150;
const BUTTON_WIDTH = 30;
const BUTTON_MARGIN_RIGHT = 5;

let savedMessagesWindow;
let savedMessagesWindowButton;
let savedMessages = [];


// Load the script once the game has started
let loadInterval = setInterval(() => {
    let loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen && loadingScreen.classList.contains('hidden')) {
        loadSavedMessages();
        createSavedMessagesWindow();
        clearInterval(loadInterval);
    }
}, CHECK_INTERVAL);


///////////////////////////////////////////////////////////////////
/////////////////////////  WINDOW STUFF   /////////////////////////
///////////////////////////////////////////////////////////////////

function createSavedMessagesWindow() {
    savedMessagesWindow = new AMQWindow({
        title: 'Saved Messages',
        position: { x: 0, y: 34 },
        width: 400,
        height: 374,
        zIndex: 1010,
        resizable: true,
        draggable: true
    });

    addNewMessagePanel();
    addSavedMessagesPanel();
    setupSavedMessagesWindowButton();
}


function addNewMessagePanel() {
    savedMessagesWindow.addPanel({
        id: 'addNewMessagePanel',
        width: 1,
        height: 0.2,
        scrollable: { x: false, y: false }
    });

    savedMessagesWindow.panels[0].panel.append(createSeparatorLine());

    // Create a container leaving a 5% padding in all directions
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.width = '100%';
    container.style.height = '90%';

    // Add an input textfield inside the container allowing the user to write the messages they want to save
    const messageInput = document.createElement('input');
    messageInput.type = 'text';
    messageInput.id = 'newMessageTextField';
    messageInput.placeholder = 'Write a message here...';
    messageInput.style.color = 'black';
    messageInput.style.width = '75%';
    messageInput.style.height = '65%'
    messageInput.style.marginLeft = '5%';
    messageInput.style.marginRight = '5%';
    container.appendChild(messageInput);

    // Add a button to the container as well to save the message
    const saveButton = document.createElement('button');
    saveButton.innerHTML = 'Save';
    saveButton.onclick = saveMessage;
    saveButton.style.color = 'black';
    saveButton.style.width = '15%';
    saveButton.style.height = '65%';
    saveButton.style.marginRight = '5%';
    container.appendChild(saveButton);

    savedMessagesWindow.panels[0].panel.append(container);
    savedMessagesWindow.panels[0].panel.append(createSeparatorLine());
}


function addSavedMessagesPanel() {
    savedMessagesWindow.addPanel({
        id: 'savedMessagesPanel',
        width: 1,
        height: 0.8,
        scrollable: { x: false, y: true },
        position: { x: 0, y: 0.2 }
    });

    for (let message of savedMessages)
        addMessageContainerToPanel(message);
}

function addMessageContainerToPanel(textFieldValue) {    
    // Do not add the message if no message was introduced...
    if (textFieldValue.length <= 0)
        return;

    // Cut the string if its lenght is greater than AMQ's max message length value
    if (textFieldValue.length > MAX_MESSAGE_LENGTH)
        textFieldValue = textFieldValue.substring(0, MAX_MESSAGE_LENGTH);
    
    // Create a new container for each saved message
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.width = '100%';
    container.style.height = '10%';

    // Add a button to display the saved message. Click on it to send it to the gamechat
    const savedMessageButton = document.createElement('button');
    savedMessageButton.innerHTML = textFieldValue;
    savedMessageButton.onclick = function() { sendMessageToGameChat(textFieldValue); };
    savedMessageButton.style.color = 'black';
    savedMessageButton.style.width = '75%';
    savedMessageButton.style.marginLeft = '5%';
    savedMessageButton.style.marginRight = '5%';
    container.appendChild(savedMessageButton);

    // Add a delete button to remove the saved message
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'Delete';
    deleteButton.onclick = function () { deleteMessage(container, textFieldValue) };
    deleteButton.style.color = 'black';
    deleteButton.style.width = '15%';
    deleteButton.style.marginRight = '5%';
    container.appendChild(deleteButton);

    // Append the container to the 'savedMessagesPanel' panel
    savedMessagesWindow.panels[1].panel.append(container);
}


function createSeparatorLine() {
    const separator = document.createElement('div');
    separator.style.width = '100%';
    separator.style.height = '2px';
    separator.style.backgroundColor = 'black';
    return separator;
}


function setupSavedMessagesWindowButton() {
    savedMessagesWindowButton = $(`
        <div id='savedMessagesWindowButton' class='clickAble qpOption'>
            <i aria-hidden='true' class='fa fa-comments qpMenuItem'></i>
        </div>`)
        .css({
            width: `${BUTTON_WIDTH}px`,
            height: '100%',
            'margin-right': `${BUTTON_MARGIN_RIGHT}px`
        })
        .click(() => savedMessagesWindow.isVisible() ? savedMessagesWindow.close() : savedMessagesWindow.open())
        .popover({
			placement: 'bottom',
			content: 'Open Saved Messages Window',
			trigger: 'hover'
	    });

    let currentWidth = $('#qpOptionContainer').width();
    let extraWidth = BUTTON_WIDTH + BUTTON_MARGIN_RIGHT;
    $('#qpOptionContainer').width(currentWidth + extraWidth);
    $('#qpOptionContainer > div').append(savedMessagesWindowButton);
}


///////////////////////////////////////////////////////////////////
//////////////////////////  FUNCTIONALITY   ///////////////////////
///////////////////////////////////////////////////////////////////

function sendMessageToGameChat(content) {
    // Make sure we are in game
    let gameChatPage = document.getElementById('gameChatPage');
    if (!gameChatPage || gameChatPage.classList.contains('hidden')) {
        console.error('You cannot send a message to chat if you are not inside a lobby');
        return; 
    }

    // Paste the content into the chat input box
    let chatInput = document.getElementById('gcInput');
    chatInput.value = content;
    
    // Pretend "enter keypress" (send) event
    let enterEvent = new KeyboardEvent('keypress', { key: 'Enter', keyCode: 13 });
    chatInput.dispatchEvent(enterEvent);
}


function saveMessage() {
    let textFieldValue = document.getElementById('newMessageTextField').value;
    addMessageContainerToPanel(textFieldValue);

    // Log the changes for future sessions
    savedMessages.push(textFieldValue);
    storeSavedMessages();
}

function deleteMessage(container, textFieldValue) {
    // Remove the container from the panel
    container.parentNode.removeChild(container)

    // Log the changes for future sessions
    let index = savedMessages.indexOf(textFieldValue);
    savedMessages.splice(index, 1);
    storeSavedMessages();
}


///////////////////////////////////////////////////////////////////
//////////////////////////  COOKIES STUFF   ///////////////////////
///////////////////////////////////////////////////////////////////

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


function loadSavedMessages() {
    let savedMessagesString = getCookie('savedMessages');
    if (savedMessagesString)
        savedMessages = JSON.parse(savedMessagesString);
}

function storeSavedMessages() {
    let messagesString = JSON.stringify(savedMessages);
    setCookie('savedMessages', messagesString, 9999);
}