$(document).ready(() => {

    // Use this default list, so the page always shows the current project as it loads.
    const defaultList = "horror2024";

    // Ingest the fragment
    const fragment = window.location.hash.replace("#", "");

    // Change the cache parameter every day, so data is cached but automatically downloaded the next day.
    // During periods where I'm not editing existing reviews, I should reduce this to be monthly. 
    const date = new Date();
    const cacheVersion = date.getFullYear().toString() + date.getMonth().toString() + date.getDate().toString();

    // Store the catalogue here, after loading it once while the page loads.
    let catalogue = [];

    const strings = {
        "darkButton": "🌘 dark mode",
        "lightButton": "🌔 light mode",
        "olderLists": "📆 older lists",
        "horror": "💀 all horror best-worst",
        "horrorDescription": "All horror film reviews on this site in order of my personal rating, from best to worst. I also rate them on three fundamental traits of horror: suspense, shock and grotesque.",
        "alphabetical": "🔎 all films A-Z",
        "alphabeticalDescription": "All film reviews on this site in alphabetical order, in case you want to search for one.",
        "rating": "👍 all films best-worst",
        "ratingDescription": "All film reviews on this site in order of my personal rating, from best to worst.",
        "spoilers": "spoilers...",
        "average": "average"
    };

    // If the title matches the title regex, remove the matching id regex, to manipulate the id for sorting based on the title.
    const titleSortRegex = /(^The\s)|(^A\s)/i;
    const idSortRegex = /(^the)|(^a)/i

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
            catalogue.forEach((list, index) => {

                // Draw a divider after the last horror list item. It's assumed these always come first.
                if (!list.id.includes("horror") && $(".class-popup-hr").length == 0) {
                    $("#id-lists-popup")
                        .append(
                            $("<button>")
                                .addClass("class-shadow-small class-font-small")
                                .on("click", () => {
                                    populate("horror");
                                })
                                .html(strings.horror)
                        ).append(
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
                                populate(list.id);
                            })
                            .html(list.title)
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

            // Check the fragment for specific list, or use the default list.
            let listId = ["horror", "alphabetical", "rating"].find(listId => listId == fragment)
                || (catalogue.find(list => list.id == fragment || list.films.includes(fragment)) || {}).id
                || defaultList;
            populate(listId);
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

    // Render a list based on the id from the parameter.
    // If the name is "horror", load all horror films in order of score, and then alphabetical, and then by date watched.
    // If the name is "alphabetical", load all films in alphabetical order, and then date watched.
    // If the name is "rating", load all films in order of score, and then alphabetical, and then by date watched.
    const populate = async (listId) => {
        $(".class-popup").remove();
        $(".class-body-text").remove();
        $(".class-film-card").remove();

        // Get the initial film list, and list description.
        // Use a hard-coded description in the case of an all-films list.
        let films = null;
        let description = null;
        let list = null;
        switch (listId) {
            case "horror":
                films = catalogue
                    .filter(list => list.id.includes("horror"));
                description = strings.horrorDescription;
                break;
            case "alphabetical":
                films = catalogue;
                description = strings.alphabeticalDescription;
                break;
            case "rating":
                films = catalogue;
                description = strings.ratingDescription;
                break;
            default:
                list = catalogue.find(list => list.id == listId);
                description = list.description;
                films = [list];
                break;
        }

        // At the moment the films value is an array of catalogue entries, a list of lists.
        // We just did this because it's easy to filter the catalogue on the listId above.
        // Now, convert it to a list of film data, ready to be loaded.
        // We add the list name that it came from, so we know what folder the file is in.
        // We also add the properties to render for each film.
        films = films
            .map(list => list.films
                .map(film => {
                    return {
                        "id": film,
                        "list": list.id,
                        "properties": list.properties
                    };
                })
            )
            .flat()
            .filter(film => film.link != true || !["horror", "alphabetical", "rating"].includes(listId));

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

        // Wait and load all the required films, if they have review data.
        await Promise.all(films.map(film => loadFilm(film)));

        // Add a sortTitle property using the regex.
        films.forEach((film, index) => {
            film.sortTitle = titleSortRegex.test(film.title)
                ? film.id.replace(idSortRegex, "")
                : film.id;
        });

        // Sort that list if required. Otherwise the order in the catalogue is obeyed.
        // Apply the title transformation regex replace, then also add the ID.
        // The film ID is unique per film, and I append a 2, 3 etc when I watch it again, so an alphabetical sort is inherently then sorted by watch time.
        if (listId == "alphabetical") {
            films = films
                .filter(film => film.review != undefined)
                .sort((a, b) =>
                    a.sortTitle < b.sortTitle
                        ? -1
                        : 1
                );
        }

        if (["rating", "horror"].includes(listId)) {
            films = films
                .filter(film => film.review != undefined)
                .sort((a, b) =>
                    a.rating != b.rating
                        ? b.rating - a.rating
                        : a.sortTitle < b.sortTitle
                            ? -1
                            : 1);
        }

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

                if (film.link == false) {
                    card
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
                }

                // If the film has a style property, and it hasn't been added already, and add a style element to the page head.
                if (film.style != undefined && $(`style:contains("/* ${film.id} /*")`).length == 0) {
                    $("head").append($("<style>").html(`/* ${film.id} */ ${film.style}`));
                }

                // Scroll to the film, if it was in the fragment.
                if (fragment == film.id) {
                    card[0].scrollIntoView();
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