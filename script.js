$(document).ready(() => {

    const defaultList = "2024 ad hoc spooky stuff";
    const date = new Date();
    const cacheVersion = date.getFullYear().toString() + date.getMonth.toString();

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

                        Object.keys(request.response).forEach((list, index) => {
                            completeList["properties"] = completeList["properties"].concat(request.response[list]["properties"]);
                            completeList["films"] = completeList["films"].concat(request.response[list]["films"]);

                            if (list.indexOf("spooky") < 0 && $(".class-popup-hr").length == 0) {
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
                                            populate(request.response[list]);
                                        })
                                        .html(list)
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
                                        populate(completeList);
                                    })
                                    .html("all films A-Z")
                            );
                    }
                });

                populate(request.response[defaultList]);
            }
        };

        request.send();
        return;
    };

    const populate = (list) => {
        $(".class-popup").remove();
        $(".class-body-text").remove();
        $(".class-film-card").remove();

        $("body")
            .append(
                $("<div>")
                    .addClass("class-body-text")
                    .append(
                        $("<div>")
                            .attr("id", "id-description")
                            .html(list.description)
                    ));

        list.films.forEach((film, index) => {

            // Add empty content.
            $("body")
                .append(
                    $("<div>")
                        .addClass("class-film-card class-film-unwatched class-shadow-small")
                        .attr("id", `id-film-${film}`)
                        .append($("<div>")
                            .addClass("class-film-bar")
                            .append(
                                $("<div>")
                                    .addClass("class-film-title class-font-large")
                                    .html(film)
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
            request.open('GET', `films/${list.id}/${film}.json?v=${cacheVersion}`, true);
            request.responseType = 'json';
            request.onload = () => {
                const card = $(`#id-film-${film}`);
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
                    list.properties.forEach((property, index) => {
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
                if (list.films.length == $(".class-film-card:not(.class-film-unwatched)").length) {
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