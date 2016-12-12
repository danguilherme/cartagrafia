'use strict';

angular.module('myApp.card.card-service', [])

.service('cardService', ['$firebaseObject', '$firebaseArray', '$firebaseAuth', function ($firebaseObject, $firebaseArray, $firebaseAuth) {
  return function (scope, elm, attrs) {
    return function() {
      
    }
  };
}])
.factory('cardFactory', ['$firebaseObject', '$firebaseArray', '$firebaseAuth', function ($firebaseObject, $firebaseArray, $firebaseAuth) {
  return function () {
    return {
      test: 'test'
    }
  };
}]);