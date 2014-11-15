/**
 * Created by andreas on 11/7/14.
 */

angular.module('traverse', [])
  .controller('mainCtrl', ['$scope', function ($scope) {
    console.log(_);
    function Destination () {
      this.destination;
    }
    $scope.destinations = [
      {destination: undefined}
    ];

    $scope.addNewDestination = function(){
      $scope.destinations.push(new Destination());
    };

    $scope.removeDestination = function (index) {
      $scope.destinations = _.without($scope.destinations, $scope.destinations[index]);
    }
  }]);
