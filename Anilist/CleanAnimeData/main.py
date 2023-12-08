import os
import sys
import json
from typing import Any, Final

# Modify constants if needed
INPUT_DIRECTORY : Final[str] = os.getcwd()
OUTPUT_DIRECTORY : Final[str] = os.path.join(INPUT_DIRECTORY, 'Output')


def get_json_file(directory : str) -> dict | None:
    """
    Find an load into memory the content of the JSON file found in `directory` directory (if any).\n
    Return a dict with the content of the found JSON, or `None` if no JSON was found in the specified directory.
    """
    directory_files = os.listdir(directory)
    json_files = [file for file in directory_files if file.endswith('.json')]

    if not json_files:
        return None
    
    # Assuming there is only one JSON in the directory (i.e. load the first one found and return)
    file_path = os.path.join(directory, json_files[0])
    with open(file_path, 'r', encoding='utf-8') as json_file:
        data = json.load(json_file)
        return data


def clean_user_data(json_data : dict) -> dict:
    """
    Given a JSON file (loaded into memory as a dict) with the data from an ANIME LIST (not manga) obtained as a result of
    exporting an Anilist's anime list using automail, clean some media fields so that the anime list can be reimported or
    imported to another anilist account removing things like user's custom lists or the animes's progress, score, notes or dates.\n
    Return the cleaned dict.
    """
    list_sections : list[dict[str, dict[str, Any]]] = json_data['MediaListCollection']['lists']
    # Removing custom lists sections (completed, hold and dropped are placed at the beginning, and watching at the end)
    list_sections = list_sections[:3] + list_sections[-1:]

    # For all entries in each section, clean the desire data
    for list_section in list_sections:
        for media_data in list_section['entries']:
            # Setting default values for specific fields
            # NOTE Unhandled: hiddenFromStatusLists, advancedScores
            media_data['progress'] = 0
            media_data['repeat'] = 0
            media_data['notes'] = ''
            media_data['customLists'] = {}
            media_data['startedAt'] = {'year': None, 'month': None, 'day': None}
            media_data['completedAt'] = {'year': None, 'month': None, 'day': None}
            media_data['updatedAt'] = 0
            media_data['createdAt'] = 0
            media_data['score'] = 0

    # Remove custom lists from user info
    json_data['User']['mediaListOptions']['animeList']['customLists'].clear()

    return json_data


def save_modified_json(json_data : dict, directory : str) -> None:
    """Save the cleaned `json_data` dict into a JSON file in the `directory` directory."""
    # Create the specified directory if it doesn't exist yet
    os.makedirs(directory, exist_ok=True)

    # Write the cleaned JSON data to a new file in the directory
    result_file_path = os.path.join(directory, 'AnilistAnimeList.json')
    with open(result_file_path, 'w', encoding='utf-8') as result_file:
        json.dump(json_data, result_file, ensure_ascii=False, separators=(',', ':'))


if __name__ == '__main__':

    json_data = get_json_file(INPUT_DIRECTORY)

    if json_data is not None:
        cleaned_json_data = clean_user_data(json_data)
        save_modified_json(cleaned_json_data, OUTPUT_DIRECTORY)
    
    else:
        error = f'No JSON was found in the directory: {INPUT_DIRECTORY}'
        print(error, file=sys.stderr)