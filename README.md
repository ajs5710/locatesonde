# locatesonde
This is a project to take something being tracked by https://amateur.sondehub.org/ and use augmented reality (ar) to help visualize that tracking data.

# Getting Started
The project is made of static pages but currently uses an nginx server to get around some CORS issues with the amateur.sondehub api.  Additionally, it uses ngrok to expose the running nginx for development purposes as it really is meant to be viewed from a phone.

You will need to replace the `<authtoken>` in the ngrok.env file with a valid ngrok authtoken.

To start both the nginx and ngrok instances run `docker-compose up` in the root of the project.  
Note that the ngrok url will change each time that the container is stopped/started so it may be worthwhile to start nginx and ngrok separately (by specifying the name of the service after e.g. `docker-compose up nginx`) if doing work on the nginx config itself.

Once ngrok is running you can visit [localhost:4040](http://localhost:4040) in order to view the running ngrok gateway and see the public url that was exposed.
Additionally, the nginx listening port is exposed locally as 8080 though it is likely unneeded.

# Testing
Currently there is no test library in use.  However, in the /html folder is a file named like `test-data.json` and this file is redirected to by the nginx when the Sondehub Tracking Number used is `TESTING` instead of proxying the normal api request.  The data in the test-data file was created by taking a real response from a real balloon and adjusting the lat/lon/alt values so that it was as if they started near a given location/altitude.  Additional test data can be generated using the page `generate-test-data.html` and entering in a currently valid (6h) sondehub id as well as details for the 'launch' site.

