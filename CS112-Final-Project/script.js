$(document).ready(function() {

    $("#search_Btn").on("click", function() {
        //deletes all the movies currently on screen
        //to make sure that only the movies searched for are present on screen
        $(".error_Checker").remove();
        deleteMovies();

        //variables for API call (moviename and movietype)
        try {
            var movieName = $("#movie_Name_Inputer").val();
            var movieType = $("#movie_Type_Selector").val();
            if (movieName == "") {
                throw "Please input the name of the (Movie | Series) to return valid information.";
            }
        } catch (err) {
            alert(err);
        }

        //variables for API call (endpoing, parameters, apikey)
        var endpoint = "https://www.omdbapi.com/?";
        var search = "s=" + movieName;
        var type = "&type=" + movieType;
        var apikey = "&apikey=36cef6b";

        //when movieType is not episode (Movie, Series, or All), then it will show the movies.
        if (movieType != "episode") {
            var urlOMD = endpoint + search + type + apikey;
            //API call
            $.getJSON(urlOMD, function(result) {
                setPages(urlOMD, movieName, movieType, result);
            });
        }


        //when movieType is episode, then it will create the episode information
        if (movieType == "episode") {
            var urlOMD = endpoint + search + "&type=series" + apikey;

            $.getJSON(urlOMD, function(result) {

                //checks for errors
                if (result.Response != "True") {
                    return handleError("error", movieName);
                }

                //loops through each series
                for (var i = 0; i < result.Search.length; i++) {
                    //changes the urlOMD to work properly in different scenarios.
                    urlOMD = urlOMD.replace("s=" + movieName, "s=" + result.Search[i].Title);
                    urlOMD = urlOMD.replace("s=" + result.Search[0].Title, "t=" + result.Search[i].Title);
                    urlOMD = urlOMD.replace("t=" + result.Search[0].Title, "t=" + result.Search[i].Title);

                    //creates the episode information and shows it to user
                    setEpisodesInfo(urlOMD, movieName, movieType);
                }
            });
        }
    });
});

//sets the movie information to the screen
function setMovieInfo(urlOMD, movieName) {

    $.getJSON(urlOMD, function(result) {

        //checks for errors
        if (result.Response != "True") {
            return handleError("error", movieName);
        }

        for (var i = 0; i < result.Search.length; i++) {
            //the movie div where the information for each movie will be shown
            var movieDiv = $("<div></div>");

            //checks if poster is available, otherwise it will show unavailable. 
            //Also returns the movie poster.
            var imgMovie = createMovieImage(result.Search[i].Poster);

            var h4Title = $("<h4></h4>").text(result.Search[i].Title);
            var pType = $("<p></p>").text("Type: " + result.Search[i].Type);
            var pYear = $("<p></p>").text("Year: " + result.Search[i].Year);
            var aImdLink = $("<a></a>").attr("href", "https://www.imdb.com/title/" + result.Search[i].imdbID).text("View on IMDb");

            //appends the movie infomation to the div and styles it with CSS
            movieDiv = appendMovies(movieDiv, h4Title, pType, pYear, aImdLink, imgMovie);

            setMovieStyleCSS(movieDiv);
        }
    });
}


//sets the CSS styling to the movieDivs
function setMovieStyleCSS(movieDiv) {
    movieDiv.addClass("col-sm-3");
    movieDiv.addClass("divMovieInfo");
    $("body").append(movieDiv);
    $("body").css("background-color", "#E9ECEF");
}



//appends the information to the div and shows it to the user
function appendMovies(movieDiv, h4Title, pType, pYear, aImdLink, imgMovie) {

    //appending the movie information to the movieDiv and the <hr> for better visual of the information
    movieDiv.append(imgMovie).append($("<hr>"));
    movieDiv.append(h4Title).append($("<hr> "));
    movieDiv.append(pType).append($("<hr>"));
    movieDiv.append(pYear).append($("<hr>"));
    movieDiv.append(aImdLink).append($("<hr>"));

    return movieDiv;
}


//checks if poster is available, otherwise it will show unavailable
function createMovieImage(result) {
    if (result != "N/A") {
        var imgMovie = $("<img>").attr("src", result);
    } else {
        imgMovie = $("<img>").attr("src", "Screenshot (20).png");
    }

    return imgMovie;
}



//deletes all the movies on Screen
//the movies will be replaced with the new movies searched for
function deleteMovies() {
    $("div").remove(".divMovieInfo");
    $("div").remove(".divEpisodeInfo");
}

function setPages(urlOMD, movieTitle, movieType, result) {
    //j is the counter for page #
    var j = 1;

    do {

        //adds page parameter to API call
        var page = "&page=" + j;
        urlOMD = urlOMD + page;

        //deletes the old page parameter of API call to add an updated one
        setMovieInfo(urlOMD, movieTitle);

        //if movieType is All, then changes t)he urlOMD to work properly, then sends it to setEpisodesInfo(urlOMD to create the episode information
        urlOMD = urlOMD.replace("&page=" + j, "");
        j++;
    }

    //loops through the pages of the movie searched.
    while (j <= Math.ceil(result.totalResults / 10));

    if (movieType == "") {
        urlOMD = urlOMD.replace("s=", "t=");
        setEpisodesInfo(urlOMD, movieTitle, movieType);
    }
}


//creates the episodes info, sets it to the div, and shows the div
function setEpisodesInfo(urlOMD, movieName, movieType) {
    $.getJSON(urlOMD, function(result) {

        //checks for errors
        if (result.Response != "True" && movieType != "") {
            return handleError("error", movieName);
        }

        //loops through the season of each series
        for (var i = 1; i <= result.totalSeasons; i++) {
            //gets the season #
            var newUrlOMD = urlOMD + "&Season=" + i;

            $.getJSON(newUrlOMD, function(episodeResult) {

                //loops through the episodes of each season of each series
                for (var j = 0; j < episodeResult.Episodes.length; j++) {

                    //sets the div information
                    var epsImage = createMovieImage(result.Poster);
                    var epsTitle = $("<h4></h4>").text(episodeResult.Episodes[j].Title);
                    var epsType = $("<p></p>").text("Type: Episode");
                    var epsYear = $("<p></p>").text("Year: " + episodeResult.Episodes[j].Released);
                    var epsImdLink = $("<a></a>").attr("href", "https://www.imdb.com/title/" + episodeResult.Episodes[j].imdbID).text("View on IMDb");

                    //creates the div, appends the episode information to the div, and styles it
                    var epsDiv = $("<div></div>");
                    epsDiv = appendMovies(epsDiv, epsTitle, epsType, epsYear, epsImdLink, epsImage);
                    setMovieStyleCSS(epsDiv);
                }
            });
        }
    });
}

//handles the errors
function handleError(err, movieName) {
    $(".error_Checker").remove();
    err = "I'm sorry, but we did not find any results for " + movieName;
    var errP = $("<p></p>").addClass("error_Checker").text(err);
    $("body").append(errP);
    $("body").css("background-color", "#E9ECEF");
    return "";
}