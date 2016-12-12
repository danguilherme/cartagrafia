'use strict';

angular.module('myApp.card.card-directive', [])

.directive('card', [function() {
  return {
    restrict: 'E',
    templateUrl: '/components/card/card.html',
    replace: true,
    scope: {
      country: '=',
      countryNames: '=',
      readOnly: '=',
      selectProperty: '@'
    },
    link: function($scope) {
      $scope.selectedProperty = null;
      $scope.propertyClick = function(property) {
        $scope.selectedProperty = property;
        console.log(property);
      }
    }
  }
}]);
