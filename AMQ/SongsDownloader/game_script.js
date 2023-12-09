// ==UserScript==
// @name         ResearchBOT
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Spitzell
// @match        https://animemusicquiz.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// ==/UserScript==

// Don't load on login page
if (document.getElementById('startPage')) return;

// Wait until the LOADING... screen is hidden and load script
let loadInterval = setInterval(() => {
    if (document.getElementById('loadingScreen').classList.contains('hidden')) {
        setup();
        clearInterval(loadInterval);
    }
}, 500);

let texto = ''

function setup() {
    // Reset song list for the new round
    let quizReadyListener = new Listener('quiz ready', (data) => {
        texto = ''
    });

    // Get song data on answer reveal
    let answerResultsListener = new Listener('answer results', (result) => {
        setTimeout(() => {
            let newSong = {
                name: result.songInfo.songName,
                artist: result.songInfo.artist,
                anime: result.songInfo.animeNames,
                type: result.songInfo.type === 3 ? 'IN' : (result.songInfo.type === 2 ? 'ED' : 'OP'),
                urls: result.songInfo.videoTargetMap.catbox
            };

            for (let host in newSong.urls) {
                for (let resolution in newSong.urls[host]) {
                    let video = 'https://nl.catbox.video/' + newSong.urls[0]
                    let name = newSong.anime.romaji
                    let name2 = name.replace(',', '')
                    let songName = newSong.name
                    let songName2 = songName.replace(',', '')
                    texto += name2 + ',' + newSong.type + ' ' + result.songInfo.typeNumber + ',' + video + ',' + songName2 + ',' + newSong.artist + '\n'
                    break;
                }
                break;
            }
        }, 0);
    });

    // Reset songs on returning to lobby
    let quizOverListener = new Listener('quiz over', (roomSettings) => {
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob([texto], {type: 'text/plain'}));
        a.download = 'demo.txt';
        a.click();
    });

    // Triggers when loading rooms in the lobby, this is to detect when a player leaves the lobby to reset the song list table
    let quizLeaveListener = new Listener('New Rooms', (rooms) => {
    });

    quizReadyListener.bindListener();
    answerResultsListener.bindListener();
    quizOverListener.bindListener();
    quizLeaveListener.bindListener();
}