$(document).ready(() => {

    // Use this default list, so the page always shows the current project as it loads.
    const defaultList = "2024 ad hoc spooky stuff";

    // Change the cache parameter every day, so data is cached but automatically downloaded the next day.
    // During periods where I'm not editing existing reviews, I should reduce this to be monthly. 
    const date = new Date();
    const cacheVersion = date.getFullYear().toString() + date.getMonth().toString();// + date.getDate().toString();

    // Store the catalogue here, after loading it once while the page loads.
    let catalogue = {};

    const strings = {
        "darkButton": "🌘 dark mode",
        "lightButton": "🌔 light mode",
        "olderLists": "📆 older lists",
        "alphabetical": "🔎 all films A-Z",
        "alphabeticalDescription": "All films on this site in alphabetical order, in case you want to search for one.",
        "rating": "👍 all films best-worst",
        "ratingDescription": "All films on this site in order of my personal rating, from best to worst.",
        "spoilers": "spoilers...",
        "average": "average"
    };

    $("body")
        .append($("<div>")
            .attr("id", "id-controls")
        );

    // Set the theme, currently supports "dark" and "light".
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

    // Create the older lists button.
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
    const calatlogueRequest = new XMLHttpRequest();
    calatlogueRequest.open("GET", `catalogue.json?v=${cacheVersion}`, true);
    calatlogueRequest.responseType = "json";
    calatlogueRequest.onload = () => {
        if (calatlogueRequest.status === 200) {
            catalogue = calatlogueRequest.response;

            // Render the default list.
            populate(defaultList);
        }
    };

    calatlogueRequest.send();

    // Load a film from the server, and assign its properties to the parameter object.
    const loadFilm = (film) => {
        return new Promise((resolve) => {
            const filmRequest = new XMLHttpRequest();
            filmRequest.open("GET", `films/${film.list}/${film.id}.json?v=${cacheVersion}`, true);
            filmRequest.responseType = "json";
            filmRequest.onload = () => {
                if (filmRequest.status === 200 && !!filmRequest.response.review) {
                    Object.assign(film, filmRequest.response);
                };
                resolve();
            };
            filmRequest.send();
        });
    };

    // Render a list based on the name from the parameter.
    // If the name is "alphabetical", load all films in alphabetical order, and then date watched.
    // If the name is "rating", load all films in order of score, and then alphabetical, and then by date watched.
    const populate = async (list) => {
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
        // Here we add the properties to each film, so we know which ones to render.
        // We also add the list name that it came from, so we know what folder the file is in.
        let films = [];
        Object.keys(catalogue).forEach((listName, index) => {
            if (["alphabetical", "rating", listName].includes(list)) {
                films = films.concat(catalogue[listName].films.map(film => {
                    return {
                        "list": catalogue[listName].id,
                        "id": film,
                        "properties": catalogue[listName].properties
                    };
                }));
            }
        });

        // Wait and load all the required films, if they have review data.
        await Promise.all(films.map(film => loadFilm(film)));

        // Sort that list if required. Otherwise the order in the catalogue is obeyed.
        // The film ID is unique per film, and I append a 2, 3 etc when I watch it again, so an alphabetical sort is inherently then sorted by watch time.
        if (list == "alphabetical") {
            films = films
                .filter(film => film.review != undefined)
                .sort((a, b) =>
                    a.id < b.id
                        ? -1
                        : 1);
        };

        if (list == "rating") {
            films = films
                .filter(film => film.review != undefined)
                .sort((a, b) =>
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
                        // Render the spoiler tags over placeholders, if they exist.
                        .replace("#s", `<details><summary>${strings.spoilers}</summary>`)
                        .replace("#d", "</details>")
                    );

                // Add sub-ratings based on the properies from the list that the film belongs to.
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

                // If the film has a style property, and it hasn't been added already, and add a style element to the page head.
                if (film.style != undefined && $(`style:contains("${film.id}")`).length == 0) {
                    $("head").append($("<style>").html(`/* ${film.id} */ ${film.style}`));
                }

            } else {
                // If there is no review, and the content is still empty, move it to the end of the list.
                $("body").append(card);
            }
        });

        // Add the average rating for whatever is displayed, at the bottom of the page.
        // Start by getting a list of ratings that are actually set, as some films in the list might not be rated yet.
        const ratings = films.map(film => film.rating).filter(rating => rating != undefined);

        $("body")
            .append(
                $("<div>")
                    .addClass("class-body-text")
                    .append(
                        $("<div>")
                            .attr("id", "id-average")
                            .html(`${strings.average}: ${(ratings.reduce((total, rating) => total + rating, 0) / ratings.length).toFixed(1)}`)
                    ));
    };
});