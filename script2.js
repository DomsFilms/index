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
        "salem'slotpart11979",
        "salem'slotpart21979",
        "thetexaschainsawmassacre1974",
        "thecabinetofdr.caligari1920",
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
        "gonjiam:hauntedasylum2018",
        "greenroom2015",
        "grindhouse:planetterror2007",
        "bramstoker'sdracula1992",
        "itfollows2014",
        "kwaidan1964",
        "lightsout2016",
        "below2002",
        "oxygen2021",
        "thephantomcarriage1921",
        "pieces1982",
        "[rec]2007",
        "run2020",
        "session92001",
        "shocker1989",
        "thestrangers:preyatnight2018",
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
            "review": ""
        };

        // Hydrate with loaded data.
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `films/2023october/${filmId}.json`, true);
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