/**
 * Created by andreas on 11/7/14.
 */

angular.module('traverse', [])
  .controller('mainCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
    function Location () {
      this.address;
      this.distanceFromOrigin;
    }
    function compare(a,b) {
      if (a.distanceFromOrigin < b.distanceFromOrigin)
        return -1;
      if (a.distanceFromOrigin > b.distanceFromOrigin)
        return 1;
      return 0;
    }

    $scope.travelOptions = {
      driving: "DRIVING",
      walking: "WALKING",
      bicycling: "BICYCLING"
    };

    $scope.travelMode = $scope.travelOptions.driving;

    $scope.pointOfOrigin = new Location();
    $scope.destinations = [];

    // Add first destination
    $scope.destinations.push(new Location());

    $scope.addNewDestination = function(){
      var newDest = new Location();
      $scope.destinations.push(newDest);
    };

    $scope.removeDestination = function (index) {
      $scope.destinations = _.without($scope.destinations, $scope.destinations[index]);
    };

    $scope.getResults = function () {
      $scope.loading = true;
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

      angular.forEach(locations, function (local) {
        matrixArgs.origins.push(local.address);
        matrixArgs.destinations.push(local.address);
      });
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
        $scope.destinations.sort(function(a, b){
          return a.distanceFromOrigin-b.distanceFromOrigin;
        });
        var destinationsCopy = $scope.destinations;
        routingArgs.destination = destinationsCopy.pop().address;
        angular.forEach(destinationsCopy, function(local){
          routingArgs.waypoints.push({location: local.address});
        });
        routingService.route(routingArgs, function(d) {
          console.log(d);
        });
      });
      $timeout(function(){
        $scope.loading = false;
      }, 1000);
    };
  }]);
