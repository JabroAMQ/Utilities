# Script description

Retrieve some (custom) info from all of Anilist's animes using their API and save them into a CSV file, which will be stored in the [output](output) subdirectory (created in the directory where the script is being executed from).

# Requirements

- Python3.9+

- Third-party modules are also used. You can check them in the [requirements.txt](requirements.txt) file.

> [!TIP]
> You can automatically install them through `pip`:

```
pip install -r requirements.txt
```

# How to use

You just need to execute the script:

```
python main.py
```

However, you can also customize the information you want to store about each anime. For doing this, you would need to modify the `QUERY` constant of the [query.py](query.py) file.

> [!TIP]
> - You can play with the [Interactive Editor](https://anilist.co/graphiql) to customize your GraphQL query and then paste it in the `QUERY` constant once it contains the fields you want to retrieve.
> 
> - From [this link](https://anilist.co/graphiql?query=query%20(%24page%3A%20Int)%20%7B%0A%20%20Page(page%3A%20%24page)%20%7B%0A%20%20%20%20pageInfo%20%7B%0A%20%20%20%20%20%20hasNextPage%0A%20%20%20%20%7D%0A%20%20%20%20media(type%3A%20ANIME)%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20title%20%7B%0A%20%20%20%20%20%20%20%20romaji%0A%20%20%20%20%20%20%20%20english%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20episodes%0A%20%20%20%20%20%20duration%0A%20%20%20%20%20%20genres%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&variables=%7B%0A%20%20%22page%22%3A%201%0A%7D) you already have loaded in the interactive editor the content that the `QUERY` constant contains.
>
> - You can check what info you can ask for in the right pannel of the interactive editor or at the [Documentation Explorer](https://anilist.github.io/ApiV2-GraphQL-Docs/), as prefered by the user. In both cases, click on "Query" and then on "Media" to see the possible field options.
