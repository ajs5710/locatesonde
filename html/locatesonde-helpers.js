// // declare heading maybe should toss these things into an object to pollute a bit less
// 	// an event handler will keep this up to date as the heading to magnetic north in rads
// let heading;

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

    let headingBox = document.getElementById('heading')
    headingBox.value = `${Math.round(heading*180/Math.PI)}°`;
    headingBox.data = heading
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
// we use device orientation absolute event to get a north direction but this is magnetic north
	// see https://developer.chrome.com/blog/device-orientation-changes for details
window.addEventListener('deviceorientationabsolute', handleOrientation, false);



