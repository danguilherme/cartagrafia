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
.controller('View1Ctrl', ['$scope', '$firebaseObject', '$firebaseArray', '$firebaseAuth', 'cardFactory',
  function($scope, $firebaseObject, $firebaseArray, $firebaseAuth, cardFactory) {
    $scope.username = null;

    function init() {
      // download data
      fetch('dados/dados.json')
        .then(response => response.json())
        .then(json => $scope.$apply(onReady.bind(this, json)));
    }

    function onReady(dados) {
      firebase.database().ref().child('games');
      $scope.card = dados[5];

      var ref = games();
      // create a synchronized array
      // click on `index.html` above to see it used in the DOM!
      $scope.games = $firebaseArray(ref);
    }

    function getGameByCreator(creator) {
      return $scope.games.filter(x => x.creator === creator)[0];
    }

    // Firebase
    function addPlayerToGame(key, playerName) {
      var ref = gamePlayers(key);
      var players = $firebaseArray(ref);
      players.$add({username: playerName});
    }

    $scope.startNewGame = function() {
      $scope.games.$add({
        creator: $scope.username,
        currentPlayer: $scope.username
      })
      .then(game => addPlayerToGame(game.getKey(), $scope.username))
    }

    $scope.selectGame = function(gameKey) {
      addPlayerToGame(gameKey, $scope.username)
    }

    /** DATABASE */
    function games() {
      return firebase.database().ref().child("games");
    }

    function gamePlayers(gameKey) {
      return games().child(gameKey).child('players');
    }

    function playerCards(gameKey, playerKey) {
      return gamePlayers(gameKey).child(playerKey).child('cards');
    }
    
    init();
  }]);