// this file defines the ways to collect the various data needed for the locatesonde page
// it expects an element named "datacollection" that it will append various text boxes into to display said data 
	// (for troubleshooting and convenience but also because that is where it will store said data)

// to append the dom elements and initialize the data tracking calls do
	// beginCollectingData()
// followed by any desired polling calls (exposed as a separate call in order to pass the callsign)
	// pollData(callsign) 
		// this will return a promise that resolves any new points received for that callsign from the api
		// it makes no effort to setup any kind of recurring calls
		// the caller may want to make this method called repeatedly with some sort of delay

// it also defines the object "DataCollection" which will act as a shortcut for referencing said data
	// the structure of the object looks like
		// {
		// 	heading: { // a dom element with the following extra attributes
		// 		radians: number
		// 	},
		// 	location: { // a dom element with the following extra attributes
		// 		latitude: number,
		// 		longitude: number
		// 	},
		// 	altitude: { // a dom element with the following extra attributes
		// 		altitude: number
		// 	},
		// 	data: { // a dom element with the following extra attributes
		// 		trackingdata: {
		// 			callsign: { // potentially could be more than one callsign (the id from the url)
		// 				key: { // key and data will be as it was received from the api (key is probably a timestamp)
		// 					lat: number,
		// 					lon: number,
		// 					alt: number
		// 				}
		// 			}
		// 		}
		// 	}
		// }


// // these methods are what populate the textboxes on the page
	// each method here is asynchronous and updates the textbox inputs based on their ids
	// they also may fire events saying they have done so

// configure the dom elements and declare a variable that contains them for easy access
	// this declares the configuration for the dom input elements and any extra attributes they need
	// the configuration objects will be replaced with the actual dom elements shortly
let DataCollection = {
	heading: {
		placeholder: "GeoMagnetic Heading"
	},
	location: {
		placeholder: "Lat, Lon"
	},
	altitude: {
		placeholder: "Altitude in Meters"
	},
	data: {
		placeholder: "Received Data"
	}
}
// replace the configuration with the actual elements
let textBoxKeys = Object.keys(DataCollection);
Object.keys(DataCollection).forEach((k) => {
	let dataInput = document.createElement("input");
	dataInput.setAttribute("id", "datacollection-" + k);
	dataInput.setAttribute("type", "text");
	dataInput.setAttribute("disabled", "true");
	Object.keys(DataCollection[k]).forEach((attr) => {
		dataInput.setAttribute(attr, DataCollection[k][attr]);
	})
	DataCollection[k] = dataInput;
});





// this all is used to determine the compass heading
	// taken from stackoverflow here: https://stackoverflow.com/questions/61336948/calculating-the-cardinal-direction-of-a-smartphone-with-js
const handleOrientation = (event) => {
	let heading;

    if(event.webkitCompassHeading) {
        // some devices don't understand "alpha" (especially IOS devices)
        heading = event.webkitCompassHeading;
    }
    else{
        heading = compassHeading(event.alpha, event.beta, event.gamma);
    }

    DataCollection.heading.value = `${Math.round(heading*180/Math.PI)}°`;
    DataCollection.heading.radians = heading
};
const compassHeading = (alpha, beta, gamma) => {

    // Convert degrees to radians
    const alphaRad = alpha * (Math.PI / 180);
    const betaRad = beta * (Math.PI / 180);
    const gammaRad = gamma * (Math.PI / 180);

    // Calculate equation components
    const cA = Math.cos(alphaRad);
    const sA = Math.sin(alphaRad);
    const cB = Math.cos(betaRad);
    const sB = Math.sin(betaRad);
    const cG = Math.cos(gammaRad);
    const sG = Math.sin(gammaRad);

    // Calculate A, B, C rotation components
    const rA = - cA * sG - sA * sB * cG;
    const rB = - sA * sG + cA * sB * cG;
    const rC = - cB * cG;

    // Calculate compass heading
    let compassHeading = Math.atan(rA / rB);

    // Convert from half unit circle to whole unit circle
    if(rB < 0) {
        compassHeading += Math.PI;
    }else if(rA < 0) {
        compassHeading += 2 * Math.PI;
    }

    // Convert radians to degrees
    // compassHeading *= 180 / Math.PI;
	// console.log(`heading in degrees ${compassHeading*180/Math.PI}`);

    return compassHeading;
};





// function to retrieve the data for the given callsign
	// returns a promise that returns an array of the points that are new since the last call
	// updates the count of received points and a timestamp (if there were new points)
DataCollection.pollData = function(callsign) {
	DataCollection.data.trackingdata ||= {};

	return fetch("/api?duration=6h&payload_callsign=" + callsign, {redirect: 'follow'}).then(response => {
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return response.json();
	}).then(data => {
		// this sometimes seems to look different than expected seemingly based on the purpose/type of transceiver
		let dataForCallsign = data[callsign];
		let dataBoxCallsign = DataCollection.data.trackingdata[callsign] ||= {};

		let newKeys = Object.keys(dataForCallsign).filter(k => !Object.keys(dataBoxCallsign).includes(k));
		newKeys.forEach((key) => {
			dataBoxCallsign[key] = dataForCallsign[key];
		});

		// dataBox can grow larger than the received data as the duration moves on
			// I'm not sure if this is deceiving as refreshing the page may cause points to fall away?
			// perhaps some way of configuring the duration should be added for the user?
			// we also only show 
		if (newKeys.length > 0){
			let now = new Date();
			DataCollection.data.value = `${Object.keys(dataBoxCallsign).length} points last received ${now.getHours()}:${now.getMinutes()}`;
		}

		return newKeys.map((k) => dataBoxCallsign[k]);
	});
}




// begin data collection
DataCollection.beginCollectingData = function() {
	// add the data collection elements to the dom	
	let container = document.getElementById("datacollection");
	textBoxKeys.forEach((k) => {
		container.append(DataCollection[k]);
	});

	////////////// initialize data collectors
	
	// we use device orientation absolute event to get a north direction but this is magnetic north
		// see https://developer.chrome.com/blog/device-orientation-changes for details
	window.addEventListener('deviceorientationabsolute', handleOrientation, false);

	// retrieve info about the phone's position
	navigator.geolocation.getCurrentPosition(function(position){
	    DataCollection.location.value = `${position.coords.latitude}, ${position.coords.longitude}`;
	    DataCollection.location.latitude = position.coords.latitude;
	    DataCollection.location.longitude = position.coords.longitude;

	    DataCollection.altitude.value = `${Math.round(position.coords.altitude)} Meters`;
	    DataCollection.altitude.altitude = position.coords.altitude;
	});

};

export { DataCollection }