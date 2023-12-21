# Script description

Retrieve some (custom) info from all of Anilist's animes using their API and save them into a CSV file, which will be stored in the [output](output) subdirectory (created in the directory where the script is being executed from).

> [!NOTE]
> This repository has already a [database](output/database.csv) in the output subdirectory which contains 50 animes as output example.
>
> By executing the script yourself you are requesting the entire anime database, not only 50 animes, which takes around 6 minutes to download.

# Requirements

- Python3.11+

- Third-party modules.

> [!TIP]
> You can check them in the [requirements.txt](requirements.txt) file and automatically install them through `pip`:
> 
> ```
> pip install -r requirements.txt
> ```

# How to use

You just need to execute the script:

```
python main.py
```

However, you can also customize the information you want to store about each anime. For doing this, you would need to modify the `QUERY` LiteralString from the [query.py](query.py) file.

You can modify how the anime fields are stored as well. Modify `FLATTEN_DICT` and `FLATTEN_LIST` values from [query.py](query.py) if so. You have examples of how these variables changes the script behaviour in this python file.

> [!TIP]
> - You can play through the [Interactive Editor](https://anilist.co/graphiql) to customize your GraphQL query and then paste it in the `QUERY` LiteralString once it contains the fields you want to retrieve.
> 
> - From [this link](https://anilist.co/graphiql?query=query%20(%24page%3A%20Int)%20%7B%0A%20%20Page(page%3A%20%24page)%20%7B%0A%20%20%20%20pageInfo%20%7B%0A%20%20%20%20%20%20hasNextPage%0A%20%20%20%20%7D%0A%20%20%20%20media(type%3A%20ANIME)%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20title%20%7B%0A%20%20%20%20%20%20%20%20romaji%0A%20%20%20%20%20%20%20%20english%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20episodes%0A%20%20%20%20%20%20duration%0A%20%20%20%20%20%20genres%0A%20%20%20%20%20%20tags%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20characters%20%7B%0A%20%20%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20%20%20name%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20first%0A%20%20%20%20%20%20%20%20%20%20%20%20last%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20gender%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A) you already have loaded in the interactive editor the content that the `QUERY` LiteralString contains.
>
> - You can check what info you can ask for in the right pannel of the interactive editor or at the [Documentation Explorer](https://anilist.github.io/ApiV2-GraphQL-Docs/), as prefered by the user. In both cases, click on "Query" and then on "Media" to see the possible field options.
