import os
import sys
import time
from csv import DictWriter
from datetime import datetime
from typing import Final, Any

import requests
from requests.exceptions import RequestException

from query import URL, QUERY


# Modify constants if needed
DEFAULT_TIMEOUT : Final[int] = 5
OUTPUT_DIRECTORY : Final[str] = os.path.join(os.getcwd(), 'output')


def get_all_mangas(output_file_path : str, start_page : int = 1) -> None:
    """
    Get all the mangas from Anilist and store them into a CSV file.\n
    Each Manga will be represented as a dict that may contain different keys depending on the `QUERY` specified in `query.py`. 
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

            # Write the data into the csv
            # NOTE We do it page by page rather than all at the same time to avoid memory problems (there are too many mangas)
            data = response.json()['data']['Page']
            write_mangas_page(data['media'], output_file_path, current_page==start_page)

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
            
            # In case not, print error and wait for the default timeout before tring again...
            else:
                print(f'Error: {e}\nWaiting for {DEFAULT_TIMEOUT} seconds (default)...', file=sys.stderr)
                time.sleep(DEFAULT_TIMEOUT)
            
            continue

        # Stop once all animes have been added to the list
        if not data['pageInfo']['hasNextPage']:
             break


def write_mangas_page(mangas : list[dict[str, Any]], file_path : str, write_header : bool) -> None:
    """
    Append the mangas included in the requests's response to the CSV file.\n
    Mangas will contain the data asked on the `QUERY` specified in `query.py`.
    """
    # Flatten the dicts so that instead of storing one header "title" containing values like:
    # {'romaji': 'Shin Seiki Evangelion'}
    #
    # we store each of the nested dict keys as a header:
    # "title_romaji" as header, containing as value 'Shin Seiki Evangelion'
    flattened_mangas = [flatten_dict(manga) for manga in mangas]
    
    if write_header:
        # We clear the CSV content ('w' mode), write the headers and the page of mangas
        with open(file_path, 'w', encoding='utf-8', newline='') as f:
            fieldnames = list(flattened_mangas[0].keys())
            writer = DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()

            writer.writerows(flattened_mangas)

    else:
        # We just append the page of mangas at the end of the content of the CSV file
        with open(file_path, 'a', encoding='utf-8', newline='') as f:
            fieldnames = list(flattened_mangas[0].keys())
            writer = DictWriter(f, fieldnames=fieldnames)
            writer.writerows(flattened_mangas)


def flatten_dict(my_dict: dict[str, Any], parent_key: str = '') -> dict[str, Any]:
    """Recursively flattens a nested dictionary."""
    items = []

    for key, value in my_dict.items():
        new_key = f'{parent_key}_{key}' if parent_key else key
    
        if isinstance(value, dict):
            items.extend(flatten_dict(value, new_key).items())
        else:
            items.append((new_key, value))
    
    return dict(items)


if __name__ == '__main__':

    start = datetime.now()
    
    # Create the specified directory if it doesn't exist yet
    os.makedirs(OUTPUT_DIRECTORY, exist_ok=True)
    output_file_path = os.path.join(OUTPUT_DIRECTORY, 'database.csv')

    get_all_mangas(output_file_path)

    print(f'Finish reading! It took: {str(datetime.now() - start)}')