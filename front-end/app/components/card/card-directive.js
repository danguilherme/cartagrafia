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
      selectProperty: '='
    },
    link: function($scope) {
      $scope.selectedProperty = null;
      
      $scope.propertyClick = function(property) {
        $scope.selectedProperty = property;
      }
    },
    controller: function($scope) {
      $scope.countrySelect = function() {
        if($scope.selectProperty)
          $scope.selectProperty($scope.selectedProperty, $scope.country[$scope.selectedProperty], $scope.selectedCountryName);
      }
    }
  }
}]);
