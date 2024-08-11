$(document).ready(() => {

    const defaultList = "2024 ad hoc spooky stuff";
    const date = new Date();
    const cacheVersion = date.getFullYear().toString() + date.getMonth().toString();
    let catalog = null;

    const setTheme = (theme) => {
        localStorage.setItem("theme", theme);
        switch (theme) {
            case "dark":
                $("body").removeClass("class-theme-light").addClass("class-theme-dark");
                $("#id-theme-toggle").html("🌔 light mode");
                break;
            case "light":
            default:
                $("body").removeClass("class-theme-dark").addClass("class-theme-light");
                $("#id-theme-toggle").html("🌘 dark mode");
        }
    };

    setTheme(localStorage.getItem("theme") || "light");

    // Set up the theme toggle button.
    $("#id-theme-toggle").on("click", () => {
        const body = $("body");
        if (body.hasClass("class-theme-light")) {
            setTheme("dark");
        } else {
            setTheme("light");
        }
    });

    // Load the catalogue of films.
    const getCatalog = () => {
        const request = new XMLHttpRequest();
        request.open('GET', `catalogue.json?v=${cacheVersion}`, true);
        request.responseType = 'json';
        request.onload = () => {
            if (request.status === 200) {
                catalog = request.response;

                // Set up the old lists button.
                $("#id-lists-button").on("click", () => {
                    if ($(".class-popup").length > 0) {
                        $(".class-popup").remove();
                    } else {
                        $("body").append(
                            $("<div>")
                                .attr("id", "id-lists-popup")
                                .addClass("class-popup class-shadow-large")
                        );

                        let completeList = {
                            "id": "all-films-a-z",
                            "description": "All films on this site in alphabetical order, in case you want to search for one.",
                            "properties": [],
                            "films": []
                        };

                        Object.keys(catalog).forEach((listName, index) => {
                            //completeList["properties"] = completeList["properties"].concat(catalog[list]["properties"]);
                            //completeList["films"] = completeList["films"].concat(catalog[list]["films"]);

                            if (listName.indexOf("spooky") < 0 && $(".class-popup-hr").length == 0) {
                                $("#id-lists-popup")
                                    .append(
                                        $("<div>")
                                            .addClass("class-popup-hr")
                                    );
                            }

                            $("#id-lists-popup")
                                .append(
                                    $("<button>")
                                        .addClass("class-shadow-small class-font-small")
                                        .on("click", () => {
                                            populate(listName);
                                        })
                                        .html(listName)
                                );
                        });

                        $("#id-lists-popup")
                            .append(
                                $("<div>")
                                    .addClass("class-popup-hr")
                            ).append(
                                $("<button>")
                                    .addClass("class-shadow-small class-font-small")
                                    .on("click", () => {
                                        populate("a-z");
                                    })
                                    .html("all films A-Z")
                            );
                    }
                });

                populate(defaultList);
            }
        };

        request.send();
        return;
    };

    const populate = (list) => {
        $(".class-popup").remove();
        $(".class-body-text").remove();
        $(".class-film-card").remove();

        const description = list == "a-z"
            ? "All films on this site in alphabetical order, in case you want to search for one."
            : catalog[list].description;

        $("body")
            .append(
                $("<div>")
                    .addClass("class-body-text")
                    .append(
                        $("<div>")
                            .attr("id", "id-description")
                            .html(description)
                    ));

        let films = [];
        Object.keys(catalog).forEach((listName, index) => {
            if (list == "a-z" || list == listName) {
                films = films.concat(catalog[listName].films.map(film => {
                    return {
                        "list": catalog[listName].id,
                        "properties": catalog[listName].properties,
                        "id": film
                    };
                }));
            }
        });

        if (list == "a-z") {
            films = films.sort((a, b) =>
                a < b
                    ? -1
                    : 0);
        };

        films.forEach((film, index) => {

            // Add empty content.
            $("body")
                .append(
                    $("<div>")
                        .addClass("class-film-card class-film-unwatched class-shadow-small")
                        .attr("id", `id-film-${film.id}`)
                        .append($("<div>")
                            .addClass("class-film-bar")
                            .append(
                                $("<div>")
                                    .addClass("class-film-title class-font-large")
                                    .html(film.id)
                            )
                            .append(
                                $("<div>")
                                    .addClass("class-rating-large class-font-large")
                            )
                        )
                        .append(
                            $("<div>")
                                .addClass("class-film-review")
                        )
                );

            // Load film data.
            const request = new XMLHttpRequest();
            request.open('GET', `films/${film.list}/${film.id}.json?v=${cacheVersion}`, true);
            request.responseType = 'json';
            request.onload = () => {
                const card = $(`#id-film-${film.id}`);
                if (request.status === 200 && !!request.response.review) {

                    // Hydrate element.
                    card.removeClass("class-film-unwatched")
                        .append(
                            $("<div>")
                                .addClass("class-film-summary class-font-small")
                                .html(`released: ${request.response.year}, watched: ${request.response.date} ${request.response.seen ? "(seen before)" : "(first time)"}`)
                        )
                        .append($("<div>")
                            .addClass("class-film-bar")
                            .append(
                                $("<div>")
                                    .addClass("class-film-word class-font-small")
                                    .html((request.response.word || "").toLowerCase())
                            )
                        );

                    card.find(".class-film-title")
                        .html(request.response.title);

                    card.find(".class-rating-large")
                        .html(request.response.rating)
                        .addClass(`class-rating-${request.response.rating}`);

                    card.find(".class-film-review")
                        .html(request.response.review);

                    // Add sub-ratings.
                    film.properties.forEach((property, index) => {
                        if (request.response[property] !== undefined) {
                            card.find(".class-film-word")
                                .after(
                                    $("<div>")
                                        .addClass(`class-rating-small class-rating-${request.response[property]} class-font-small`)
                                        .html(`${property}: ${request.response[property]}`)
                                )
                        }
                    });
                } else {
                    // If there is no review, move it to the end of the list.
                    $("body").append(card);
                }

                // If the list is now complete, show the average.
                if (films.length == $(".class-film-card:not(.class-film-unwatched)").length) {
                    let ratingTotal = 0;
                    let ratings = $(":not(.class-film-unwatched) > .class-film-bar > .class-rating-large");
                    ratings.each((index, rating) => {
                        ratingTotal += Number(rating.innerHTML);
                    });
                    $("body")
                        .append(
                            $("<div>")
                                .addClass("class-body-text")
                                .append(
                                    $("<div>")
                                        .attr("id", "id-average")
                                        .html(`average: ${(ratingTotal / ratings.length).toFixed(1)}`)
                                ));
                }
            };

            request.send();
            return;
        });
    };

    getCatalog();
});