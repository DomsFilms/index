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

        // Add empty content.
        $("body")
        .append(
            $("<div>")
            .addClass("class-film-card")
            .addClass("class-film-unwatched")
            .attr("id", `id-film-${filmId}`)
            .append(
                $("<div>")
                .addClass("class-film-title")
                .html(filmId)
            )
            .append(
                $("<div>")
                .addClass("class-rating")
            )
            .append(
                $("<div>")
                .addClass("class-film-review")
            )
        );

        // Load film data.
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `films/2023-october/${filmId}.json`, true);
        xhr.responseType = 'json';
        xhr.onload = () => {
            if (xhr.status === 200 && !!xhr.response.review) {

                // Hydrate element.
                $(`#id-film-${filmId}`)
                .removeClass("class-film-unwatched")
                .append(
                    $("<div>")
                    .addClass("class-film-summary")
                    .html(`Watched ${xhr.response.seen ? "" : "for the first time "}on ${xhr.response.date}`)
                )
                .append(
                    $("<div>")
                    .addClass("class-film-word")
                    .html(xhr.response.word)
                );
                
                $(`#id-film-${filmId} .class-film-title`)
                .html(xhr.response.title);

                $(`#id-film-${filmId} .class-rating`)
                .html(xhr.response.rating)
                .addClass(`class-rating-${xhr.response.rating}`);

                $(`#id-film-${filmId} .class-film-review`)
                .html(xhr.response.review);

                if (xhr.response.suspense !== null) {
                    $(`#id-film-${filmId}`)
                    .append(
                        $("<div>")
                        .addClass("class-rating class-rating-small")
                        .addClass(`class-rating-${xhr.response.suspense}`)
                        .html(`suspense: ${xhr.response.suspense}`)
                    )
                }

                if (xhr.response.shock !== null) {
                    $(`#id-film-${filmId}`)
                    .append(
                        $("<div>")
                        .addClass("class-rating class-rating-small")
                        .addClass(`class-rating-${xhr.response.shock}`)
                        .html(`shock: ${xhr.response.shock}`)
                    )
                }

                if (xhr.response.grotesque !== null) {
                    $(`#id-film-${filmId}`)
                    .append(
                        $("<div>")
                        .addClass("class-rating class-rating-small")
                        .addClass(`class-rating-${xhr.response.grotesque}`)
                        .html(`grotesque: ${xhr.response.grotesque}`)
                    )
                }
            }
        };
        xhr.send();

        return;
    });
});