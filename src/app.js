/**
 * Created by andreas on 11/7/14.
 */

angular.module('traverse', ['ngSanitize', 'geolocation'])
  .controller('mainCtrl', ['$scope', '$timeout', 'geolocation', '$q', function ($scope, $timeout, geolocation, $q) {

    // Location class
    function Location () {
      this.address;
      this.distanceFromOrigin;
    }

    // Compare fn to order array of objects by property with num value
    function compare(a,b) {
      if (a.distanceFromOrigin < b.distanceFromOrigin)
        return -1;
      if (a.distanceFromOrigin > b.distanceFromOrigin)
        return 1;
      return 0;
    }

    // checks if navigator object available and gets current lat/long
    if (navigator && navigator.geolocation) {
      geolocation.getLocation().then(function(data){
        $scope.currentLocation = data.coords;
      });
    } else {
      console.log("Geolocation is not supported by this browser.");
    }

    // returns promise with origin address
    function getOriginAddress (latlng) {
      var defered =  $q.defer(),
        coder = new google.maps.Geocoder();
      coder.geocode({location: latlng}, function (d) {
        defered.resolve(d)
      });
      return defered.promise;
    }

    // function called when user asks for current location
    $scope.setCurrentLocationAsOrigin = function (currentLocation) {
      var latlng = new google.maps.LatLng(currentLocation.latitude, currentLocation.longitude);
      $scope.localLoading = true;
      $scope.hideLink = true;
      $timeout(function(){
        getOriginAddress(latlng).then(function(d){
          $scope.pointOfOrigin.address = d[0].formatted_address;
          $scope.localLoading = false;
        })}, 1000);
    };

    // travel mode options
    $scope.travelOptions = {
      "i am driving": "DRIVING",
      "i am walking": "WALKING",
      "i am bicycling": "BICYCLING"
    };
    // Set default travel mode
    $scope.travelMode = $scope.travelOptions["i am driving"];

    // instantiates point of origin
    $scope.pointOfOrigin = new Location();

    // instantiates destinations []
    $scope.destinations = [];

    // Add first destination
    $scope.destinations.push(new Location());

    // attached to new dest button
    $scope.addNewDestination = function(){
      var newDest = new Location();
      $scope.destinations.push(newDest);
    };

    // attached to destinations - for removal
    $scope.removeDestination = function (index) {
      $scope.destinations = _.without($scope.destinations, $scope.destinations[index]);
    };

    // called when optimize button is called
    $scope.getResults = function () {
      var locations = [$scope.pointOfOrigin].concat($scope.destinations),
        matrixService = new google.maps.DistanceMatrixService(),
        routingService = new google.maps.DirectionsService(),
        matrixArgs = {
          destinations: [],
          origins: [],
          travelMode: $scope.travelMode
        },
        routingArgs = {
          destination: undefined,
          waypoints: [],
          travelMode: $scope.travelMode,
          origin: $scope.pointOfOrigin.address,
          optimizeWaypoints: true
        };
      // set loading true
      $scope.loading = true;

      // iterate through locations to create geoMatrix args
      angular.forEach(locations, function (local) {
        matrixArgs.origins.push(local.address);
        matrixArgs.destinations.push(local.address);
      });
      // get distance matrix and attach to scope
      matrixService.getDistanceMatrix(matrixArgs, function(d){
        $scope.results = d;
        angular.forEach($scope.results.originAddresses, function(newAddress, key){
          if (key === 0) {
            $scope.pointOfOrigin.address = newAddress;
          } else {
            $scope.destinations[key - 1].address = newAddress;
            $scope.destinations[key - 1].distanceFromOrigin = d.rows[0].elements[key].distance.text.replace(/\D/g, '');
          }
        });
        // sort destinations by distance to origin so they can be reflected in list
        $scope.destinations.sort(function(a, b){
          return a.distanceFromOrigin-b.distanceFromOrigin;
        });
        // Set final destination in routing args
        routingArgs.destination = $scope.destinations[$scope.destinations.length - 1].address;
        // define route waypoints (all other destination but final)
        angular.forEach($scope.destinations, function(local, key){
          if (key !== 0 || key !== $scope.destinations.length - 1) {
            routingArgs.waypoints.push({location: local.address});
          }
        });
        // Get route instructions
        routingService.route(routingArgs, function(d) {
          $scope.route = d;
        });
      });
      // Timeout for loading effect
      $timeout(function(){
        $scope.loading = false;
      }, 1000);
    };
  }]);
