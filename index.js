const express = require('express');
const mustacheExpress = require('mustache-express');
const Swift = require('./services/swift');
const util = require('util');

const app = express();
const PORT = process.env.PORT || 3000;

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

let depotLat = -37.816664;
let depotLong = 144.963848;

//distance calculation sourced from: https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}
//end outsourced code

//calculate total distance travelled by drone to get back to depot
function totalDroneDistance(drone) {
    let distanceToDestination = 0,
        distanceToDepot = getDistanceFromLatLonInKm(drone.location.latitude, drone.location.longitude, depotLat, depotLong);
    if (drone.packages.length > 0) {
        distanceToDestination = getDistanceFromLatLonInKm(drone.location.latitude, drone.location.longitude, drone.packages[0].destination.latitude, drone.packages[0].destination.longitude);
        distanceToDepot = getDistanceFromLatLonInKm(drone.packages[0].destination.latitude, drone.packages[0].destination.longitude, depotLat, depotLong);
    }
    let totalDistance = distanceToDestination + distanceToDepot;
    return totalDistance;
}

//sort function
function sort(arr, type) {
    let sortedArray = [];
    for (let i = 0; i < arr.length; i++) {
        if (sortedArray.length === 0) {
            sortedArray.push(arr[i]);
        } else {
            let length = sortedArray.length,
                counter = 0;
            for (let j = 0; j < length; j++) {
                if (arr[i][type] < sortedArray[j][type]) {
                    sortedArray.splice(j, 0, arr[i]);
                    counter++;
                    j = length;
                }
            }
            if (counter === 0) {
                sortedArray.push(arr[i]);
            }
        }
    }

    return sortedArray;
}

//routing
app.get('/', (req, res) => {
    let drones = [],
        packages = [];
    Swift
        .getDrones()
        .then(data => {
            drones = data.data;
            return Swift.getPackages()
        })
        .then(data => {
            packages = data.data;
            for (let i = 0; i < drones.length; i++) {
                drones[i].distance = totalDroneDistance(drones[i]);
            };

            let sortedDrones = sort(drones, "distance");
            let sortedPackages = sort(packages, "deadline");

            let output = {
                    assignments: [],
                    unassignedPackageIds: []
                },
                counter = 0;
            while (counter < sortedPackages.length && counter < sortedDrones.length) {
                output.assignments.push({ droneId: sortedDrones[counter].droneId, packageId: sortedPackages[counter].packageId });
                counter++;
            }
            
            if (output.assignments.length < sortedPackages.length) {
                for (let i=output.assignments.length; i<sortedPackages.length; i++) {
                    output.unassignedPackageIds.push(sortedPackages[i].packageId);
                }
            }

            res.render('index', output);
        })
})

app.listen(PORT, () => console.log('Server listening on port', PORT));