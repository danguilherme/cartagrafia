'use strict';

angular.module('myApp.card.gameControl-service', [])

.service('gameService', ['$firebaseObject', '$firebaseArray', '$firebaseAuth', function ($firebaseObject, $firebaseArray, $firebaseAuth) {
    var currentGame = null;

    function set(k, v) {
      localStorage[k] = JSON.stringify(v);
    }

    function get(k) {
      return JSON.parse(localStorage[k]);
    }

    this.setUsername = function (selectedUsername) {
      set('username', selectedUsername);
    }

    this.getUsername = function (selectedUsername) {
      return get('username');
    }

    this.selectGame = function (gameKey) {
      currentGame = gameKey;
    }

    this.setCountryData = function (countryData) {
      countryData.forEach(x => {
        x.gini = (x.gini || '').replace(',', '.');
      });
      set('countryData', countryData);
    }

    this.getCountryData = function () {
      return get('countryData');
    }

    this.getCountryNames = function () {
      return get('countryData').map(x => x.nome);
    }

    this.database = {
      games: function games(key) {
        if (key) {
          return firebase.database().ref().child("games").child(key);
        } else {
          return firebase.database().ref().child("games");
        }
      },

      gamePlayers: function gamePlayers(gameKey, playerKey) {
        if (playerKey) {
          return this.games().child(gameKey).child('players').child(playerKey);
        } else {
          return this.games().child(gameKey).child('players');
        }
      },

      playerCards: function playerCards(gameKey, playerKey, cardKey) {
        if (cardKey) {
          return this.gamePlayers(gameKey).child(playerKey).child('cards').child(cardKey);
        } else {
          return this.gamePlayers(gameKey).child(playerKey).child('cards');
        }
      }
    }
  }])
  .factory('gameFactory', ['$firebaseObject', '$firebaseArray', '$firebaseAuth', function ($firebaseObject, $firebaseArray, $firebaseAuth) {
    return function (key, creator) {
      var instance = {};

      instance.state = 'start',
        instance.creator = creator,
        instance.currentPlayer = creator;

      instance.toFirebase = function toFirebase() {
        return {
          state: instance.state,
          creator: instance.creator,
          currentPlayer: instance.creator
        }
      }


      return instance;
    }
  }]);