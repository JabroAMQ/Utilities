# Script description

This script consist of 2 parts:

- An userscript for AMQ ([AMQSongInfoDownloader.user.js](AMQSongInfoDownloader.user.js)) that allows you to download a txt file with some info about the songs that played while you were playing.

- A python script ([main.py](main.py)) that takes as input the downloaded txt file, downloading all the songs from the file in MP3 format while tagging them with song name and artist info:

![OutputExample](images/output.png)


# Requirements

## Userscript

- [Tampermonkey](https://www.tampermonkey.net/) (or any other alternative option) for installing the AMQ script.

## Python script

- Python3.9+

- Third-party modules.

> [!TIP]
> You can check them in the [requirements.txt](requirements.txt) file and automatically install them through `pip`:
> 
> ```
> pip install -r requirements.txt
> ```


# How to use

## Userscript

- Join to an AMQ game. Once there, a "download" button will appear:

![DownloadButton](images/download_button.png)

- When you click on it, a file like [songsInfo.txt](songsInfo.txt) will be downloaded (in your default Downloads directory) with the information of all the songs that played while you were in the lobby.

- You can also modify how the AMQ script behaves. Your configuration will automatically be applied and saved for future sessions: 

![ScriptConfiguration](images/configuration.png)

## Python script

- Once you have downloaded your "songsInfo.txt" file, copy its content and paste it into the "songsInfo.txt" file from this directory.

- Execute then the [main.py](main.py) script:

```
python main.py
```

- A subdirectory called "output" will be created, containing all the downloaded songs as MP3s, just like in the image shown at the beginning of this document.


# Limitations

## Catbox

> [!NOTE]
> [Catbox](https://catbox.moe/), the site from where the songs are downloaded from, doesn't seem to rate limit your requests directly, but please do not try to download hundreds of songs at once.

If you are going to, please modify the [main.py](main.py) file to wait a bit between songs downloading.

Something like:

```
import time                                                     # ADD THIS LINE

...

if __name__ == '__main__':

    start_time = datetime.now()

    # Create the output directory if it doesn't exist yet
    os.makedirs(OUTPUT_DIRECTORY_PATH, exist_ok=True)

    songs = process_file_content()
    for song in songs:
        save_as_mp3(*song)
        time.sleep(5)                                           # ADD THIS LINE

    print(f'\nDone! It took: {str(datetime.now() - start_time)}')

```
