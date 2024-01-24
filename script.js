$(document).ready(() => {

    let defaultList = "2024 ad hoc spooky stuff";

    setTheme = (theme) => {
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

    let random = () => "2023";//Math.round(Math.random() * 10000).toString();

    // Set up the theme toggle button.
    $("#id-theme-toggle").on("click", () => {
        let body = $("body");
        if (body.hasClass("class-theme-light")) {
            setTheme("dark");
        } else {
            setTheme("light");
        }
    });

    let populate = (list) => {
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
            let x = new XMLHttpRequest();
            x.open('GET', `films/${list.id}/${film}.json?v=${random()}`, true);
            x.responseType = 'json';
            x.onload = () => {
                let card = $(`#id-film-${film}`);
                if (x.status === 200 && !!x.response.review) {

                    // Hydrate element.
                    card.removeClass("class-film-unwatched")
                        .append(
                            $("<div>")
                                .addClass("class-film-summary class-font-small")
                                .html(`released: ${x.response.year}, watched: ${x.response.date} ${x.response.seen ? "(seen before)" : "(first time)"}`)
                        )
                        .append($("<div>")
                            .addClass("class-film-bar")
                            .append(
                                $("<div>")
                                    .addClass("class-film-word class-font-small")
                                    .html((x.response.word || "").toLowerCase())
                            )
                        );

                    card.find(".class-film-title")
                        .html(x.response.title);

                    card.find(".class-rating-large")
                        .html(x.response.rating)
                        .addClass(`class-rating-${x.response.rating}`);

                    card.find(".class-film-review")
                        .html(x.response.review);

                    // Add sub-ratings.
                    let properties = [
                        "grotesque",
                        "shock",
                        "suspense",
                        "believable",
                        "breathless",
                        "bombast",
                        "hardness",
                        "intrigue",
                        "worldbuilding",
                        "expected"
                    ];

                    properties.forEach((property, index) => {
                        if (x.response[property] !== undefined) {
                            card.find(".class-film-word")
                                .after(
                                    $("<div>")
                                        .addClass(`class-rating-small class-rating-${x.response[property]} class-font-small`)
                                        .html(`${property}: ${x.response[property]}`)
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
            x.send();

            return;
        });
    };

    // Load the catalogue of films.
    let c = new XMLHttpRequest();
    c.open('GET', `catalogue.json?v=${random()}`, true);
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
                            .addClass("class-popup class-shadow-large")
                    );

                    Object.keys(c.response).forEach((list, index) => {
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