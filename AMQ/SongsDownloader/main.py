import os
import re
import sys
from typing import Final, NamedTuple
from datetime import datetime

import requests
import eyed3


# Modify constants if needed
INPUT_FILE_PATH : Final[str] = os.path.join(os.getcwd(), 'demo.txt')
OUTPUT_DIRECTORY_PATH : Final[str] = os.path.join(os.getcwd(), 'output')


class Song(NamedTuple):
    """Class to represent a song."""
    anime_name : str
    song_url : str
    song_name : str
    song_artist : str


def process_file_content() -> list[Song]:
    """Process the content of the plain text file and return a list of Song objects."""
    songs : list[Song] = []

    with open(INPUT_FILE_PATH, 'r', encoding='utf-8') as fd:
        file_lines = fd.readlines()

    for line in file_lines:
        song_info = line.strip().split(',')

        # Expected format: Anime name, Song Type, mp3 link, Song Name, Artist(s)
        if len(song_info) < 5:
            print(f'Skipping the next line due to unexpected format match:\n{", ".join(song_info)}\n', file=sys.stderr)
            continue

        anime_name, song_type, song_url, song_name, *song_artist = song_info

        anime_name = process_anime_name(anime_name, song_type)
        song_artist = ', '.join(song_artist).strip()
        
        song = Song(anime_name, song_url, song_name, song_artist)
        songs.append(song)

    return songs


def process_anime_name(anime_name: str, song_type: str) -> str:
    """Process the anime name by removing forbidden characters, replacing certain characters, and adding song type."""
    # Handle forbidden characters for file names (in the way asked by an user)
    # We remove [], "", <>
    anime_name = re.sub(r'["<>|]+', '', anime_name)

    # We replace ?, /, *
    replacements = {'?': '¿', '/': ';', '*': '^'}
    for a, b in replacements.items():
        anime_name = anime_name.replace(a, b)

    # We replace ":" by a "-" and add an additional "-" at the end of the name
    # Gintama: THE FINAL --> Gintama -THE FINAL- 
    if ': ' in anime_name:
        anime_name = anime_name.replace(': ', ' -') + '-'
    elif ':' in anime_name:
        anime_name = anime_name.replace(':', ' -') + '-'

    # If Song type == IN, remove number as it is always 0 (IN 0 --> IN)
    if song_type.lower().startswith('in'):
        song_type = song_type[:2]

    # We add song type to anime name
    anime_name = f'{anime_name.strip()} {song_type}'
    return anime_name


def save_as_mp3(anime_name : str, song_url : str, song_name : str, song_artist : str) -> None:
    """Download the MP3 file from the given URL and save it with the provided song info."""
    output_file_path = os.path.join(OUTPUT_DIRECTORY_PATH, f'{anime_name}.mp3')
    print(f'Downloading: {anime_name} || {song_name} || {song_artist}')

    # According to kitty you don't get rate limited so we can do the requests without having to
    # wait between requests / catching 'too many requests' errors / getting IP banned
    response = requests.get(song_url)
    with open(output_file_path, 'wb') as fd:
        fd.write(response.content)

    mp3 = eyed3.load(output_file_path)
    mp3.initTag()
    mp3.tag.title = song_name
    mp3.tag.artist = song_artist
    mp3.tag.save()


if __name__ == '__main__':

    start_time = datetime.now()

    # Create the output directory if it doesn't exist yet
    os.makedirs(OUTPUT_DIRECTORY_PATH, exist_ok=True)

    songs = process_file_content()
    for song in songs:
        save_as_mp3(*song)

    print(f'Done! It took: {str(datetime.now() - start_time)}')