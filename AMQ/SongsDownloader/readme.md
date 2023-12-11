# Script description

Given a txt file like [songsInfo.txt](songsInfo.txt), which contain some song's info obtained using Spitzell's AMQ script ([AMQSongInfoDownloader](AMQSongInfoDownloader.user.js)), download the songs from the file in MP3 format while tagging them with song name and artist info:

![OutputExample](images/output.png)


# Requirements

- Python3.9+

- Third-party modules are also used. You can check them in the [requirements.txt](requirements.txt) file.

> [!TIP]
> You can automatically install them through `pip`:
> 
> ```
> pip install -r requirements.txt
> ```


# How to use

- Install Spitzell's [AMQSongInfoDownloader](AMQSongInfoDownloader.user.js) with [Tampermonkey](https://www.tampermonkey.net/) (or any other alternative option) as you would with any other AMQ script.

- When you are in an AMQ game, a "download" button will appear:

![DownloadButton](images/download_button.png)

- When you click on it, the "songsInfo.txt" file will be downloaded (in your default Downloads directory) with the information of all the songs that played.

> [!IMPORTANT]
> You can modify how the AMQ script behaves from the own userscript:
>
> ![ScriptConfiguration](images/configuration.png)

- Copy the content of the downloaded "songsInfo.txt" file and paste it into the "songsInfo.txt" file from this directory.

- Execute [main.py](main.py) with python once the "songsInfo.txt" file from this directory contains the information of the desired songs to be downloaded as MP3s.

```
python main.py
```

- A subdirectory called "output" will be created, containing all the downloaded songs as MP3s, just like in the image shown at the beginning of this document.


# Limitations

## "Duplicates"

> [!NOTE]
> As you can see in the image above, the MP3s are downloaded with file name "ANIME_NAME SONG_TYPE NUMBER".
> If you were to download Gintama's OP 1, and then Gintama's OP 1 rebroad, the original OP 1 file will be overwriten as the file name would be the same.
> This is specially annoying for the Inserts case, as trying to download any 2 inserts from the same anime will overwrite the first one.

You could solve this issue by modifying the content of the "songsInfo.txt" file before executing the script so that the "Anime name" (first field) of the "duplicated" is different.

Of course you could also modify the [main.py](main.py) file as well so that the files's name are not "ANIME_NAME SONG_TYPE NUMBER". For instance, adding some random substring at the end of the MP3's file name:

```
import secrets                                                                                          # ADD THIS LINE

...

def save_as_mp3(anime_name : str, song_url : str, song_name : str, song_artist : str) -> None:
    """Download the MP3 file from the given URL and save it with the provided song info."""
    random_substring = secrets.token_hex(nbytes=2)                                                      # ADD THIS LINE
    output_file_path = os.path.join(OUTPUT_DIRECTORY_PATH, f'{anime_name} {random_substring}.mp3')      # MODIFY THIS LINE

    ...
```

## Catbox

> [!NOTE]
> [Catbox](https://catbox.moe/), the site from where the songs are downloaded from, doesn't seem to rate limit your requests directly, but please do not try to download hundreds of songs at once.

If you are going to, plase modify the [main.py](main.py) file to wait a bit between songs downloading.

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

    print(f'Done! It took: {str(datetime.now() - start_time)}')

```
