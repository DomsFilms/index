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

    // Set up the old lists button.
    $("#id-lists-button").on("click", () => {
        if ($(".class-popup").length > 0) {
            $(".class-popup").remove();
        } else {
            $("body").append(
                $("<div>")
                .attr("id", "id-lists-popup")
                .addClass("class-popup")
                .html("test")
            );
        }
    });

    // Load the catalogue of films.
    let c = new XMLHttpRequest();
    c.open('GET', "catalogue.json", true);
    c.responseType = 'json';
    c.onload = () => {
        if (c.status === 200) {

            c.response["2023 traditional spooky month"].forEach((filmId, index) => {

                // Add empty content.
                $("body")
                .append(
                    $("<div>")
                    .addClass("class-film-card")
                    .addClass("class-film-unwatched")
                    .attr("id", `id-film-${filmId}`)
                    .append($("<div>")
                        .addClass("class-film-bar")
                        .append(
                            $("<div>")
                            .addClass("class-film-title")
                            .html(filmId)
                        )
                        .append(
                            $("<div>")
                            .addClass("class-rating")
                        )
                    )
                    .append(
                        $("<div>")
                        .addClass("class-film-review")
                    )
                );

                // Load film data.
                let x = new XMLHttpRequest();
                x.open('GET', `films/2023-october/${filmId}.json`, true);
                x.responseType = 'json';
                x.onload = () => {
                    if (x.status === 200 && !!x.response.review) {

                        // Hydrate element.
                        $(`#id-film-${filmId}`)
                        .removeClass("class-film-unwatched")
                        .append(
                            $("<div>")
                            .addClass("class-film-summary")
                            .html(`released: ${x.response.year}, watched: ${x.response.date} ${x.response.seen ? "(seen before)" : "(first time)"}`)
                        )
                        .append($("<div>")
                            .addClass("class-film-bar")
                            .append(
                                $("<div>")
                                .addClass("class-film-word")
                                .html(x.response.word.toLowerCase())
                            )
                        );
                        
                        $(`#id-film-${filmId} .class-film-title`)
                        .html(x.response.title);

                        $(`#id-film-${filmId} .class-rating`)
                        .html(x.response.rating)
                        .addClass(`class-rating-${x.response.rating}`);

                        $(`#id-film-${filmId} .class-film-review`)
                        .html(x.response.review);

                        if (x.response.grotesque !== null) {
                            $(`#id-film-${filmId} .class-film-word`)
                            .after(
                                $("<div>")
                                .addClass("class-rating class-rating-small")
                                .addClass(`class-rating-${x.response.grotesque}`)
                                .html(`grotesque: ${x.response.grotesque}`)
                            )
                        }

                        if (x.response.shock !== null) {
                            $(`#id-film-${filmId} .class-film-word`)
                            .after(
                                $("<div>")
                                .addClass("class-rating class-rating-small")
                                .addClass(`class-rating-${x.response.shock}`)
                                .html(`shock: ${x.response.shock}`)
                            )
                        }

                        if (x.response.suspense !== null) {
                            $(`#id-film-${filmId} .class-film-word`)
                            .after(
                                $("<div>")
                                .addClass("class-rating class-rating-small")
                                .addClass(`class-rating-${x.response.suspense}`)
                                .html(`suspense: ${x.response.suspense}`)
                            )
                        }
                    }
                };
                x.send();

                return;
            });
        }
    };
    c.send();
});