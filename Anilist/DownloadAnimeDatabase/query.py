from typing import Final, LiteralString

# The URL where the request is going to be send (do not modify)
URL: Final[str] = 'https://graphql.anilist.co'

# Whether you want to flatten dicts or not (modify it if you wish): Example at the end of this file
FLATTEN_DICT: bool = True

# Whether you want to flatten lists or not (modify it if you wish): Example at the end of this file
# NOTE FLATTEN_DICT must be True in order for FLATTEN_LIST to be applied
FLATTEN_LIST: bool = True

# The data you want to retrieve from AniList (modify it if you wish)
# NOTE You can request Mangas rather than Animes but changing the media type:
# media(type: MANGA) {
QUERY: LiteralString = '''
query ($page: Int) {
  Page(page: $page) {
    pageInfo {
      hasNextPage
    }
    media(type: ANIME) {
      id
      title {
        romaji
        english
      }
      episodes
      duration
      genres
      tags {
        id
        name
      }
      characters {
        nodes {
          name {
            first
            last
          }
          gender
        }
      }
    }
  }
}
'''


# Examples for understanding what flattening dicts/lists do:
"""
Flatten the dicts so:

    title {
      romaji
      english
    }

is stored as two headers, "title_romaji" and "title_english":

    "title_romaji": "Shin Seiki Evangelion"
    "title_english": "Neon Genesis Evangelion"

rather than one header "title" containing:

    "title": {"romaji": "Shin Seiki Evangelion", "english": "Neon Genesis Evangelion"}

----------------------------------------------------------------------------------------

Flatten the lists so:

    "tags": [
      {
        "id": 63,
        "name": "Space"
      },
      {
        "id": 648,
        "name": "Crime"
      },
    ]

is stored as two headers "tags_id" and "tags_name":

    "tags_id": [63, 648]
    "tags_name": ["Space", "Crime"]

rather than one header "tags" containing:

    "tags" = [{"id": 63, "name": "Space"}, {"id": 648, "name": "Crime"}]
"""