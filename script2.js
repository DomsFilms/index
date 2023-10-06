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
        "film1",
        "film2",
        "film3"
    ];

    const filmDatas = [
        {
            "title": "film1",
            "review": "a film"
        },
        {
            "title": "film2",
            "review": "a film 2"
        }
    ];

    films.forEach((title, index) => {
        // Create empty film data.
        let film = {
            "title": title,
            "review": ""
        };

        // Hydrate with loaded data.
        //film = filmDatas.filter(f => f.title == title)[0] || film;
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `films/2023october/${title}.json`, true);
        xhr.responseType = 'json';
        xhr.onload = () => {
            let status = xhr.status;
            if (status === 200) {
                fn(filmDatas.filter(f => f.title == title)[0]);
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
                .attr("id", `id-film-${film.title}`)
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
            $(`#id-film-${film.title}`)
                .addClass("class-film-unwatched");
        };

        return;
    });
});