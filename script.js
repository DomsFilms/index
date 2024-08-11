$(document).ready(() => {

    const defaultList = "2024 ad hoc spooky stuff";
    const date = new Date();
    const cacheVersion = date.getFullYear().toString() + date.getMonth().toString();
    let catalogue = null;

    // Set the theme, currently supports "dark" and "light";
    // Save in local storage so it doesn't reset on refresh.
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

    // Set the default theme now, loading from storage if possible.
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

    // Load the catalogue of films into the catalogue variable.
    // Also set up the list changer button.
    const getCatalog = () => {
        const request = new XMLHttpRequest();
        request.open('GET', `catalogue.json?v=${cacheVersion}`, true);
        request.responseType = 'json';
        request.onload = () => {
            if (request.status === 200) {
                catalogue = request.response;

                // Set up the list changer button.
                $("#id-lists-button").on("click", () => {
                    if ($(".class-popup").length > 0) {
                        $(".class-popup").remove();
                    } else {
                        $("body").append(
                            $("<div>")
                                .attr("id", "id-lists-popup")
                                .addClass("class-popup class-shadow-large")
                        );

                        // The order in the catalogue is obeyed and the a-z button always comes last.
                        Object.keys(catalogue).forEach((listName, index) => {

                            // Draw a divider after the last spooky list item. It's assumed these always come first.
                            if (listName.indexOf("spooky") < 0 && $(".class-popup-hr").length == 0) {
                                $("#id-lists-popup")
                                    .append(
                                        $("<div>")
                                            .addClass("class-popup-hr")
                                    );
                            }

                            // Draw a button to load that list.
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

                        // Draw a final divider, and a button to load all films in a-z order aftewards.
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

                // Render the default list, probably the top of the catalogue.
                populate(defaultList);
            }
        };

        request.send();
        return;
    };

    // Render a list based on the name from the parameter. If the name is "a-z", load all films.
    const populate = (list) => {
        $(".class-popup").remove();
        $(".class-body-text").remove();
        $(".class-film-card").remove();

        // Render the description, using a hard-coded description in the case of the "a-z" list.
        $("body")
            .append(
                $("<div>")
                    .addClass("class-body-text")
                    .append(
                        $("<div>")
                            .attr("id", "id-description")
                            .html(list == "a-z"
                                ? "All films on this site in alphabetical order, in case you want to search for one."
                                : catalogue[list].description)
                    ));

        // Find a list of films to load from the catalogue.
        let films = [];
        Object.keys(catalogue).forEach((listName, index) => {
            if (list == "a-z" || list == listName) {
                films = films.concat(catalogue[listName].films.map(film => {
                    return {
                        "list": catalogue[listName].id,
                        "properties": catalogue[listName].properties,
                        "id": film
                    };
                }));
            }
        });

        // Sort that list only if the "a-z" list is used. Otherwise the order in the catalogue is obeyed.
        if (list == "a-z") {
            films = films.sort((a, b) =>
                a.id < b.id
                    ? -1
                    : 1);
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