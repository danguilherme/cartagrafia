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
      
      function init() {
        if(!$scope.username) $location.url('/');

        $scope.players = $firebaseArray(gameService.database.gamePlayers($routeParams.gameKey));
        $scope.players.$loaded(x => {
          $scope.me = getMyPlayer();
          $scope.cards = $firebaseArray(gameService.database.playerCards($routeParams.gameKey, $scope.me.$id))
        });

        $scope.game = $firebaseObject(gameService.database.games($routeParams.gameKey))
        $scope.game.$loaded(x => {
          $scope.isCurrentPlayer = $scope.game.currentPlayer === $scope.username;
        });

        $scope.countryNames = gameService.getCountryNames();
      }

      function getMyPlayer() {
        return $scope.players.filter(x => x.username === $scope.username)[0];
      }

      $scope.getOtherPlayers = function() {
        return $scope.players.filter(x => x.username != $scope.username);
      }

      $scope.selectCard = function(card) {
        $scope.selectedCard = card;
      }

      $scope.onSelectedPropertyAndCountry = function(property, value, countryName) {
        if ($scope.state == 'start')
          $scope.state = 'playing';
        // checar se acertou o nome do país, se não só passa pro próximo.
        if (countryName !== countryName)
          alert("O nome do país está errado.");

        $scope.game.currentProperty = property;
        $scope.game.currentValue = value;
        $scope.game.currentCountry = countryName;
        $scope.game.$save().then(function() {
          console.log('Sucesso!');
          console.log($scope.selectedCard.$id)
          $firebaseObject(gameService.database.playerCards($scope.game.$id, $scope.me.$id, $scope.selectedCard.$id)).$remove();
          
          gameService.database.gamePlayers($scope.game.$id, $scope.me.$id).child('cardsCount').transaction(function (current_value) {
            return current_value - 1;
          });

          $scope.selectedCard = null;
        }).catch(function(error) {
          alert('Error!');
        });
      }

      init();
    }]);