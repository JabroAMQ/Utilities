from typing import Final, LiteralString

URL : Final[str] = 'https://graphql.anilist.co'
QUERY : Final[LiteralString] = '''
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
    }
  }
}
'''