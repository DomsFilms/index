$(document).ready(() => {

    let defaultList = "2023 spooky month";

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

    let populate = (list) => {
        $(".class-film-card").remove();

        list.films.forEach((film, index) => {

            // Add empty content.
            $("body")
            .append(
                $("<div>")
                .addClass("class-film-card")
                .addClass("class-film-unwatched")
                .attr("id", `id-film-${film}`)
                .append($("<div>")
                    .addClass("class-film-bar")
                    .append(
                        $("<div>")
                        .addClass("class-film-title")
                        .html(film)
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
            x.open('GET', `films/${list.id}/${film}.json`, true);
            x.responseType = 'json';
            x.onload = () => {
                if (x.status === 200 && !!x.response.review) {

                    // Hydrate element.
                    let card = $(`#id-film-${film}`);

                    card.removeClass("class-film-unwatched")
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
                    
                    card.find(".class-film-title")
                    .html(x.response.title);

                    card.find(".class-rating")
                    .html(x.response.rating)
                    .addClass(`class-rating-${x.response.rating}`);

                    card.find(".class-film-review")
                    .html(x.response.review);

                    if (x.response.grotesque !== null) {
                        card.find(".class-film-word")
                        .after(
                            $("<div>")
                            .addClass("class-rating class-rating-small")
                            .addClass(`class-rating-${x.response.grotesque}`)
                            .html(`grotesque: ${x.response.grotesque}`)
                        )
                    }

                    if (x.response.shock !== null) {
                        card.find(".class-film-word")
                        .after(
                            $("<div>")
                            .addClass("class-rating class-rating-small")
                            .addClass(`class-rating-${x.response.shock}`)
                            .html(`shock: ${x.response.shock}`)
                        )
                    }

                    if (x.response.suspense !== null) {
                        card.find(".class-film-word")
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
    };

    // Load the catalogue of films.
    let c = new XMLHttpRequest();
    c.open('GET', "catalogue.json", true);
    c.responseType = 'json';
    c.onload = () => {
        if (c.status === 200) {

            // Set up the old lists button.
            $("#id-lists-button").on("click", () => {
                if ($(".class-popup").length > 0) {
                    $(".class-popup").remove();
                } else {
                    $("body").append(
                        $("<div>")
                        .attr("id", "id-lists-popup")
                        .addClass("class-popup")
                    );

                    Object.keys(c.response).forEach((list, index) => {
                        $("#id-lists-popup")
                        .append(
                            $("<button>")
                            .on("click", () => {
                                populate(c.response[list]);
                            })
                            .html(list)
                        );
                    });
                }
            });

            populate(c.response[defaultList]);
        }
    };

    c.send();
});