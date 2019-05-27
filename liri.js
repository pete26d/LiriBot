require("dotenv").config();
var keys = require("./keys.js");
var Spotify = require("node-spotify-api");
var axios = require("axios");
var moment = require("moment");
var fs = require("fs");
var spotify = new Spotify(keys.spotify);

var runRandom = function() {
  fs.readFile("random.txt", "utf8", function(error, data) {
    console.log(data);

    var randomData = data.split(",");

    if (randomData.length === 2) {
      doCommand(randomData[0], randomData[1]);
    } else if (randomData.length === 1) {
      doCommand(randomData[0]);
    }
  });
};

var getMovieInfo = function(movieTitle) {
  if (!movieTitle) {
    movieTitle = "Mr. Nobody";
  }

  var queryURL = "http://www.omdbapi.com/?t=" + movieTitle + "&y=&plot=short&tomatoes=true&apikey=trilogy";
  axios.get(queryURL).then(
    function(response) {
      var movieData = response.data;
      console.log("Title: " + movieData.Title);
      console.log("Year: " + movieData.Year);
      console.log("Rated: " + movieData.Rated);
      console.log("IMDB Rating: " + movieData.imdbRating);
      console.log("Country: " + movieData.Country);
      console.log("Language: " + movieData.Language);
      console.log("Plot: " + movieData.Plot);
      console.log("Actors: " + movieData.Actors);
      console.log("Rotten Tomatoes Rating: " + movieData.Ratings[1].Value);
    }
  );
};

var spotifyTheSong = function(song) {
  if (!song) {
    song = "The Sign";
  }

  spotify.search(
    {
      type: "track",
      query: song
    },
    function(err, data) {
      if (err) {
        console.log("There was an error: " + err);
        return;
      }

      var songData = data.tracks.items;

      for (var i = 0; i < songData.length; i++) {
        console.log("\n-----------------------------------\n");
        console.log(i);
        console.log("artist/band: " + songData[i].artists.map(getNames));
        console.log("song name: " + songData[i].name);
        console.log("link to preview: " + songData[i].preview_url);
        console.log("album: " + songData[i].album.name);
        console.log("\n-----------------------------------\n");
      }
    }
  );
};

// handles instances of multiple artists in Spotify Data
var getNames = function(artist) {
  return artist.name;
};

var getGigs = function(band) {
  var queryURL = "https://rest.bandsintown.com/artists/" + band + "/events?app_id=codingbootcamp";
  axios.get(queryURL).then(
    function(response) {
      var responseData = response.data;

      if (responseData.length === 0) {
        console.log("I'm sorry. I found no events for " + band);
        return;
      } 

      console.log("Here are the upcoming events I found for " + band + ":");
      for (var i = 0; i < responseData.length; i++) {
        var gig = responseData[i];
        console.log(gig.venue.name + 
          " in " + gig.venue.city + 
          ", " + (gig.venue.country || gig.venue.region) + " on " + moment(gig.datetime).format("MM/DD/YYYY"));
      }
    }
  );
};


var doCommand = function(searchType, searchParameter) {

  switch (searchType) {
    case 'concert-this':
      getGigs(searchParameter);                   
      break;                          
    case 'spotify-this-song':
      spotifyTheSong(searchParameter);
      break;
    case 'movie-this':
      getMovieInfo(searchParameter);
      break;
    case 'do-what-it-says':
      runRandom();
      break;
    default:                            
      console.log("I'm sorry, Dave; I'm afraid I can't do that.");  
  }
};

var commandInput = function(firstThing, secondThing) {
  doCommand(firstThing, secondThing);
};

commandInput(process.argv[2], process.argv.slice(3).join(" "));
