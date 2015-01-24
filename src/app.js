var angular = require('angular');


var app = angular.module('beerChronicles', []);


app.controller('GameCtrl', ['$http', '$scope', function($http, $scope) {
  var scenes = [];
  var locations = [];
  var characters;
  $http.get("/assets/locations.json").success(function(data) {
    locations = data;
  });
  $http.get("/assets/characters.json").success(function(data) {
    characters = data;
  });
  $http.get("/assets/scenes.json").success(function(data) {
    scenes = data;
    scenes.forEach(function(s) {
      if (!(s.location in locations)) {
        console.error("Unknown location \""+s.location+"\"");
      } else {
        s.location = locations[s.location];
      }
    });
    $scope.scene = scenes[0];
  });

  $scope.gotoScene = function(id) {
    $scope.scene = scenes[id];
  };
}]);
