'use strict';

angular.module('myApp.game', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/game/:gameKey', {
    templateUrl: 'views/game/game.html',
    controller: 'GameCtrl'
  });
}])

.controller('GameCtrl',  ['$scope', '$routeParams', '$location', '$firebaseObject', '$firebaseArray', '$firebaseAuth', 'cardFactory', 'gameService',
    function ($scope, $routeParams, $location, $firebaseObject, $firebaseArray, $firebaseAuth, cardFactory, gameService) {
      $scope.username = gameService.getUsername();
      $scope.game = null;
      $scope.players = [];
      $scope.cards = [];
      $scope.compare = $firebaseObject(gameService.database.games($routeParams.gameKey).child('comparing'));
      
      function init() {
        if(!$scope.username) $location.url('/');

        $scope.players = $firebaseArray(gameService.database.gamePlayers($routeParams.gameKey));
        $scope.players.$loaded(x => {
          $scope.me = $firebaseObject(getMyPlayer());
          $scope.cards = $firebaseArray(gameService.database.playerCards($routeParams.gameKey, $scope.me.$id))
        });

        var gameRef = gameService.database.games($routeParams.gameKey);
        $scope.game = $firebaseObject(gameRef)
        $scope.game.$loaded(x => {
          $scope.isCurrentPlayer();

          if ($scope.game.state == 'start') {
            $scope.game.state = 'select-property';
            $scope.game.$save();
          }
        });
        gameRef.child('state').on('value', onStateChange);

        $scope.countryNames = gameService.getCountryNames();
      }

      function getMyPlayer() {
        var id = $scope.players.filter(x => x.username === $scope.username)[0].$id;
        return gameService.database.gamePlayers($scope.game.$id, id);
      }

      function getNextPlayer() {
        var ref = gameService.database.gamePlayers($scope.game.$id);
        
        var idx = $scope.players.$indexFor($scope.me.$id);
        var len = $scope.players.length;
        if (++idx >= len) {
          idx = 0;
        }
        return $scope.players[idx];
      }

      function compareResults() {
        var isWinner = false;
        var otherValues = $scope.getOtherPlayers().map(x => Number(x.propertyValue));
        var myValue = Number($scope.compare.propertyValue);
        if ($scope.compare.selectedProperty === 'gini' || $scope.compare.selectedProperty === 'facilidade_negocios') {
          // quanto menor, melhor
          isWinner = otherValues.every(x => x > myValue);
        } else {
          // quanto maior, melhor
          isWinner = otherValues.every(x => x < myValue);
        }

        $scope.game.currentPlayer = getNextPlayer().username;
        $scope.game.state = "select-property";
        $scope.game.$save().then(_ => {
          // reset compare
          $scope.compare.selectedProperty = null;
          $scope.compare.propertyValue = null;
          $scope.compare.countryName = null;
          $scope.compare.playersSelected = null;
          $scope.compare.selectedCardId = null;
          $scope.compare.won = isWinner;
          $scope.compare.$save();

          // update cards
          if (isWinner) {
            alert("Sua carta ganhou! Ela foi removida da sua mão.");

            // GANHOU! Remove a carta do baralho...
            var cardRef = gameService.database.playerCards($scope.game.$id, $scope.me.$id, $scope.selectedCard.$id);
            $firebaseObject(cardRef).$remove();

            gameService.database.gamePlayers($scope.game.$id, $scope.me.$id).child('cardsCount').transaction(function (current_value) {
              return current_value - 1;
            });

            if (($scope.me.cardsCount - 1) === 0) {
              $scope.game.state = 'end';
              $scope.game.winner = $scope.me.username;
              $scope.game.$save();
            }

            $scope.selectedCard = null;
          } else {
            alert("Sua carta perdeu...");
            $scope.selectedCard = null;
          }
        });
      }

      function theEnd() {
        if ($scope.game.winner == $scope.me.username) {
          alert("PARABÉNS! Você venceu!");
        } else {
          alert('QUE PENA! Você perdeu. Desafie seu(s) oponente(s) novamente!');
        }

        $scope.game.$remove();
        $location.url('/');
      }

      function onStateChange(snapshot) {
        if (snapshot.val() == 'compare-results' && $scope.isCurrentPlayer()) {
          compareResults();
        } else if (snapshot.val() == 'end') {
          theEnd();
        }
      }

      $scope.getOtherPlayers = function() {
        return $scope.players.filter(x => x.username != $scope.username);
      }

      $scope.selectCard = function(card) {
        $scope.selectedCard = card;
      }

      $scope.isCurrentPlayer = function() {
        return $scope.game.currentPlayer === $scope.username;
      }

      $scope.onSelectedPropertyAndCountry = function(property, value, countryName) {
        $scope.selectedCard.selectedCountryName = countryName;
        $scope.selectedCard.selectedProperty = property;
        $scope.selectedCard.selectedPropertyValue = value;
      }

      // check if the game is in the current state
      $scope.state = function(state) {
        if (state == 'my-turn') {
          return $scope.isCurrentPlayer();
        }

        return $scope.game.state === state;
      }

      $scope.confirmCardSelection = function() {
        if ($scope.isCurrentPlayer()) {
          // checar se acertou o nome do país, se não só passa pro próximo.
          if ($scope.selectedCard.nome === $scope.selectedCard.selectedCountryName) {
            $scope.game.state = 'others-select-card';
            $scope.game.$save().then(function() {
              // salva o valor escolhido no jogador...
              $scope.me.propertyValue = $scope.selectedCard.selectedPropertyValue;
              $scope.me.$save();

              // salva a comparação
              $scope.compare.selectedProperty = $scope.selectedCard.selectedProperty;
              $scope.compare.propertyValue = $scope.selectedCard.selectedPropertyValue;
              $scope.compare.countryName = $scope.selectedCard.selectedCountryName;
              $scope.compare.playersSelected = ($scope.compare.playersSelected || 0) + 1;
              $scope.compare.selectedCardId = $scope.selectedCard.$id;
              $scope.compare.$save();
            }).catch(function(error) {
              alert('Error!');
            });
          } else {
            // nome incorreto, passa a vez
            alert("O nome do país está errado.");

            $scope.game.currentProperty = null;

            $scope.game.currentPlayer = getNextPlayer().username;
            $scope.game.$save();

            $scope.selectedCard = null;
          }
        } else {
          $scope.me.propertyValue = $scope.selectedCard[$scope.compare.selectedProperty];
          var saveCardPrommise = $scope.me.$save();

          $scope.compare.playersSelected++;
          var saveComparePromise = $scope.compare.$save();

          Promise
            .all([saveCardPrommise, saveComparePromise])
            .then(x => {
              if ($scope.compare.playersSelected >= $scope.game.playersCount) {
                $scope.game.state = 'compare-results';
                $scope.game.$save();
              }
            });

          $scope.selectedCard.selectedPropery = $scope.compare.selectedProperty;
        }
      }

      init();
    }]);