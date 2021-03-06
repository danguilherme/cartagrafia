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
        var countryData = shuffleArray(fixCountryData(loadedCountryData));
        gameService.setCountryData(countryData);

        setShowcaseCards();

        var ref = gameService.database.games();
        // create a synchronized array
        // click on `index.html` above to see it used in the DOM!
        $scope.games = $firebaseArray(ref);
      }

      function setShowcaseCards() {
        var countryData = gameService.getCountryData();
        $scope.cards = countryData.slice(0, 3);
      }

      function getGameByKey(key) {
        return $scope.games.filter(x => x.$id === key)[0];
      }

      function getGameByCreator(creator) {
        return $scope.games.filter(x => x.creator === creator)[0];
      }

      function drawCards() {
        return gameService.getCountryData().splice(0, 2);
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
          // add 1 player to the counter
          gameService.database.games(gameKey).child('playersCount').transaction(function (current_value) {
            return (current_value || 0) + 1;
          });

          var playerKey = firebasePlayer.getKey();
          var cardsRef = gameService.database.playerCards(gameKey, playerKey);

          var cards = drawCards();
          cards.forEach(x => {
            let card = cardsRef.push();
            card.set(x);
          });

          firebasePlayer.child('cardsCount').transaction(function (current_value) {
            return cards.length;
          });
        })
      }

      $scope.startNewGame = function () {
        var username = $scope.username;

        if (!username) {
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

        if (!username) {
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

      function fixCountryData(countryData) {
        return countryData
          .map(country => {
            return Object.assign(country, {
              PIB_percapita: Number(country.PIB_percapita),
              PIB_percapita_ano: Number(country.PIB_percapita_ano),
              area: Number(country.area || 0),
              area_ano: Number(country.area_ano),
              facilidade_negocios: Number(country.facilicade_negocios || 0),
              facilidade_negocios_ano: Number(country.facilicade_negocios_ano),
              gini: Number(String(country.gini || 0).replace(",", ".")),
              gini_ano: Number(country.gini_ano),
              idh: Number(String(country.idh || 0).replace(",", ".")),
              populacao: Number(country.populacao || 0),
              populacao_ano: Number(country.populacao_ano),
              ranking: Number(country.ranking)
            });
          })
          .filter(c => c.ranking >= 1 && c.ranking <= 100)
          .sort((a, b) => a.ranking > b.ranking ? 1 : -1);
      }

      init();
    }
  ]);