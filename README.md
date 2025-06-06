# locatesonde
This is a project to take something being tracked by https://amateur.sondehub.org/ and use augmented reality (ar) to help visualize that tracking data.

# Getting Started
The project is made of static pages but currently uses an nginx server to get around some CORS issues with the amateur.sondehub api.  Additionally, it uses ngrok to expose the running nginx for development purposes as it really is meant to be viewed from a phone.
Currently, the project is really only able to be used in chrome.

You will need to copy the ngrok.yml.example file as just ngrok.yml and then to replace the `<authtoken>` in the ngrok.env file with a valid ngrok authtoken.
You can also create a custom domain through the ngrok [dashboard](https://dashboard.ngrok.com/domains) and assign it using that file.  It may be worthwhile to do so as otherwise the ngrok url will be randomized each time the container is restarted.

To start both the nginx and ngrok instances run `docker-compose up` in the root of the project.  
Note that the ngrok url will change each time that the container is stopped/started so it may be worthwhile to start nginx and ngrok separately (by specifying the name of the service after e.g. `docker-compose up nginx`) if doing work on the nginx config itself.

Once ngrok is running you can visit [localhost:4040](http://localhost:4040) in order to view the running ngrok gateway and see the public url that was exposed.
Additionally, the nginx listening port is exposed locally as 8080 though it is likely unneeded.

# Testing
Currently there is no test library in use.  However, in the /html folder is a file named like `test-data.json` and this file is redirected to by the nginx when the Sondehub Tracking Number used is `TESTING` instead of proxying the normal api request.  The data in the test-data file was created by taking a real response from a real balloon and adjusting the lat/lon/alt values so that it was as if they started near a given location/altitude.  Additional test data can be generated using the page `generate-test-data.html` and entering in a currently valid (6h) sondehub id as well as details for the 'launch' site.  The outputted data will then be adjusted so that the first lat/lon/alt lines up with the provided 'launch' site location.

# Developing
Due to the fact this is done on a phone development is somewhat difficult.

In order to develop effectively it is recommended to turn on [developer options](https://www.samsung.com/uk/support/mobile-devices/how-do-i-turn-on-the-developer-options-menu-on-my-samsung-galaxy-device/) for your phone.  Once developer options have been turned on it should be possible to interact with the running phone browser session on your development machine by going here [chrome://inspect/#devices](chrome://inspect/#devices) in chrome.  There are a couple of ways to discover the phone from the development machine but the easiest and most consistent is probably to plug in over usb (it is also the best in my opinion as the phone battery likely will be drained fairly quickly when using the camera for AR).
