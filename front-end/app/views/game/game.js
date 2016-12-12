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

      init();
    }]);