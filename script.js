// TODO:
// Add older lists in dropdown, they have no images. Also add search box.

$(document).ready(() => {

    const defaultList = {
        "image": "url(\"films/horror2024/image.jpg\")",
        "id": "horror2024"
    };

    // Change the cache parameter every day, so data is cached but automatically downloaded the next day.
    // During periods where I'm not editing existing reviews, I should reduce this to be monthly. 
    const date = new Date();
    const cacheVersion = date.getFullYear().toString() + date.getMonth().toString() + date.getDate().toString();

    const strings = {
        "indexButton": "🏠 home",
        "darkButton": "🌘 theme",
        "lightButton": "🌔 theme",
        "search": "search...",
        "noResults": "no search results 👻",
        "horror": "💀 all horror",
        "horrorDescription": "All horror film reviews on this site in order of my personal rating, from best to worst. I also rate them on three fundamental traits of horror: suspense, shock and grotesque.",
        "rating": "🎬 all films",
        "ratingDescription": "All film reviews on this site in order of my personal rating, from best to worst.",
        "spoilers": "spoilers...",
        "average": "average"
    };

    // If the title matches the title regex, remove the matching id regex, to manipulate the id for sorting based on the title.
    const titleSortRegex = /(^The\s)|(^A\s)/i;
    const idSortRegex = /(^the)|(^a)/i

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

    // Set the default theme now, loading from storage if possible.
    setTheme(localStorage.getItem("theme") || "light");

    // Draw the home and theme buttons.
    $("body")
        .append($("<div>")
            .attr("id", "id-controls")
            .append($("<button>")
                .attr("id", "id-home")
                .addClass("class-shadow")
                .addClass("class-font-small")
                .html(strings.indexButton)
                .on("click", () => display(""))
            )
            .append($("<button>")
                .attr("id", "id-theme-toggle")
                .addClass("class-shadow")
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
            )
            .append(
                $("<div>")
                .addClass("class-index")
                .addClass("class-break")
            )
            .append(
                $("<input>")
                .attr("type", "text")
                .attr("placeholder", "search...")
                .attr("id", "id-search")
            )
        );

    // Load the catalogue of films into the catalogue variable.
    const calatlogueRequest = new XMLHttpRequest();
    calatlogueRequest.open("GET", `catalogue.json?v=${cacheVersion}`, true);
    calatlogueRequest.responseType = "json";
    calatlogueRequest.onload = () => {
        if (calatlogueRequest.status === 200) {
            catalogue = calatlogueRequest.response;
            catalogueFilms = catalogue
                .map(list => list.films
                    .map(film => {
                        return {
                            "id": film.id,
                            "title": film.title,
                            "properties": list.properties,
                            "list": list.id,
                            "sortTitle": titleSortRegex.test(film.title)
                                ? film.id.replace(idSortRegex, "")
                                : film.id
                        };
                    }))
                .flat();
            display(window.location.hash.replace("#", ""));
        }
    };

    // This helps the back and forwards buttons work.
    $("body").onhashchange = () => display(window.location.hash.replace("#", ""));

    // Store the catalogue here, after loading it once while the page loads.
    let catalogue = [];
    let catalogueFilms = [];
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

    const sortRating = (films) => {
        return films
            .sort((a, b) =>
                a.rating != b.rating
                    ? b.rating - a.rating
                    : a.sortTitle < b.sortTitle
                        ? -1
                        : 1);
    };

    // Display a page.
    // If the hash is empty, display the index page.
    // If the hash is populated, display films as search results.
    // Special searches are: rating, horror, or a specific list ID.
    const display = async (hash) => {
        $(".class-removable").remove();

        window.location.hash = hash;
        let description = null;

        if (hash == "") {
            // If the hash is empty, show the index page.
            $("body")
                .append(
                    $("<button>")
                        .attr("id", "id-latest")
                        .addClass("class-removable")
                        .addClass("class-index")
                        .addClass("class-shadow")
                        .html(catalogue.find(list => list.id == defaultList.id).title)
                        .css("background-image", defaultList.image)
                        .on("click", () => display(defaultList.id))
                )
                .append(
                    $("<div>")
                    .addClass("class-removable")
                    .addClass("class-break")
                )
                .append(
                    $("<button>")
                        .attr("id", "id-rating")
                        .addClass("class-removable")
                        .addClass("class-index")
                        .addClass("class-shadow")
                        .html(strings.rating)
                        .on("click", () => display("rating"))
                )
                .append(
                    $("<button>")
                        .attr("id", "id-horror")
                        .addClass("class-removable")
                        .addClass("class-index")
                        .addClass("class-shadow")
                        .html(strings.horror)
                        .on("click", () => display("horror"))
                );

        } else {
            // Search for movies and display them.
            let films = [];

            if (hash == "rating") {
                // Show all movies ordered by rating.
                films = sortRating(catalogueFilms);
                description = strings.ratingDescription;
            } else if (hash == "horror") {
                // Show horror films ordered by rating.
                films = sortRating(catalogueFilms
                    .filter(film => film.list.includes("horror")));
                description = strings.horrorDescription;
            } else {
                const catalogueList = catalogue
                    .find(list => list.id == hash);
                if (!!catalogueList) {
                    // Show all films from one list, ordered as per the list.
                    films = catalogueFilms
                        .filter(film => film.list == catalogueList.id);
                    description = catalogueList.description;
                } else {
                    // Search on film title, ordered A-Z.
                    films = sortRating(catalogueFilms
                        .filter(film => film.id.includes(hash) || film.title.includes(hash)));
                    description = films.length == 0
                        ? strings.noResults
                        : ""
                }
            }

            // Render the description at the top of the page.
            $("body")
                .append(
                    $("<div>")
                        .addClass("class-body-text")
                        .append(
                            $("<div>")
                                .attr("id", "id-description")
                                .addClass("class-removable")
                                .html(description)
                        )
                );

            // Wait and load all the required films, if they have review data.
            await Promise.all(films.map(film => loadFilm(film)));
            films = films.filter(film => !!film.review);

            films.forEach((film, index) => {

                //Add the film card and render the elements.
                $("body")
                    .append(
                        $("<div>")
                            .attr("id", `id-film-${film.id}`)
                            .addClass("class-film-card class-shadow")
                            .addClass("class-removable")
                            .append($("<div>")
                                .addClass("class-film-bar")
                                .append(
                                    $("<div>")
                                        .addClass("class-film-title class-font-large")
                                        .html(film.title)
                                )
                                .append(
                                    $("<div>")
                                        .addClass(`class-rating-large class-font-large class-rating-${film.rating}`)
                                        .html(film.rating)
                                )
                            )
                            .append(
                                $("<div>")
                                    .addClass("class-film-review")
                                    .html(film.review
                                        // Render the spoiler tags over placeholders, if they exist.
                                        .replace("#s", `<details><summary>${strings.spoilers}</summary>`)
                                        .replace("#d", "</details>")
                                    )
                            )
                            .append(
                                $("<div>")
                                    .addClass("class-film-summary class-font-small")
                                    .html(`released: ${film.year}, watched: ${film.date} ${film.seen ? "(seen before)" : "(first time)"}`)
                            ).append($("<div>")
                                .addClass("class-film-bar")
                                .append(
                                    $("<div>")
                                        .addClass("class-film-word class-font-small")
                                        .html((film.word || "").toLowerCase())
                                )
                            )
                    );

                // Render the properties for this film.
                film.properties.forEach((property, index) => {
                    if (film[property] !== undefined) {
                        $(`id-film-${film.id}`)
                            .find(".class-film-word")
                            .after(
                                $("<div>")
                                    .addClass(`class-rating-small class-rating-${film[property]} class-font-small`)
                                    .html(`${property}: ${film[property]}`)
                            )
                    }
                });

                // If the film has a style property, and it hasn't been added already, and add a style element to the page head.
                if (film.style != undefined && $(`style:contains("/* ${film.id} /*")`).length == 0) {
                    $("head")
                        .append($("<style>")
                            .html(`/* ${film.id} */ ${film.style}`));
                }
            });

            // Add the average rating for whatever is displayed, at the bottom of the page.
            const ratings = films.map(film => film.rating).filter(rating => rating != undefined);
            if (ratings.length > 0) {
                $("body")
                    .append(
                        $("<div>")
                            .addClass("class-body-text")
                            .append(
                                $("<div>")
                                    .attr("id", "id-average")
                                    .html(`${strings.average}: ${(ratings.reduce((total, rating) => total + rating, 0) / ratings.length).toFixed(1)}`)
                            ));
            }
        }
    };
});