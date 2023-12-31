import os
import sys
import time
from csv import DictWriter
from datetime import datetime
from typing import Any

import requests
from requests.exceptions import RequestException

from query import URL, QUERY, FLATTEN_DICT, FLATTEN_LIST


# Modify if needed
DEFAULT_TIMEOUT: int = 5
OUTPUT_DIRECTORY: str = os.path.join(os.getcwd(), 'output')

# Do not modify
fieldnames: list[str] = []


def download_all_animes(output_file_path: str, start_page: int = 1) -> None:
    """
    Get all the animes from AniList and store them into a CSV file.\n
    Each Anime will be represented as a dict that may contain different data depending on the `QUERY` specified in `query.py`. 
    """
    current_page = start_page
    session = requests.Session()

    while True:
        variables = {'page': current_page}
        response = None

        try:
            # Ask for data
            response = session.post(URL, json={'query': QUERY, 'variables': variables})
            response.raise_for_status()

            # Write the data into the csv page by page rather than all at the same time to avoid memory problems
            data = response.json()['data']['Page']
            write_animes_page(data['media'], output_file_path, current_page==start_page)

            # Advance to the next page of animes
            current_page += 1

        except RequestException as e:
            # https://anilist.gitbook.io/anilist-apiv2-docs/overview/rate-limiting
            # Check if we got a HTTP 429 Too Many Request error
            if response is not None and response.status_code == 429:
                # Sleep untill we can make another accepted request if so
                retry_after = int(response.headers.get('Retry-After', DEFAULT_TIMEOUT))
                print(f'Timeout: Sleeping {retry_after} seconds...', file=sys.stdout)
                time.sleep(retry_after)
            
            # In case not, print error and wait for the default timeout before trying again...
            else:
                print(f'Error: {e}\nWaiting for {DEFAULT_TIMEOUT} seconds (default)...', file=sys.stderr)
                time.sleep(DEFAULT_TIMEOUT)
            
            continue

        # Stop once all animes have been added to the list
        if not data['pageInfo']['hasNextPage']:
             break


def write_animes_page(animes: list[dict[str, Any]], file_path: str, write_header: bool) -> None:
    """
    Append the animes included in the requests's response to the CSV file.\n
    Animes will contain the data asked on the `QUERY` specified in `query.py`.
    """
    global fieldnames
    # Flatten the dicts if user configured as so
    flattened_animes = [flatten_dict(anime) if FLATTEN_DICT else anime for anime in animes]
    
    if write_header:
        # We clear the CSV content ('w' mode), and write the headers
        with open(file_path, 'w', encoding='utf-8', newline='') as f:
            # Update global fieldnames value
            # NOTE Asuming first anime (cowboy bebop) has info stored for all list[dict] fields 
            # (could not be the case for some obscure fields asked in the query requested and FLATTEN_LIST = True)
            fieldnames = list(flattened_animes[0].keys())
            writer = DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
    
    # Write the animes one by one to handle errors granularly 
    with open(file_path, 'a', encoding='utf-8', newline='') as f:
        writer = DictWriter(f, fieldnames=fieldnames)
        for anime in flattened_animes:
            already_added = False
            while not already_added:
                try:
                    writer.writerow(anime)
                    already_added = True

                except ValueError as e:
                    """
                    ValueError: dict contains fields not in fieldnames: 'tags'
                    If we are asking for `tags { id name }` and `FLATTEN_LIST = True`, the expected keys are "tags_id" and "tags_name".
                    But if tags info is missing (`tags = []`), we don't get to replace "tags" by "tags_id" and "tags_name" in `flatten_list()`
                    We do that here, adding an empty list as "tags_id" and "tags_name" values (or whatever fieldnames we are missing)
                    """
                    # Get the dict key producing the error
                    field_producing_error = str(e).split("'")[1]
                    # Get all the CSV fieldnames that starts with the key and set their value as an empty list
                    fieldnames_missing = [fieldname for fieldname in fieldnames if fieldname.startswith(f'{field_producing_error}_')]
                    for fieldname in fieldnames_missing:
                        anime[fieldname] = []
                    # Delete the wrong key
                    del anime[field_producing_error]


def flatten_dict(my_dict: dict[str, Any], parent_key: str = '') -> dict[str, Any]:
    """Recursively flattens a nested dictionary."""
    items = []

    for key, value in my_dict.items():
        new_key = f'{parent_key}_{key}' if parent_key else key
    
        if isinstance(value, dict):
            items.extend(flatten_dict(value, new_key).items())
        elif FLATTEN_LIST and isinstance(value, list) and value and isinstance(value[0], dict):
            subdict = flatten_list(value)
            items.extend(flatten_dict(subdict, new_key).items())
        else:
            items.append((new_key, value))
    
    return dict(items)


def flatten_list(my_list: list[dict[str, Any]]) -> dict[str, list[Any]]:
    """Given a list of dicts, where each of the dicts have the same keys, flatten the lists producing one list per dict key."""
    result = {}
    
    if not my_list:
        return result
    
    keys = my_list[0].keys()
    for key in keys:
        new_sublist = [item[key] for item in my_list]
        result[key] = new_sublist
    
    return result


if __name__ == '__main__':
    
    # Create the specified directory if it doesn't exist yet
    os.makedirs(OUTPUT_DIRECTORY, exist_ok=True)
    output_file_path = os.path.join(OUTPUT_DIRECTORY, 'database.csv')

    start = datetime.now()
    download_all_animes(output_file_path)
    print(f'Finish reading! It took: {str(datetime.now() - start)}')