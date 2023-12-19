// ==UserScript==
// @name         AMQ Messages Autosender
// @namespace    https://github.com/JabroAMQ/
// @version      0.3.2
// @description  Allow the user to store some messages and autosend them when clicked
// @author       Jabro
// @match        https://animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqScriptInfo.js
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqWindows.js
// @downloadURL  https://github.com/JabroAMQ/Utilities/blob/main/AMQ/MessagesAutosender/AMQMessagesAutosender.user.js
// @updateURL    https://github.com/JabroAMQ/Utilities/blob/main/AMQ/MessagesAutosender/AMQMessagesAutosender.user.js
// ==/UserScript==

AMQ_addScriptData({
    name: 'AMQ Messages Autosender',
    author: 'Jabro',
    link: 'https://github.com/JabroAMQ/Utilities/blob/main/AMQ/MessagesAutosender/AMQMessagesAutosender.user.js',
    description: `
        <p>Allow the player to save custom messages and, once they are clicked, autosend them to game chat</p>
        <img src='https://github.com/JabroAMQ/Utilities/raw/main/AMQ/MessagesAutosender/images/ExampleGIF.gif' alt='ExampleGIF'>
        <p>You can open the window from an in-game button:</p>
        <img src='https://github.com/JabroAMQ/Utilities/raw/main/AMQ/MessagesAutosender/images/OpenButton.png' alt='OpenButton'>
        <p>Or from the options container:</p>
        <img src='https://github.com/JabroAMQ/Utilities/raw/main/AMQ/MessagesAutosender/images/OptionsContainer.png' alt='OptionsContainer'>
    `
});

/*

TODO list:
- Prettify the window stuff
- Fix the issue where very long saved messages surpass the button's limit dimensions
*/

///////////////////////////////////////////////////////////////////
////////////////////////  INITIALIZATION   ////////////////////////
///////////////////////////////////////////////////////////////////

const MAX_MESSAGE_LENGTH = 150;
let savedMessagesWindow;
let savedMessages = [];


// Do not load the script in the login page
if (document.getElementById('loginPage'))
    return;

// Wait until the LOADING... screen is hidden and load script
let loadInterval = setInterval(() => {
    if ($('#loadingScreen').hasClass('hidden')) {
        clearInterval(loadInterval);
        loadSavedMessages();
        createSavedMessagesWindow();
    }
}, 500);


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
    addSavedMessagesWindowToOptions();
    setupSavedMessagesWindowButton();
}


function addNewMessagePanel() {
    savedMessagesWindow.addPanel({
        id: 'addNewMessagePanel',
        width: 1,
        height: 0.2,
        scrollable: { x: true, y: false }
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
        scrollable: { x: true, y: true },
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


function addSavedMessagesWindowToOptions() {
    // Add a new list item to the optionsContainer
    let optionsContainer = document.getElementById('optionsContainer');

    let savedMessagesOption = document.createElement('li');
    savedMessagesOption.className = 'clickAble';
    savedMessagesOption.textContent = 'Saved Messages';
    savedMessagesOption.onclick = openSavedMessagesWindow;

    // Insert the new list item after the "Installed Userscripts" one
    let installedUserscriptsLi = optionsContainer.querySelector('ul [data-target="#installedModal"]');
    installedUserscriptsLi.parentNode.insertBefore(savedMessagesOption, installedUserscriptsLi.nextSibling);
}


function setupSavedMessagesWindowButton() {
    const buttonWidth = 30;
    const buttonMarginRight = 5;

    let savedMessagesWindowButton = $(`
        <div id='savedMessagesWindowButton' class='clickAble qpOption'>
            <i aria-hidden='true' class='fa fa-comments qpMenuItem'></i>
        </div>`)
        .css({
            width: `${buttonWidth}px`,
            height: '100%',
            'margin-right': `${buttonMarginRight}px`
        })
        .click(openSavedMessagesWindow)
        .popover({
			placement: 'bottom',
			content: 'Saved Messages',
			trigger: 'hover'
	    });

    let currentWidth = $('#qpOptionContainer').width();
    let extraWidth = buttonWidth + buttonMarginRight;
    $('#qpOptionContainer').width(currentWidth + extraWidth);
    $('#qpOptionContainer > div').append(savedMessagesWindowButton);
}


function showErrorModal() {
    Swal.fire({
        title: 'Unable to send the message',
        text: 'You can\'t send a message if you are not in a lobby.',
        showConfirmButton: true,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
}


///////////////////////////////////////////////////////////////////
//////////////////////////  FUNCTIONALITY   ///////////////////////
///////////////////////////////////////////////////////////////////

function openSavedMessagesWindow() {
    // Open the window if not visible and close it otherwise
    savedMessagesWindow.isVisible() ? savedMessagesWindow.close() : savedMessagesWindow.open()
}

function sendMessageToGameChat(content) {
    // Make sure we are in game
    let gameChatPage = document.getElementById('gameChatPage');
    if (!gameChatPage || gameChatPage.classList.contains('hidden')) {
        showErrorModal();
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

    // Find and convert emojis
    textFieldValue = translateShortcodeToUnicode(textFieldValue).text;

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