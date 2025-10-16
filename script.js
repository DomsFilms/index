$(document).ready(() => {

	const currentLists = [
		{
			"image": "url(\"films/horror2025/image.jpg\")",
			"title": "2025 horror marathon",
			"id": "horror2025"
		},
		{
			"image": "url(\"films/thebigpicture2025/image.jpg\")",
			"title": "The Big Picture 25 for 25 project",
			"id": "thebigpicture2025"
		},
		{
			"image": "url(\"films/friday2025/image.jpg\")",
			"title": "2025 Friday the 13th marathon",
			"id": "friday2025"
		},
		{
			"image": "url(\"films/allhorror2025/image.jpg\")",
			"title": "All Other 2025 horror reviews",
			"id": "allhorror2025"
		}
	];
	let currentSlideId = 0;
	let autoSlide = true;

	// Reviews are cached in the browser monthly, to prevent them being transferred constantly.
	// The catalogue is cached hourly, so that new reviews show up faster.
	const date = new Date();
	const longCacheVersion = date.getFullYear().toString() + date.getMonth().toString() + "b";
	const shortCacheVersion = longCacheVersion + date.getDate().toString() + date.getHours().toString();

	const strings = {
		"indexButton": "🏠 home",
		"darkButton": "🌘 theme",
		"lightButton": "🌔 theme",
		"search": "search...",
		"noResults": "no search results 👻",
		"latest": "📆 all films (latest)",
		"latestDescription": "All film reviews on this site in order of recency.",
		"ranked": "👍 all films (ranked)",
		"rankedDescription": "All film reviews on this site in order of my personal rating, from best to worst.",
		"recommendation": "recommendation of the week",
		"spoilersIcon": "❓ ",
		"spoilersSummary": "spoilers...",
		"tagsIcon": "🏷️ ",
		"tagsSummary": "tags...",
		"released": "released: ",
		"watched": "watched: ",
		"played": "played: ",
		"seenBefore": "(seen before)",
		"playedBefore": "(played before)",
		"firstTime": "(first time)",
		"listAttribution": "collection: ",
		"average": "average"
	};

	// If the title matches the title regex, remove the matching id regex, to manipulate the id for sorting based on the title.
	const titleSortRegex = /(^The\s)|(^A\s)/i;
	const idSortRegex = /(^the)|(^a)/i

	// Store the catalogue here, after loading it once while the page loads.
	let catalogue = [];
	let catalogueFilms = [];
	let catalogueLoaded = false;

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
			.append([
				$("<button>")
					.attr("id", "id-home")
					.addClass("class-shadow")
					.addClass("class-font-small")
					.html(strings.indexButton)
					.on("click", () => display("")),
				$("<button>")
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
					}),
				$("<div>")
					.addClass("class-break"),
				$("<input>")
					.attr("type", "text")
					.attr("placeholder", "search...")
					.attr("id", "id-search")
					.addClass("class-shadow")
			])
		);

	// Add a debounced search function to the search box.
	const delaySearch = () => {
		let timeout;
		return (...args) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => display($("#id-search").val()), 500);
		};
	};
	$("#id-search").on("input", delaySearch());

	// Load the catalogue of films into the catalogue variable.
	const calatlogueRequest = new XMLHttpRequest();
	calatlogueRequest.open("GET", `catalogue.json?v=${shortCacheVersion}`, true);
	calatlogueRequest.responseType = "json";
	calatlogueRequest.onload = async () => {
		if (calatlogueRequest.status === 200) {
			catalogue = calatlogueRequest.response;
			catalogueFilms = catalogue
				.map(list => list.films
					.map(film => {
						return {
							"id": film,
							"properties": list.properties,
							"listId": list.id,
							"listTitle": list.title,
							"spoilersIcon": list.spoilersIcon || strings.spoilersIcon,
							"spoilersSummary": list.spoilersSummary || strings.spoilersSummary,
							"tagsIcon": list.tagsIcon || strings.tagsIcon,
							"tagsSummary": list.tagsSummary || strings.tagsSummary,
						};
					}))
				.flat();

			// Load all films in the background.
			await Promise.all(catalogueFilms.map(film => loadFilm(film)));

			// Calculate the titles for sorting.
			catalogueFilms.forEach((film, id) => {
				film.sortTitle = titleSortRegex.test(film.title)
					? film.id.replace(idSortRegex, "")
					: film.id
			});

			catalogueLoaded = true;

			// The index page is probably displayed without this right now, so add it.
			displayRecommendedFilm();

			// Load a specific list, or search result if it was supplied.
			const hash = decodeURIComponent(window.location.hash).replace("#", "");
			if (!!hash) {
				$("#id-search").val(hash);
				display(hash);
			}
		}
	};

	calatlogueRequest.send();

	// Load a film from the server, and assign its properties to the parameter object.
	const loadFilm = (film) => {
		return new Promise((resolve) => {
			const filmRequest = new XMLHttpRequest();
			filmRequest.open("GET", `films/${film.listId}/${film.id}.json?v=${longCacheVersion}`, true);
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

	const parseDate = (dateString) => {
		if (dateString.length > 10) {
			return 0;
		}
		const parts = dateString.split("/");
		return new Date(parseInt(parts[2], 10),
			parseInt(parts[1], 10) - 1,
			parseInt(parts[0], 10));
	};

	const sortTitle = (films) => {
		return structuredClone(films)
			.sort((a, b) =>
				a.sortTitle < b.sortTitle
					? -1
					: 1);
	};

	const sortRating = (films) => {
		return structuredClone(films)
			.sort((a, b) =>
				a.rating != b.rating
					? b.rating - a.rating
					: a.sortTitle < b.sortTitle
						? -1
						: 1);
	};

	const sortDate = (films, latest) => {
		const modifier = latest
			? -1
			: 1;
		return structuredClone(films)
			.sort((a, b) =>
				modifier *
				(a.date != b.date
					? parseDate(a.date) - parseDate(b.date)
					: a.sortTitle < b.sortTitle
						? -1
						: 1));
	};

	const searchMatch = (film, hash) =>
		hash.split(" ").every(word => film.id.toLowerCase().includes(word)
			|| film.title.toLowerCase().includes(word)
			|| (film.subtitle || "").toLowerCase().includes(word)
			|| (film.search || "").toLowerCase().includes(word));

	// Display a page.
	// If the hash is empty, display the index page.
	// If the hash is populated, display films as search results.
	// Special searches are: ranked, latest, or a specific list ID.
	window.display = async (hash, keepHash) => {
		$(".class-removable").remove();
		hash = hash.toLowerCase();

		if (!keepHash) {
			window.location.hash = hash;
		}

		if (hash == "" || !catalogueLoaded) {
			// Also display the index page if the catalogue hasn't been loaded yet.
			// This will make buttons seem unresponsive while loading, but hopefully it will only be the first two seconds upon arrival.
			$("body")
				.append(displayIndex());
			displayRecommendedFilm();
			$("#id-search").val("");

		} else {
			// TODO: Here is a good place to render a loading screen if the catalogue has not fully loaded.
			// Search for films and display them.
			let films = [];
			let description = null;
			const catalogueList = catalogue
				.find(list => list.id == hash);

			if (hash == "ranked") {
				// Show all films ordered by rating.
				films = sortRating(catalogueFilms);
				description = strings.rankedDescription;
			} else if (hash == "latest") {
				// Show all films ordered by recency.
				films = sortDate(catalogueFilms, true);
				description = strings.latestDescription;
			} else if (!!catalogueList) {
				// Show all films from one list, ordered as per the list.
				films = catalogueFilms
					.filter(film => film.listId == catalogueList.id);
				description = catalogueList.description;
			} else {
				// Search on film title, ordered A-Z.
				films = sortTitle(catalogueFilms
					.filter(film => searchMatch(film, hash)));
				description = films.length == 0
					? strings.noResults
					: "";
				$("#id-search").val(hash);
			}

			// Render the description at the top of the page.
			$("body")
				.append(
					$("<div>")
						.addClass("class-body-text")
						.addClass("class-removable")
						.append(
							$("<div>")
								.attr("id", "id-description")
								.addClass("class-removable")
								.html(description)
						)
				);

			// Don't render films that haven't been loaded (yet).
			films = films.filter(film => !!film.review);

			if (window.innerWidth > 1000) {
				// Masonry container.
				$("body").append(
					$("<div>")
						.attr("id", "id-grid")
						.addClass("class-removable")
				);

				films.forEach((film, id) => {
					$("#id-grid")
						.append(displayFilm(film));
				});

				applyMasonry();
				$("details")
					.on('toggle', () => {
						// Re-apply because the height of the film will have changed.
						applyMasonry();
					});

			} else {
				films.forEach((film, id) => {
					// Just stick them in the flex body.
					$("body")
						.append(displayFilm(film));
				});
			}



			// Add the average rating for whatever is displayed, at the bottom of the page.
			const ratings = films.map(film => film.rating).filter(rating => rating != undefined);
			if (ratings.length > 0) {
				$("body")
					.append(
						$("<div>")
							.addClass("class-body-text")
							.addClass("class-removable")
							.append(
								$("<div>")
									.attr("id", "id-average")
									.html(`${strings.average}: ${(ratings.reduce((total, rating) => total + rating, 0) / ratings.length).toFixed(1)}`)
							));
			}
		}
	};

	// Apply/re-apply the Masonry layout, so the films look nice on larger screens.
	const applyMasonry = () => {
		if (window.innerWidth > 1000) {
			$("#id-grid").masonry({
				itemSelector: '.class-film-card',
				gutter: 12,
				horizontalOrder: true,
				fitWidth: true
			});
		}
	}

	const displayIndex = () => {
		let current = $("<div>")
			.attr("id", "id-current")
			.addClass("class-removable")
			.addClass("slider")
			.append(
				$("<div>")
					.attr("id", "id-current-slides")
			);

		currentLists.forEach((list, id) => {
			current
				.append(
					$("<div>")
						.attr("id", `id-current-dot-${id}`)
						.addClass("class-current-dot")
						.addClass("class-shadow")
						.on("click", () => {
							autoSlide = false;
							$(`#id-current-slide-${id}`)[0].scrollIntoView(false);
						})
				)
				.find("#id-current-slides")
				.appendTo(current)
				.append(
					$("<button>")
						.attr("id", `id-current-slide-${id}`)
						.addClass("class-index")
						.addClass("class-index-wide")
						.addClass("class-shadow")
						.html(list.title)
						.css("background-image", list.image)
						.on("click", () => display(list.id))
				);
		});

		currentSlideId = 0;
		autoSlide = true;

		return [
			current,
			$("<div>")
				.addClass("class-removable")
				.addClass("class-break"),
			$("<button>")
				.attr("id", "id-latest")
				.addClass("class-removable")
				.addClass("class-index")
				.addClass("class-shadow")
				.html(strings.latest)
				.on("click", () => display("latest")),
			$("<button>")
				.attr("id", "id-ranked")
				.addClass("class-removable")
				.addClass("class-index")
				.addClass("class-shadow")
				.html(strings.ranked)
				.on("click", () => display("ranked")),
			$("<div>")
				.addClass("class-removable")
				.addClass("class-break")
		];
	};

	const displayFilm = (film) => {

		// Replace movie titles with links if there exists reviews for them.
		let review = film.review;
		let regex = /{([^}]+)}/g;
		let match;
		while ((match = regex.exec(film.review)) !== null) {
			if (catalogueFilms.some(result => result.title == match[1])) {
				review = review.replace(match[0], `<i><u onclick="display('${match[1]}')">${match[1]}</u></i>`);
			} else {
				review = review.replace(match[0], `<i>${match[1]}</i>`);
			}
		}

		let spoilers = film.spoilers;
		regex = /{([^}]+)}/g; // This is done to reset the regex object, which is stateful.
		while ((match = regex.exec(film.spoilers)) !== null) {
			if (catalogueFilms.some(result => result.title == match[1])) {
				spoilers = spoilers.replace(match[0], `<i><u onclick="display('${match[1]}')">${match[1]}</u></i>`);
			} else {
				spoilers = spoilers.replace(match[0], `<i>${match[1]}</i>`);
			}
		}

		let verb = "";
		let verbBefore = "";
		switch (film.media) { // The default is obviously film, but this property might exist as an override.
			case "game":
				verb = strings.played;
				verbBefore = strings.playedBefore;
				break;
			default:
				verb = strings.watched;
				verbBefore = strings.seenBefore;
				break;
		}

		const card = $("<div>")
			.attr("id", `id-film-${film.id}`)
			.addClass("class-film-card class-shadow")
			.addClass("class-removable")
			.append([
				$("<div>")
					.addClass("class-film-bar")
					.append(
						$("<div>")
							.addClass("class-film-title class-font-large")
							.html(film.title)
							.append(
								!!film.subtitle
									? $("<span>")
										.addClass("class-font-small")
										.html(film.subtitle)
									: null
							)
					)
					.append(
						$("<div>")
							.addClass(`class-rating-large class-font-large class-rating-${film.rating}`)
							.html(film.rating)
					),
				$("<div>")
					.addClass("class-film-review")
					.html(review),
				$("<div>")
					.addClass("class-film-summary class-font-small")
					.html(`${strings.released}${film.year}, ${verb}${film.date} ${film.before ? verbBefore : strings.firstTime}`),
				$("<div>")
					.addClass("class-film-summary class-font-small")
					.html(`${strings.listAttribution}<u onclick="display('${film.listId}')">${film.listTitle}</u>`),
				$("<div>")
					.addClass("class-film-bar")
					.append(
						$("<div>")
							.addClass("class-film-word class-font-small")
							.html((film.word || "").toLowerCase())
					)
			]);

		// Render the tags for this film.
		if (!!film.tags) {
			card.find(".class-film-review")
				.after(
					$("<details>")
						.append(
							$("<summary>")
								.html(film.tagsSummary)
								.css({ "list-style-type": `\"${film.tagsIcon}\"` })
						)
						.append(
							$("<div>")
								.addClass("class-tag-container class-font-small")
						)
						.addClass("class-film-tags")
				);
			(film.tags).forEach((tag, id) => {
				card.find(".class-tag-container")
					.append(
						$("<div>")
							.addClass("class-tag")
							.html(tag.toLowerCase())
					);
			});
		}

		// Render the spoilers for this film.
		if (!!film.spoilers) {
			card.find(".class-film-review")
				.after(
					$("<details>")
						.addClass("class-film-spoilers")
						.html(spoilers)
						.prepend(
							$("<summary>")
								.html(film.spoilersSummary)
								.css({ "list-style-type": `\"${film.spoilersIcon}\"` })
						)
				);
		}

		// Render the properties for this film.
		film.properties.forEach((property, id) => {
			regex = /^(10|\d)$/i;
			if (film[property] !== undefined) {
				card.find(".class-film-word")
					.after(
						$("<div>")
							.addClass(`class-rating-small ${regex.test(film[property]) ? "class-rating-" + film[property] : "class-rating-null"} class-font-small`)
							.html(`${property}: ${film[property]}`)
					);
			}
		});

		// If the film has a style property, and it hasn't been added already, and add a style element to the page head.
		if (film.style != undefined && $(`style:contains("/* ${film.id} /*")`).length == 0) {
			$("head")
				.append($("<style>")
					.html(`/* ${film.id} */ ${film.style}`));
		}

		return card;
	};

	const displayRecommendedFilm = () => {
		if ($("#id-recommendation").length > 0
			|| $(".class-index").length == 0
			|| !catalogueLoaded) { // TODO: Here is a good place to render a loading element if the catalogue has not fully loaded.
			return;
		}

		// Get the time of the start of the week, Monday.
		const date = new Date();
		date.setDate(date.getDate() - (date.getDay() === 0 ? 6 : date.getDay() - 1));
		date.setHours(0, 0, 0, 0);

		// Only consider films rated 7 and up.
		// Only consider films watched before the start of the previous week, or the recommendation will change mid-week when new reviews are added.
		// 1360800000 is two weeks in milliseconds. This gives me a window to review recently watched films, but not too long to prevent laziness.
		const films = sortDate(catalogueFilms
			.filter(film => film.rating >= 7 && parseDate(film.date) < date - 1360800000),
			false);

		// The date has the ms value set to 0, to be consistent, but this makes the total time in ms end in loads of 0s.
		// So divide by 1000, then do % 7919, the 1000th prime, to get number that won't end in 0s.
		// If all weeks resulted in a number with similar digits, it could maybe cause repetition?
		// Now we can % by the total number of films that we want to select from.
		const weekNumber = (date.getTime() / 1000) % 7919 % films.length;

		// These don't have the index class because I don't want them to be shrunk into small widths.
		$(".class-break")
			.last()
			.after([
				$("<div>")
					.attr("id", "id-recommendation")
					.addClass("class-body-text")
					.addClass("class-removable")
					.html(strings.recommendation),
				displayFilm(films[weekNumber])
					.addClass("class-recommendation")
			]);
	};

	// Start the interval for auto-scrolling the default lists.
	setInterval(() => {
		if (autoSlide) {
			const slides = $("#id-current-slides")[0];
			let currentSlide = $(`#id-current-slide-${currentSlideId}`)[0];
			// If the current slide is not in view, it must have been interacted with by the user, so stop scrolling.
			if (slides && currentSlide && Math.abs(slides.getBoundingClientRect().x - currentSlide.getBoundingClientRect().x > 50)) {
				autoSlide = false;
				return;
			}
			currentSlideId++;
			if (currentSlideId >= currentLists.length) {
				currentSlideId = 0;
			}
			currentSlide = $(`#id-current-slide-${currentSlideId}`)[0];
			currentSlide && currentSlide.scrollIntoView(false);
		}
	}, 5000);

	// This helps the back and forwards buttons work.
	// I don't think this works, but it would be nice if it did.
	$("body").onhashchange = () => display(decodeURIComponent(window.location.hash).replace("#", ""));

	// If no films have been loaded yet (they are on the way), start by displaying the index page.
	if (!catalogueLoaded) {
		display("", true);
	}
});