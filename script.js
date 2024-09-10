$(document).ready(() => {

    const defaultList = "2024 ad hoc spooky stuff";
    const date = new Date();
    const cacheVersion = date.getFullYear().toString() + date.getMonth().toString() + date.getDate().toString();
    let catalogue = {};

    const strings = {
        "darkButton": "🌘 dark mode",
        "lightButton": "🌔 light mode",
        "olderLists": "📆 older lists",
        "alphabetical": "🔎 all films A-Z",
        "alphabeticalDescription": "All films on this site in alphabetical order, in case you want to search for one.",
        "rating": "👍 all films best-worst",
        "ratingDescription": "All films on this site in order of my personal rating, from best to worst.",
        "spoilers": "spoilers",
        "average": "average"
    };

    $("body")
        .append($("<div>")
            .attr("id", "id-controls")
        );

    // Set the theme, currently supports "dark" and "light";
    // Save in local storage so it doesn't reset on refresh.
    const setTheme = (theme) => {
        localStorage.setItem("theme", theme);
        switch (theme) {
            case "dark":
                $("body")
                    .removeClass("class-theme-light")
                    .addClass("class-theme-dark");
                $("#id-theme-toggle")
                    .html(strings.lightButton);
                break;
            case "light":
            default:
                $("body")
                    .removeClass("class-theme-dark")
                    .addClass("class-theme-light");
                $("#id-theme-toggle")
                    .html(strings.darkButton);
        }
    };

    // Set up the theme toggle button.
    $("#id-controls")
        .append($("<button>")
            .attr("id", "id-theme-toggle")
            .addClass("class-shadow-small")
            .addClass("class-font-small")
            .html(strings.darkButton)
            .on("click", () => {
                const body = $("body");
                if (body.hasClass("class-theme-light")) {
                    setTheme("dark");
                } else {
                    setTheme("light");
                }
            })
        );

    // Set the default theme now, loading from storage if possible.
    setTheme(localStorage.getItem("theme") || "light");

    // Create up the older lists button.
    $("#id-controls")
        .prepend($("<button>")
            .attr("id", "id-lists-button")
            .addClass("class-shadow-small")
            .addClass("class-font-small")
            .html(strings.olderLists)
        );

    // Add events to show and hide the older lists popup.
    $(document).on("click", (event) => {

        // Close the popup if it's displayed, and there's a click anywhere except inside the popup.
        if (!$(event.target).closest(".class-popup").length && $(".class-popup").length) {
            $(".class-popup").remove();

            // Open the older lists popup if the button is clicked.
        } else if ($(event.target).attr("id") == "id-lists-button") {
            $("body").append(
                $("<div>")
                    .attr("id", "id-lists-popup")
                    .addClass("class-popup class-shadow-large")
            );

            // The order in the catalogue is obeyed and the all films buttons always come last.
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

            // Draw a final divider, and buttons to load all the films aftewards.
            $("#id-lists-popup")
                .append(
                    $("<div>")
                        .addClass("class-popup-hr")
                ).append(
                    $("<button>")
                        .addClass("class-shadow-small class-font-small")
                        .on("click", () => {
                            populate("alphabetical");
                        })
                        .html(strings.alphabetical)
                ).append(
                    $("<button>")
                        .addClass("class-shadow-small class-font-small")
                        .on("click", () => {
                            populate("rating");
                        })
                        .html(strings.rating)
                );
        }
    });

    // Load the catalogue of films into the catalogue variable.
    // Also populate the page with the default catalogue.
    const getCatalog = () => {
        const request = new XMLHttpRequest();
        request.open('GET', `catalogue.json?v=${cacheVersion}`, true);
        request.responseType = 'json';
        request.onload = () => {
            if (request.status === 200) {
                catalogue = request.response;

                // Render the default list, probably the top of the catalogue.
                populate(defaultList);
            }
        };

        request.send();
        return;
    };

    // Render a list based on the name from the parameter.
    // If the name is "alphabetical", load all films in alphabetical order, and then date watched.
    // If the name is "rating", load all films in order of score, and then alphabetical, and then by date watched.
    const populate = (list) => {
        $(".class-popup").remove();
        $(".class-body-text").remove();
        $(".class-film-card").remove();

        // Use a hard-coded description in the case of an all-films list.
        let description = "";
        switch (list) {
            case "alphabetical":
                description = strings.alphabeticalDescription;
                break;
            case "rating":
                description = strings.ratingDescription;
                break;
            default:
                description = catalogue[list].description;
                break;
        }

        // Render the description at the top of the page.
        $("body")
            .append(
                $("<div>")
                    .addClass("class-body-text")
                    .append(
                        $("<div>")
                            .attr("id", "id-description")
                            .html(description)
                    )
            );

        // Find a list of films to load from the catalogue.
        let films = [];
        Object.keys(catalogue).forEach((listName, index) => {
            if (["alphabetical", "rating", listName].includes(list)) {
                films = films.concat(catalogue[listName].films.map(film => {
                    return {
                        "list": catalogue[listName].id,
                        "properties": catalogue[listName].properties,
                        "id": film
                    };
                }));
            }
        });

        // Load all the required films, if they have review data.
        films.forEach((film, index) => {
            const request = new XMLHttpRequest();
            request.open('GET', `films/${film.list}/${film.id}.json?v=${cacheVersion}`, true);
            request.responseType = 'json';
            request.onload = () => {
                if (request.status === 200 && !!request.response.review) {
                    Object.assign(film, request.response);
                };
            };
            request.send();
        });

        // Sort that list if required. Otherwise the order in the catalogue is obeyed.
        // The film ID is unique per film, and I append a 2, 3 etc when I watch it again, so an alphabetical sort is inherently then sorted by watch time.
        if (list == "alphabetical") {
            films = films.sort((a, b) =>
                a.id < b.id
                    ? -1
                    : 1);
        };

        if (list == "rating") {
            films = films.sort((a, b) =>
                a.rating != b.rating
                    ? b.rating - a.rating
                    : a.id < b.id
                        ? -1
                        : 1);
        };

        films.forEach((film, index) => {

            // Add empty content. Because we show empty content if a film is in the catalogue but is not reviewed yet.
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

            // Hydrate element if a review exists.
            const card = $(`#id-film-${film.id}`);
            if (!!film.review) {
                card.removeClass("class-film-unwatched")
                    .append(
                        $("<div>")
                            .addClass("class-film-summary class-font-small")
                            .html(`released: ${film.year}, watched: ${film.date} ${film.seen ? "(seen before)" : "(first time)"}`)
                    )
                    .append($("<div>")
                        .addClass("class-film-bar")
                        .append(
                            $("<div>")
                                .addClass("class-film-word class-font-small")
                                .html((film.word || "").toLowerCase())
                        )
                    );

                card.find(".class-film-title")
                    .html(film.title);

                card.find(".class-rating-large")
                    .html(film.rating)
                    .addClass(`class-rating-${film.rating}`);

                card.find(".class-film-review")
                    .html(film.review
                        .replace("#s", `<details><summary>${strings.spoilers}</summary>`)
                        .replace("#d", "</details>")
                    );

                // Add sub-ratings.
                film.properties.forEach((property, index) => {
                    if (film[property] !== undefined) {
                        card.find(".class-film-word")
                            .after(
                                $("<div>")
                                    .addClass(`class-rating-small class-rating-${film[property]} class-font-small`)
                                    .html(`${property}: ${film[property]}`)
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
                                    .html(`${strings.average}: ${(ratingTotal / ratings.length).toFixed(1)}`)
                            ));
            }
            return;
        });
    };

    getCatalog();
});