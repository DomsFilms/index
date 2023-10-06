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

    const films = [
        "Relic 2020",
        "The Dark and the Wicked 2020",
        "Altered States 1980",
        "Salem's Lot Part 1 1979",
        "Salem's Lot Part 2 1979",
        "The Texas Chain Saw Massacre 1974",
        "The Cabinet of Dr. Caligari 1920",
        "Nope 2022",
        "Halloween 1978",
        "The Strangers 2008",
        "The Babysitter 2017",
        "Crimes of the Future 2022",
        "Deep Red 1975",
        "Devil Fetus 1983",
        "Eraserhead 1977",
        "Evolution 2016",
        "A Field in England 2013",
        "Gonjiam:Haunted Asylum 2018",
        "Green Room 2015",
        "Grindhouse: Planet Terror 2007",
        "Bram Stoker's Dracula 1992",
        "It Follows 2014",
        "Kwaidan 1964",
        "Lights Out 2016",
        "Below 2002",
        "Oxygen 2021",
        "The Phantom Carriage 1921",
        "Pieces 1982",
        "[REC] 2007",
        "Run 2020",
        "Session 9 2001",
        "Shocker 1989",
        "The Strangers: Prey at Night 2018",
        "An American Werewolf in London 1981",
        "Berberian Sound Studio 2012",
        "Brain Damage 1988",
        "Bliss 2019",
        "The Love Witch 2016",
        "Pearl 2022",
        "Troll Hunter 2010"
    ];

    const filmDatas = [
        {
            "title": "film1",
            "review": "a film"
        },
        {
            "title": "film2",
            "review": "a film 2"
        }
    ];

    films.forEach((title, index) => {
        // Create empty film data.
        let film = {
            "title": title,
            "review": ""
        };

        // Hydrate with loaded data.
        //film = filmDatas.filter(f => f.title == title)[0] || film;
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `films/2023october/${title}.json`, true);
        xhr.responseType = 'json';
        xhr.onload = () => {
            let status = xhr.status;
            if (status === 200) {
                fn(xhr.response);
            } else {
                fn(film);
            }
        };
        xhr.send();

        let fn = (film) => {
            // Add film card content.
            $("body")
            .append(
                $("<div>")
                .addClass("class-film-card")
                .attr("id", `id-film-${film.title}`)
                .append(
                    $("<div>")
                    .addClass("class-film-title")
                    .html(film.title)
                )
                .append(
                    $("<div>")
                    .addClass("class-film-review")
                    .html(film.review)
                )
            );

            // Apply unwatched class.
            if (!film.review)
            $(`#id-film-${film.title}`)
                .addClass("class-film-unwatched");
        };

        return;
    });
});