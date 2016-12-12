'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])
    /**
     * - game
     *    - currentPlayer
     *    - currentCard
     *    - players (lista)
     *      - username
     *      - hand (lista)
     */
.controller('View1Ctrl', ['$scope', '$firebaseObject', '$firebaseArray', '$firebaseAuth',
  function($scope, $firebaseObject, $firebaseArray, $firebaseAuth) {
    function init() {
      // download data
      fetch('dados/dados.json')
        .then(response => response.json())
        .then(json => $scope.$apply(onReady.bind(this, json)));
    }

    function onReady(dados) {
      firebase.database().ref().child('games');
      $scope.card = dados[5];

      
      var ref = firebase.database().ref().child("games");
      // create a synchronized array
      // click on `index.html` above to see it used in the DOM!
      $scope.messages = $firebaseArray(ref);
    }

    $scope.createNewGame = function() {
      // $location.url('');
    }
    
    init();
  }]);