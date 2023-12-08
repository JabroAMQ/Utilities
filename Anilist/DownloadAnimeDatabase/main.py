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


def get_all_animes(start_page : int = 1) -> list[dict[str, Any]]:
    """
    Return all the animes from Anilist as a list.\n
    Each Anime will be represented as a dict that may contain different keys depending on the `QUERY` specified in `query.py`. 
    """
    all_animes : list[dict[str, Any]] = []
    current_page = start_page
    session = requests.Session()

    while True:
        variables = {'page': current_page}
        response = None

        try:
            # Ask for data
            response = session.post(URL, json={'query': QUERY, 'variables': variables})
            response.raise_for_status()

            # Add the result to the output list
            data = response.json()['data']['Page']
            all_animes += data['media']

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
     
    return all_animes


def write_all_animes(animes : list[dict[str, Any]]) -> None:
    """
    Write all the animes into a CSV file.\n
    Each row will contain different keys depending on the `QUERY` specified in `query.py`.
    """

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
    

    # Create the specified directory if it doesn't exist yet
    os.makedirs(OUTPUT_DIRECTORY, exist_ok=True)
    output_file_path = os.path.join(OUTPUT_DIRECTORY, 'database.csv')

    with open(output_file_path, 'w', encoding='utf-8', newline='') as f:
        # Flatten the dicts so that instead of storing one header "title" containing values like:
        # {'romaji': 'Shin Seiki Evangelion', 'english': 'Neon Genesis Evangelion'}
        #
        # we store each of the nested dict keys as a header:
        # "romaji" and "title", containing as value 'Shin Seiki Evangelion' and 'Neon Genesis Evangelion' respectively
        flattened_animes = [flatten_dict(anime) for anime in animes]

        # Write the headers
        fieldnames = list(flattened_animes[0].keys())
        writer = DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        # Write the rows in chunks for efficency
        chunk_size = 1000
        for i in range(0, len(flattened_animes), chunk_size):
            chunk = flattened_animes[i:i+chunk_size]
            writer.writerows(chunk)


if __name__ == '__main__':

    start_time = datetime.now()
    animes = get_all_animes()
    api_time = datetime.now()
    write_all_animes(animes)

    print(f'API Time: {api_time - start_time}')
    print(f'CSV Time: {datetime.now() - api_time}')
    print(f'Total: {datetime.now() - start_time}')