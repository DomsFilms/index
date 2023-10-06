$(document).ready(() => {

    // Set up the theme toggle button.
    $("#id-theme-toggle").on("click", () => {
        let body = $("body");
        if (body.hasClass("class-theme-light")) {
            $("body").removeClass("class-theme-light").addClass("class-theme-dark");
            $("#id-theme-toggle").html("🌔 light mode");
        } else {
            $("body").removeClass("class-theme-dark").addClass("class-theme-light");
            $("#id-theme-toggle").html("🌘 dark mode");
        }
    });

    const films = [
        "relic2020",
        "thedarkandthewicked2020",
        "alteredstates1980",
        "salemslotpart11979",
        "salemslotpart21979",
        "thetexaschainsawmassacre1974",
        "thecabinetofdrcaligari1920",
        "nope2022",
        "halloween1978",
        "thestrangers2008",
        "thebabysitter2017",
        "crimesofthefuture2022",
        "deepred1975",
        "devilfetus1983",
        "eraserhead1977",
        "evolution2016",
        "afieldinengland2013",
        "gonjiamhauntedasylum2018",
        "greenroom2015",
        "grindhouseplanetterror2007",
        "bramstokersdracula1992",
        "itfollows2014",
        "kwaidan1964",
        "lightsout2016",
        "below2002",
        "oxygen2021",
        "thephantomcarriage1921",
        "pieces1982",
        "rec2007",
        "run2020",
        "session92001",
        "shocker1989",
        "thestrangerspreyatnight2018",
        "anamericanwerewolfinlondon1981",
        "berberiansoundstudio2012",
        "braindamage1988",
        "bliss2019",
        "thelovewitch2016",
        "pearl2022",
        "trollhunter2010"
    ];

    films.forEach((filmId, index) => {
        // Create empty film data.
        let film = {
            "id": filmId,
            "title": filmId,
            "rating": "",
            "review": ""
        };

        // Hydrate with loaded data.
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `films/2023-october/${filmId}.json`, true);
        xhr.responseType = 'json';
        xhr.onload = () => {
            let status = xhr.status;
            if (status === 200) {
                xhr.response["id"] = filmId;
                fn(xhr.response);
            } else {
                fn(film);
            }
        };
        xhr.send();

        let fn = (film) => {
            // Add film card content.
            $("body")
            .append(
                $("<div>")
                .addClass("class-film-card")
                .attr("id", `id-film-${film.id}`)
                .append(
                    $("<div>")
                    .addClass("class-film-title")
                    .html(film.title)
                )
                .append(
                    $("<div>")
                    .addClass("class-film-rating")
                    .html(film.rating)
                )
                .append(
                    $("<div>")
                    .addClass("class-film-review")
                    .html(film.review)
                )
            );

            // Apply unwatched class.
            if (!film.review)
            $(`#id-film-${film.id}`)
                .addClass("class-film-unwatched");
        };

        return;
    });
});