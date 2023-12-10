// ==UserScript==
// @name         AMQ Song Info Downloader
// @namespace    https://github.com/JabroAMQ/
// @version      0.1
// @description  Download some info from the songs that played during an AMQ round into a txt file
// @author       Spitzell, Jabro
// @match        https://animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @downloadURL  https://github.com/JabroAMQ/Utilities/blob/main/AMQ/SongsDownloader/AMQSongInfoDownloader.js
// @updateURL    https://github.com/JabroAMQ/Utilities/blob/main/AMQ/SongsDownloader/AMQSongInfoDownloader.js
// ==/UserScript==


const DOMAIN = 'https://nl.catbox.video/';


// Load the script once the game has started
let loadInterval = setInterval(() => {
    let loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen && loadingScreen.classList.contains('hidden')) {
        setup();
        clearInterval(loadInterval);
    }
}, 500);


function setup() {
    let allSongs = '';

    // Reset song list for the new round
    let quizReadyListener = new Listener('quiz ready', (_) => {
        allSongs = '';
    });

    // Get song data on answer reveal
    let answerResultsListener = new Listener('answer results', (result) => {
        let newSong = result.songInfo;
        let songUrl = `${DOMAIN}${newSong.videoTargetMap.catbox[0]}`;
        let animeName = newSong.animeNames.romaji.replaceAll(',', '');
        let songName = newSong.songName.replaceAll(',', '');
        let songArtist = newSong.artist;
        let songType = newSong.type === 1 ? 'OP' : (newSong.type === 2 ? 'ED' : 'IN');
        songType = newSong.typeNumber === 0 ? songType : `${songType} ${newSong.typeNumber}`;
        allSongs += `${animeName},${songType},${songUrl},${songName},${songArtist}\n`;
    });

    // Download the songs once the quiz is over
    let quizOverListener = new Listener('quiz over', (_) => {
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(new Blob([allSongs], {type: 'text/plain'}));
        downloadLink.download = 'songsInfo.txt';
        downloadLink.click();
    });

    quizReadyListener.bindListener();
    answerResultsListener.bindListener();
    quizOverListener.bindListener();
}