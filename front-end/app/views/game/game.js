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
      $scope.game = $firebaseObject(gameService.database.games($routeParams.gameKey));
      $scope.players = [];
      $scope.cards = [];
      
      function init() {
        if(!$scope.username) $location.url('/');

        $scope.players = $firebaseArray(gameService.database.gamePlayers($routeParams.gameKey));
        $scope.players.$loaded(x => {
          $scope.me = getMyPlayer();
          $scope.cards = $firebaseArray(gameService.database.playerCards($routeParams.gameKey, $scope.me.$id))
        });
      }

      function getMyPlayer() {
        return $scope.players.filter(x => x.username === $scope.username)[0];
      }

      $scope.getOtherPlayers = function() {
        return $scope.players.filter(x => x.username != $scope.username);
      }

      init();
    }]);