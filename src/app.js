/**
 * Created by andreas on 11/7/14.
 */

angular.module('traverse', [])
  .controller('mainCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
    function Location () {
      this.address;
    }
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
        mapService = new google.maps.DistanceMatrixService(),
        matrixArgs = {
          destinations: [],
          origins: [],
          travelMode: 'DRIVING'
        };

      angular.forEach(locations, function (local) {
        matrixArgs.origins.push(local.address);
        matrixArgs.destinations.push(local.address);
      });
      mapService.getDistanceMatrix(matrixArgs, function(d){
        $scope.results = d;
        window.results = d;
      });
      $timeout(function(){
        $scope.loading = false;
      }, 1000);
    };
  }]);
