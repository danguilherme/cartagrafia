'use strict';

angular.module('myApp.newGame', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'views/newGame/newGame.html',
      controller: 'NewGameCtrl'
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
  .controller('NewGameCtrl', ['$scope', '$location', '$firebaseObject', '$firebaseArray', '$firebaseAuth', 'cardFactory', 'gameService', 'gameFactory',
    function ($scope, $location, $firebaseObject, $firebaseArray, $firebaseAuth, cardFactory, gameService, gameFactory) {
      $scope.username = null;
      $scope.selectedGame = null;

      function init() {
        // download data
        fetch('dados/dados.json')
          .then(response => response.json())
          .then(json => $scope.$apply(onReady.bind(this, json)));
      }

      function onReady(loadedCountryData) {
        firebase.database().ref().child('games');
        var countryData = shuffleArray(loadedCountryData);
        gameService.setCountryData(countryData);
        $scope.card = countryData[5];

        var ref = gameService.database.games();
        // create a synchronized array
        // click on `index.html` above to see it used in the DOM!
        $scope.games = $firebaseArray(ref);
      }

      function getGameByKey(key) {
        return $scope.games.filter(x => x.$id === key)[0];
      }

      function getGameByCreator(creator) {
        return $scope.games.filter(x => x.creator === creator)[0];
      }

      function drawCards() {
        return gameService.getCountryData().splice(0, 5);
      }

      /**
       * Randomize array element order in-place.
       * Using Durstenfeld shuffle algorithm.
       */
      function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
        }
        return array;
      }

      // Firebase
      function addPlayerToGame(gameKey, playerName) {
        var playersRef = gameService.database.gamePlayers(gameKey);
        var players = $firebaseArray(playersRef);
        players.$add({
          username: playerName
        }).then(firebasePlayer => {
          var playerKey = firebasePlayer.getKey();
          var cardsRef = gameService.database.playerCards(gameKey, playerKey);

          var cards = drawCards();
          cards.forEach(x => {
            let card = cardsRef.push();
            card.set(x);
          });
          
          firebasePlayer.child('cardsCount').transaction(function (current_value) {
            return 5;
          });
        })
      }

      $scope.startNewGame = function () {
        var username = $scope.username;

        if(!username) {
          alert("Escolha um nickname antes de criar um jogo");
          return;
        }

        var game = gameFactory(null, username);

        gameService.setUsername(username);

        $scope.games.$add(game.toFirebase())
          .then(firebaseGame => {
            var key = firebaseGame.getKey();
            game.key = key;

            addPlayerToGame(key, username);
            startGame(key);
          });
      }

      $scope.selectGame = function (gameKey) {
        var username = $scope.username;

        if(!username) {
          alert("Escolha um nickname antes de entrar em um jogo");
          return;
        }

        gameService.setUsername(username);

        addPlayerToGame(gameKey, username);
        startGame(gameKey);
      }

      $scope.playersCount = function (game) {
        return Object.keys(game.players || {}).length;
      }

      function startGame(gameKey) {
        gameService.selectGame(gameKey);
        $location.url('/game/' + gameKey);
      }

      init();
    }
  ]);