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
      selectedProperty: '=',
      selectProperty: '='
    },
    link: function($scope) {
      $scope.propertyClick = function(property) {
        $scope.selectedProperty = property;

        $scope.country.selectedProperty = property;
        $scope.country.selectedPropertyValue = $scope.country[$scope.selectedProperty];
      }
    },
    controller: function($scope) {
      $scope.countrySelect = function() {
        $scope.country.selectedCountryName = $scope.selectedCountryName;
      }
    }
  }
}]);
