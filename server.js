var git = require("gift"),
	async = require("async"),
	io = require('socket.io').listen(9002);

var repo = git( "D:/iZotope/.git" );

var NUM_HISTOGRAM_BINS = 24; // one for each hour...

var NUM_COMMITS_PER_FETCH = 500; // We have to set this carefully, because fetching too much overloads sdout\

var NUM_MAX_FETCHES = 20;

// Global collection of committer info
var committerInfo = {};
/*
	var committer = {
		name: author name,
		email: email,
		numCommits: total commits,
		histogram: histogram of number of commits in hourly bins,
	}
*/

var stopFetching = false;
var iBatch = 0;

var getCommitInfos = function( branchName, numCommits, startCommit, callback ) {
	repo.commits( "master", numCommits, startCommit, function( err, commits ) {
		if( typeof(err) != "undefined" ) {
			//console.log(err);
			stopFetching = true;
		}
		
		// Loop through all of the commits in this repository
		for( var iCommit in commits ) {
			var thisCommit = commits[iCommit];
			
			var author = thisCommit.author,
				time = thisCommit.committed_date;
			
			// We record user string identifiers as commitName:email
			var userString = thisCommit.author.name + ":" + thisCommit.author.email;

			var userEntry = committerInfo[userString];
			
			// If we've never seen this user before, make a new info entry for them
			if( typeof(userEntry) == "undefined" || userEntry == null ) {
				var dummyHistogram = [];
				for( var iHist=0; iHist<NUM_HISTOGRAM_BINS; ++iHist ) {
					dummyHistogram[iHist] = 0;
				}
			
				userEntry = {
					name: author.name,
					email: author.email,
					numCommits: 0,
					histogram: dummyHistogram,
					commitTimes: []
				}
			}
			
			// Update this user's commit history
			userEntry.histogram[time.getHours()]++;
			userEntry.commitTimes.push( time );
			userEntry.numCommits++;
			
			// Push this user back into the map
			committerInfo[userString] = userEntry;
		} // end for each commit	
		
		callback();
	});
}

function onError( error ) {
	console.log( error );
}

exports.init = function() {

	io.sockets.on('connection', function (socket) {
		socket.on('request repository info', function (data) {
			console.log( "User requested repository info" );
			socket.emit("repository info", {committerInfo: committerInfo} );
		});
	});

	async.whilst(
		function () { return iBatch < NUM_MAX_FETCHES; },
		function( onError ) {
			console.log( "Did fetch " + iBatch );
			getCommitInfos( "master", NUM_COMMITS_PER_FETCH, iBatch * NUM_COMMITS_PER_FETCH, function() {			
				iBatch++;
				onError();
			});
		},
		function (err) {
			if( typeof(err) == "undefined" ) {
				console.log("Finished!");
				console.log( committerInfo["unknown:ZECTBynmo@.(none)"] );
			} else {
				console.log( err );
			}
		}
	);
} // end init()


exports.getCommitInfos = function() {
	return committerInfo;
} // end getCommitInfos()