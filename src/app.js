var angular = require('angular');


var app = angular.module('beerChronicles', []);


app.controller('GameCtrl', ['$http', '$scope', function($http, $scope) {
  var scenes = [];
  $http.get("/assets/scenes.json").success(function(data) {
    scenes = data;
    $scope.scene = scenes[0];
  });

  $scope.gotoScene = function(id) {
    $scope.scene = scenes[id];
  };
}]);
