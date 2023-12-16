// ==UserScript==
// @name         AMQ Song Info Downloader
// @namespace    https://github.com/JabroAMQ/
// @version      0.3
// @description  Download some info from the songs that played while playing AMQ
// @author       Jabro, Spitzell
// @match        https://animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqWindows.js
// @downloadURL  https://github.com/JabroAMQ/Utilities/blob/main/AMQ/SongsDownloader/AMQSongInfoDownloader.user.js
// @updateURL    https://github.com/JabroAMQ/Utilities/blob/main/AMQ/SongsDownloader/AMQSongInfoDownloader.user.js
// ==/UserScript==

/*
TODO LIST:

- Prettify the output of `addSelectBox()` and `addCheckBox()` in CONFIGURATION WINDOW STUFF

- Modify the way the user can access to the Configuration Window:
    - Rather than having an in-game button that open a window for configuration (using TheJoseph98's `AMQWindow()` function)
    - Make so that the configuration window can be opened from the Settings like in nyamu's amqHighlightFriends script case:
    - https://github.com/nyamu-amq/amq_scripts/blob/master/amqHighlightFriends.user.js
    - This is:
        - https://i.imgur.com/iyEGnZm.png
        - https://i.imgur.com/WkkvJkg.png
    - Ideally we want to create a new Tab for this script
    - It should only require to  modify `createConfigWindow()` in CONFIGURATION WINDOW STUFF (and delete `setupConfigWindowButton()`)

- Add more functionallity (event listeners), and add these new options to the Configuration Window:
    - autoDownloadOnKickedFromLobby
    - autoDownloadOnServerRestart

*/

const CHECK_INTERVAL = 500;
const buttonWidth = 30;
const buttonMarginRight = 5;
const DOMAINS = {
    'EU': 'https://nl.catbox.video/',
    'NA1': 'https://ladst1.catbox.video/',
    'NA2': 'https://abdist1.catbox.video/'
};

let configWindow;
let configWindowButton;
let quizReadyListener;
let quizOverListener;
let selectedDomain = 'EU';
let autoDownloadOnQuizOver = false;
let clearSongsInfoOnNewQuiz = false;
let allSongs = [];

// Load the script once the game has started
let loadInterval = setInterval(() => {
    let loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen && loadingScreen.classList.contains('hidden')) {
        loadUserConfig();
        setup();
        clearInterval(loadInterval);
    }
}, CHECK_INTERVAL);

function setup() {
    setupDownloadButton();
    setupListeners();
    createConfigWindow();
}


////////////////////////////////////////////////////////////////////////////////
//////////////////////////  DOWNLOAD SONG INFO STUFF   /////////////////////////
////////////////////////////////////////////////////////////////////////////////

class SongInfo {

    constructor(result) {
        let newSong = result.songInfo;
        this.animeName = newSong.animeNames.romaji.replaceAll(',', '');
        this.songName = newSong.songName.replaceAll(',', '');
        this.songArtist = newSong.artist;
        this.songType = newSong.type === 1 ? 'OP' : (newSong.type === 2 ? 'ED' : 'IN');
        this.songType = newSong.typeNumber === 0 ? this.songType : `${this.songType} ${newSong.typeNumber}`;
        this.songUrlPath = newSong.videoTargetMap.catbox[0];
    }

    getSongInfo() {
        let songUrl = `${DOMAINS[selectedDomain]}${this.songUrlPath}`;
        return `${this.animeName},${this.songType},${songUrl},${this.songName},${this.songArtist}`;
    }

}


function setupDownloadButton() {
    let downloadButton = $(`
        <div id='downloadButton' class='clickAble qpOption'>
            <i aria-hidden='true' class='fa fa-download qpMenuItem'></i>
        </div>`)
        .css({
            width: `${buttonWidth}px`,
            height: '100%',
            'margin-right': `${buttonMarginRight}px`
        })
        .click(function () {
            downloadSongsInfo();
        })
        .popover({
			placement: 'bottom',
			content: 'Download Song Info',
			trigger: 'hover'
	    });

    let currentWidth = $('#qpOptionContainer').width();
    let extraWidth = buttonWidth + buttonMarginRight;
    $('#qpOptionContainer').width(currentWidth + extraWidth);
    $('#qpOptionContainer > div').append(downloadButton);
}


function setupListeners() {
    // Get song data on answer reveal
    let answerResultsListener = new Listener('answer results', result => {
        let newSongInfo = new SongInfo(result)
        allSongs.push(newSongInfo);
    });
    answerResultsListener.bindListener();

    // Reset song list for the new round
    quizReadyListener = new Listener('quiz ready', () => {
        clearSongsInfo();
    });
    if (clearSongsInfoOnNewQuiz)
        quizReadyListener.bindListener();

    // Download the songs once the quiz is over
    quizOverListener = new Listener('quiz over', () => {
        downloadSongsInfo();
    });
    if (autoDownloadOnQuizOver)
        quizOverListener.bindListener();
}

function updateClearSongsInfoOnNewQuizListener() {
    clearSongsInfoOnNewQuiz ? quizReadyListener.bindListener() : quizReadyListener.unbindListener();
}

function updateAutoDownloadOnQuizOverListener() {
    autoDownloadOnQuizOver ? quizOverListener.bindListener() : quizOverListener.unbindListener();
}


function downloadSongsInfo() {
    const allSongsString = allSongs.map(song => song.getSongInfo()).join('\n');
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(new Blob([allSongsString], {type: 'text/plain'}));
    downloadLink.download = 'songsInfo.txt';
    downloadLink.click();
}

function clearSongsInfo() {
    // https://stackoverflow.com/a/1232046/20214407
    allSongs.length = 0;
}


////////////////////////////////////////////////////////////////////////////////
//////////////////////////  CONFIGURATION WINDOW STUFF   ///////////////////////
////////////////////////////////////////////////////////////////////////////////

function createConfigWindow() {
    configWindow = new AMQWindow({
        title: 'Song Info Downloader Configuration',
        position: { x: 0, y: 34 },
        width: 400,
        height: 300,
        zIndex: 1010,
        resizable: false,
        draggable: true
    });

    configWindow.addPanel({
        id: 'configWindowPanel',
        width: 1.0,
        height: 'calc(100%)',
        scrollable: { x: false, y: false }
    });

    addSelectBox('Change prefered host', Object.keys(DOMAINS), (value) => {
        selectedDomain = value;
        saveUserConfig();
    }, selectedDomain);

    addCheckBox('Autodownload on quiz end', (checked) => {
        autoDownloadOnQuizOver = checked;
        saveUserConfig();
        updateAutoDownloadOnQuizOverListener();
    }, autoDownloadOnQuizOver);

    addCheckBox('Reset songlist on quiz start', (checked) => {
        clearSongsInfoOnNewQuiz = checked;
        saveUserConfig();
        updateClearSongsInfoOnNewQuizListener();
    }, clearSongsInfoOnNewQuiz);

    setupConfigWindowButton();
}

function addSelectBox(label, options, onChangeCallback, defaultValue) {
    let id = label.replace(/\s/g, '');

    let selectContainer = $('<div>')
        .css({
            'margin-top': '15px',
            'margin-bottom': '20px',
            'margin-left': '15px',
            'display': 'flex',
            'align-items': 'center'
        });

    let select = $('<select>')
        .attr('id', id)
        .css({
            'margin-right': '10px',
            'width': '70px',
            'color': 'black',
        })
        .val(defaultValue);

    options.forEach(option => {
        let optionElement = $('<option>').text(option)
            .attr('value', option)
            .css({
                'color': 'black'
            });

        if (option === defaultValue)
            optionElement.attr('selected', 'selected');
        select.append(optionElement);
    });

    select.on('change', function () {
        onChangeCallback($(this).val());
    });

    let selectLabel = $(`<label for='${id}'>${label}</label>`)
        .css({
            'font-size': '14px',
            'margin-right': '10px'
        });

    selectContainer.append(selectLabel, select);
    configWindow.panels[0].panel.append(selectContainer);
}

function addCheckBox(label, onChangeCallback, defaultValue) {
    let id = label.replace(/\s/g, '');

    let checkboxContainer = $('<div>')
        .css({
            'margin-top': '15px',
            'margin-left': '15px',
            'display': 'flex',
            'align-items': 'bottom'
        });

    let checkbox = $(`<input type='checkbox' id='${id}' name='${id}'>`)
        .css({
            'margin-right': '10px',
            'width': '20px',
            'height': '20px'
        })
        .prop('checked', defaultValue);

    checkbox.on('change', function () {
        onChangeCallback($(this).prop('checked'));
    });

    let checkboxLabel = $(`<label for='${id}'>${label}</label>`)
        .css({
            'font-size': '14px'
        });

    checkboxContainer.append(checkbox, checkboxLabel);
    configWindow.panels[0].panel.append(checkboxContainer);
}


function setupConfigWindowButton() {
    configWindowButton = $(`
        <div id='configWindowButton' class='clickAble qpOption'>
            <i aria-hidden='true' class='fa fa-cogs qpMenuItem'></i>
        </div>`)
        .css({
            width: `${buttonWidth}px`,
            height: '100%',
            'margin-right': `${buttonMarginRight}px`
        })
        .click(() => configWindow.isVisible() ? configWindow.close() : configWindow.open())
        .popover({
			placement: 'bottom',
			content: 'Song Info Configuration',
			trigger: 'hover'
	    });

    let currentWidth = $('#qpOptionContainer').width();
    let extraWidth = buttonWidth + buttonMarginRight;
    $('#qpOptionContainer').width(currentWidth + extraWidth);
    $('#qpOptionContainer > div').append(configWindowButton);
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
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
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


function loadUserConfig() {
    selectedDomain = getCookie('selectedDomain') || selectedDomain;
    autoDownloadOnQuizOver = getCookie('autoDownloadOnQuizOver') === 'true';
    clearSongsInfoOnNewQuiz = getCookie('clearSongsInfoOnNewQuiz') === 'true';
}

function saveUserConfig() {
    setCookie('selectedDomain', selectedDomain, 9999);
    setCookie('autoDownloadOnQuizOver', autoDownloadOnQuizOver, 9999);
    setCookie('clearSongsInfoOnNewQuiz', clearSongsInfoOnNewQuiz, 9999);
}