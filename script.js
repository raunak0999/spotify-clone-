console.log('lets write java script');

let currentSong = new Audio();
let songs;
let currFolder;

const play = document.getElementById("play");
const next = document.getElementById("next");
const previous = document.getElementById("previous");
const shuffleBtn = document.getElementById("shuffle");
const repeatBtn = document.getElementById("repeat");

let isShuffle = false;
let isRepeat = false;
let shuffledSongs = [];
let currentIndex = 0;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes} : ${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`./${folder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/").slice(-1)[0]);
        }
    }

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li><img class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")} </div>
                                <div>Raunak</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="play.svg" alt="">
                            </div>
                            </li>`;
    }

    // attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    } else {
        currentSong.pause();
        play.src = "play.svg";
    }
    // Decode URI and remove file extension for display
    let displayName = decodeURIComponent(track);
    displayName = displayName.replace(/\.[^/.]+$/, "");
    // Extract artist name from song list if available
    let artistName = "Raunak"; // default artist
    const songItems = document.querySelectorAll(".songlist ul li");
    songItems.forEach(item => {
        const songText = item.querySelector(".info div").textContent.trim();
        if (songText === displayName) {
            const artistDiv = item.querySelectorAll(".info div")[1];
            if (artistDiv) {
                artistName = artistDiv.textContent.trim();
            }
        }
    });
    // Format artist and song name in one line with separator
    const formattedInfo = `${artistName} - ${displayName}`;
    document.querySelector(".songinfo").textContent = formattedInfo;
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

async function displayAlbums() {
    let a = await fetch(`./songs/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer");
    Array.from(anchors).forEach(async e => {
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-1)[0];
            // get the metadata of the folder
            let a = await fetch(`./songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response);
            cardcontainer.innerHTML += `<div data-folder="${folder}" class="card ">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                                <circle cx="12" cy="12" r="11" fill="#1fdf64" />
                                <path d="M8 5v14l11-7z" fill="0000000" />
                            </svg>
                        </div>
                        <img src="songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
        }
    });

    // load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            currentIndex = 0;
            // playMusic(songs[0])
        });
    });
}

async function main() {
    // get the list of all the songs 
    await getSongs("songs/ncs");
    if (songs && songs.length > 0) {
        playMusic(songs[0], true);
        currentIndex = 0;
    }

    displayAlbums();

    // attach eventlistener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    shuffleBtn.addEventListener("click", () => {
        isShuffle = !isShuffle;
        shuffleBtn.style.filter = isShuffle ? "invert(0.5) sepia(1) saturate(5) hue-rotate(90deg)" : "invert(1)";
        if (isShuffle) {
            shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
        } else {
            shuffledSongs = [];
        }
    });

    repeatBtn.addEventListener("click", () => {
        isRepeat = !isRepeat;
        repeatBtn.style.filter = isRepeat ? "invert(0.5) sepia(1) saturate(5) hue-rotate(90deg)" : "invert(1)";
    });

    // listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".cricle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // add a event listener to seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".cricle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // add a event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // add a event listener for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        if (isShuffle) {
            currentIndex = (currentIndex - 1 + shuffledSongs.length) % shuffledSongs.length;
            playMusic(shuffledSongs[currentIndex]);
        } else {
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if ((index - 1) >= 0) {
                playMusic(songs[index - 1]);
            }
        }
    });

    next.addEventListener("click", () => {
        if (isShuffle) {
            currentIndex = (currentIndex + 1) % shuffledSongs.length;
            playMusic(shuffledSongs[currentIndex]);
        } else {
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1]);
            }
        }
    });

    // add a event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    // add event listener for library search
    const librarySearch = document.getElementById("librarySearch");
    librarySearch.addEventListener("input", () => {
        const filter = librarySearch.value.toLowerCase();
        const songItems = document.querySelectorAll(".songlist ul li");
        songItems.forEach(item => {
            const text = item.querySelector(".info div").textContent.toLowerCase();
            if (text.includes(filter)) {
                item.style.display = "";
            } else {
                item.style.display = "none";
            }
        });
    });

    // add event listener for song end to handle repeat and next
    currentSong.addEventListener("ended", () => {
        if (isRepeat) {
            currentSong.currentTime = 0;
            currentSong.play();
        } else {
            next.click();
        }
    });
}
main();
