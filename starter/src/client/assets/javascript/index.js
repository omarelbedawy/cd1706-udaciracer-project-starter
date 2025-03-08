// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
let store = {
	track_id: undefined,
	track_name: undefined,
	player_id: undefined,
	player_name: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	console.log("Getting form info for dropdowns!")
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
			store.track_id = target.id
			store.track_name = target.innerHTML
		}

		// Racer form field
		if (target.matches('.card.racer')) {
			handleSelectRacer(target)
			store.player_id = target.id
			store.player_name = target.innerHTML
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate()
		}

		console.log("Store updated :: ", store)
	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}

// ^ PROVIDED CODE ^ DO NOT REMOVE

  // Helper function to handle delay
  async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
  
  // Function to create the race
  async function handleCreateRace() {
    console.log("Creating race...");

    // Get player_id and track_id from store
    const player_id = store.player_id;
    const track_id = store.track_id;

    if (!player_id || !track_id) {
        console.error("Player ID or Track ID is missing!");
        return;
    }

    try {
        const race = await createRace(player_id, track_id);

        console.log("Race API Response:", race);

        // Ensure we correctly retrieve the race ID
        if (!race || (!race.id && !race.ID)) {
            console.error("Failed to create race, response missing ID:", race);
            return;
        }

        store.race_id = race.id || race.ID;  // Handle both possible cases

        console.log("Race created with ID:", store.race_id);

        // Render the starting UI
        renderAt("#race", renderRaceStartView(store.track_name));

        // Start countdown before the race begins
        await runCountdown();

        // Start the race after countdown
        await startRace(store.race_id);

        // Run the race to fetch updates
        await runRace(store.race_id);
    } catch (error) {
        console.error("Error in handleCreateRace:", error);
    }
}


  
  // Function to handle race progress
  async function runRace(raceID) {
    return new Promise((resolve) => {
        let passedTime = 0;
        const maxTime = 10000; // 10 seconds

        const raceInterval = setInterval(async () => {
            try {
                const res = await getRace(raceID);
                console.log("Race status:", res.status);

                if (res.status === "in-progress") {
                    renderAt("#leaderBoard", raceProgress(res.positions));
					console.log(res.positions)
                }

                if (res.status === "finished") {
                    console.log("Race finished! Stopping updates.");
                    clearInterval(raceInterval);
                    renderAt("#race", resultsView(res.positions));
                    resolve(res);
                }

                // Force the race to finish after 10 seconds
                passedTime += 500;
                if (passedTime >= maxTime) {
                    console.log("Forcing race to finish after timeout.");
                    clearInterval(raceInterval);
                    renderAt("#race", resultsView(res.positions));
                    resolve(res);
                }
            } catch (error) {
                console.error("Error in race interval:", error);
                clearInterval(raceInterval);
            }
        }, 500);
    });
}

  
  // Countdown before race starts
  async function runCountdown() {
	await delay(1000);
	let timer = 3;
  
	return new Promise((resolve) => {
	  const countdownInterval = setInterval(() => {
		document.getElementById("big-numbers").innerHTML = --timer;
  
		if (timer === 0) {
		  clearInterval(countdownInterval);
		  resolve();
		}
	  }, 1000);
	});
  }
  
  // Select a racer and highlight it
  function handleSelectRacer(target) {
	console.log("Selected a racer", target.id);
  
	const selected = document.querySelector("#racers .selected");
	if (selected) {
	  selected.classList.remove("selected");
	}
  
	target.classList.add("selected");
  }
  
  // Select a track and highlight it
  function handleSelectTrack(target) {
	console.log("Selected track", target.id);
  
	const selected = document.querySelector("#tracks .selected");
	if (selected) {
	  selected.classList.remove("selected");
	}
  
	target.classList.add("selected");
  }
  
  // Handle acceleration click
  function handleAccelerate() {
	console.log("Accelerate button clicked");
  
	const { race_id } = store;
	accelerate(race_id);
  }
  
// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer
	// OPTIONAL: There is more data given about the race cars than we use in the game, if you want to factor in top speed, acceleration, 
	// and handling to the various vehicles, it is already provided by the API!
	return `<h4 class="card racer" id="${id}">${driver_name}</h3>`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `<h4 id="${id}" class="card track">${name}</h4>`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track) {
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	let userPlayer = positions.find(e => e.id === parseInt(store.player_id))
	userPlayer.driver_name += " (you)"
	let count = 1
  
	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			<h3>Race Results</h3>
			<p>The race is done! Here are the final results:</p>
			${results.join('')}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	let userPlayer = positions.find(e => e.id === parseInt(store.player_id))
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<table>
			${results.join('')}
		</table>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


  // ^ Provided code ^ do not remove
  
  // API Calls (fetching and posting data)
  
  const SERVER = "http://localhost:3001";
  
  function defaultFetchOpts() {
	return {
	  mode: "cors",
	  headers: {
		"Content-Type": "application/json",
		"Access-Control-Allow-Origin": SERVER,
	  },
	};
  }
  
  async function getTracks() {
	return fetch(`http://localhost:3001/api/tracks`, { method: "GET", ...defaultFetchOpts() })
	  .then((res) => res.json())
	  .catch((err) => console.error("Error fetching tracks:", err));
  }
  
  async function getRacers() {
	return fetch(`http://localhost:3001/api/cars`, { method: "GET", ...defaultFetchOpts() })
	  .then((res) => res.json())
	  .catch((err) => console.error("Error fetching racers:", err));
  }
  
  function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }
	
	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with createRace request::", err))
}
  
  
  async function getRace(id) {
	return fetch(`http://localhost:3001/api/races/${id}`, { method: "GET", ...defaultFetchOpts() })
	  .then((res) => res.json())
	  .catch((err) => console.error("Error fetching race data:", err));
  }
  
  function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with getRace request::", err))
}
  
  async function accelerate(id) {
	return fetch(`http://localhost:3001/api/races/${id}/accelerate`, { method: "POST", ...defaultFetchOpts() }).catch(
	  (err) => console.error("Error accelerating:", err)
	);
  }
  