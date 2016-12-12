'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'firebase',
  'myApp.view1',
  'myApp.view2',
  'myApp.version',
  'myApp.card'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCzgpX4vtSkFoAJ7e77OI8FnsgZ-vvJskg",
    authDomain: "cartagrafia-df4e1.firebaseapp.com",
    databaseURL: "https://cartagrafia-df4e1.firebaseio.com",
    storageBucket: "cartagrafia-df4e1.appspot.com",
    messagingSenderId: "589565613544"
  };
  firebase.initializeApp(config);

  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
