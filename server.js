var git = require("gift"),
	async = require("async"),
	io = require('socket.io').listen(9002);

var repoPath = "D:/Projects/node-core-audio/.git";
var repo = git( repoPath );
console.log( "READING REPO " + repoPath );

var NUM_HISTOGRAM_BINS = 24; // one for each hour...

var NUM_COMMITS_PER_FETCH = 500; // We have to set this carefully, because fetching too much overloads sdout\

var NUM_MAX_FETCHES = 200;

// Global collection of committer info
var committerInfo = {};
/*
	var committer = {
		name: author name,
		email: email,
		numCommits: total commits
	}
*/

var stopFetching = false;
var iBatch = 0;

var globalUser = {
	name: "all",
	email: "commits",
	numCommits: 0,
	commitTimes: []
};

var getCommitInfos = function( branchName, numCommits, startCommit, callback ) {
	
	repo.commits( "master", numCommits, startCommit, function( err, commits ) {
		if( err != null && typeof(err) != "undefined" ) {
			console.log(err);
			stopFetching = true;
		}

		var count = 0;
		
		// Loop through all of the commits in this repository
		for( var iCommit in commits ) {
			count++;

			var thisCommit = commits[iCommit];
			
			var author = thisCommit.author,
				time = thisCommit.committed_date;
			
			// We record user string identifiers as commitName:email
			var userString = thisCommit.author.name + ":" + thisCommit.author.email;

			var userEntry = committerInfo[userString];
			
			// If we've never seen this user before, make a new info entry for them
			if( typeof(userEntry) == "undefined" || userEntry == null ) {
			
				userEntry = {
					name: author.name,
					email: author.email,
					numCommits: 0,
					commitTimes: []
				}
			}
			
			// Update this user's commit history
			userEntry.commitTimes.push( time );
			globalUser.commitTimes.push( time );
			userEntry.numCommits++;
			
			// Push this user back into the map
			committerInfo[userString] = userEntry;
		} // end for each commit	

		if( count > 0 ) {
			count = 0;
		} else {
			stopFetching = true;
			committerInfo["all:commits"] = globalUser;
		}

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
		function () { 
			if( !stopFetching ) {
				return iBatch < NUM_MAX_FETCHES; 
			} else {
				console.log( stopFetching );
				return false;
			}
		},
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
			} else {
				console.log( err );
			}
		}
	);
} // end init()


exports.getCommitInfos = function() {
	return committerInfo;
} // end getCommitInfos()