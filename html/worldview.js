// this file declares what is effectively a class that describes the Earth
	// it takes a lat,lon,alt to start that is assumed to be the phone
	// creating an object that can be used to localize further lat,lon,alt coordinates in x,y,z offsets from said phone

import * as THREE from 'three';


export function WorldView(lat, lon, alt) {
	// we'll use a standard radius here (in meters) but there should be a way to calculate a more accurate radius for the position of the phone given a lat/lon
		// something along the lines of https://gis.stackexchange.com/questions/242188/calculating-the-earth-radius-at-latitude
		// probably won't matter much while the balloon is close-ish to you and/or you aren't in the arctic circle
	const earthRadius = 6378137;

	// this is the forward direction of the scene (we'll use it for our orientation to start)
	const localForward = new THREE.Vector3(0, 0, -1);
	// rotate the point so that it aligns with the plane's up
	const localUp = new THREE.Vector3(0, 1, 0);

	// the lat,lon of the north pole localized to the phone's up orientaton... 
		// it migrates a bit so not sure if it's perfectly accurate...
		// we'll use this coordinate to put the pole into our points for when they get rotated
	let [northPole, northDir] = calcPosFromLatLonAltRad(
		84.99962969478257, 
		162.86642064241886,
		0, 
		earthRadius
	);
	this.northPole = northPole;


	let [origin, up] = calcPosFromLatLonAltRad(lat, lon, alt, earthRadius);
	this.origin = origin;
	this.rotationAxis = up.clone().cross(localUp);
	this.rotationAngle = up.angleTo(localUp);

	// localizes the point (in memory!) and returns it
	this.localizePoint = function(point){
		// localize magnitude/direction
		point.sub(this.origin);
		// rotate it into the plane of the worldview
		point.applyAxisAngle(this.rotationAxis, this.rotationAngle);

		return point;
	}
	this.localizePoint(this.northPole);
	// we only care about this in the same plane as us so discard its elevation
	this.northPole.setY(0);


	// calculate dir from phone to northpole after up rotation
	northDir = northPole.clone().normalize();
	// calculate offset of north pole
		// we'll use this to first align the north pole to the forward direction in the scene
		// then later we'll use our compass heading to align the scene with the world
	const northPoleOffset = localForward.angleTo(northDir);
	// rotate north pole around up dir to align to forward of scene 
		// we probably don't really need this anymore
	this.northPole.applyAxisAngle(localUp, -northPoleOffset);



	// function fully orients the given coords to the plane and such that forward of the scene is the north pole
		// (negative z axis because that's a camera's default)
	this.localizeLatLonAlt = function(lat, lon, alt){
		// calculate point in 3d
		let [point, up] = calcPosFromLatLonAltRad(lat, lon, alt, earthRadius)

		// localizes the point to the origin
		this.localizePoint(point);
		
		// rotate the point around up dir to align to forward of scene
		point.applyAxisAngle(localUp, -northPoleOffset);

		return point;
	}
}

// function to convert lat/lon to coordinates taken from
// https://stackoverflow.com/questions/28365948/javascript-latitude-longitude-to-xyz-position-on-earth-threejs/28367325#28367325
function calcPosFromLatLonAltRad(lat, lon, alt, radius){
	var phi   = (90-lat)*(Math.PI/180);
	var theta = (lon+180)*(Math.PI/180);

	let x = -((radius) * Math.sin(phi)*Math.cos(theta));
	let z = ((radius) * Math.sin(phi)*Math.sin(theta));
	let y = ((radius) * Math.cos(phi));
    
	let cartPos = new THREE.Vector3(x, y, z);
	let cartUp = (cartPos.clone()).normalize();
	return [cartPos.add(cartUp.clone().multiplyScalar(alt)), cartUp];
}



