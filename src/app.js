var angular = require('angular');


var app = angular.module('beerChronicles', []);


app.controller('GameCtrl', ['$http', '$scope', '$log', function($http, $scope, $log) {
  var scenes = [];

  var verifyScenes = function() {
    scenes.forEach(function(scene) {
      var sceneName = scene.id + ": " + scene.location.title;
      var img = new Image();
      img.onerror = function() {
        $log.error("Missing image in scene " + sceneName);
      }
      img.src = scene.location.backgroundImage;
      var sceneIds = scenes.map(function(x) { return x.id; });
      scene.choices.forEach(function(choice) {
        if (!(choice.href in sceneIds)) {
          $log.error("Choice '" + choice.text + "' of scene " + sceneName + " references invalid scene id " + choice.href); 
        }
      });
    });
  };
  $http.get("/assets/scenes.json").success(function(data) {
    scenes = data;
    $scope.scene = scenes[0];
    verifyScenes();
  });

  $scope.gotoScene = function(id) {
    $scope.scene = scenes[id];
  };
}]);
