var angular = require('angular');


var app = angular.module('beerChronicles', []);


app.controller('GameCtrl', ['$http', '$scope', '$log', function($http, $scope, $log) {
  var scenes = [];
  var globalState = {};

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
    verifyScenes();
    $scope.gotoScene(0);
  });

  var areConditionsFulfilled = function(condition, state) {
    if (typeof condition == 'undefined')
      return true;
    var deniedBy = condition.deniedBy || [];
    var result = true;
    result = result && deniedBy.every(function(localFlag) {
      return !(state[localFlag] || false); 
    });
    var requires = condition.requires || [];
    result = result && requires.every(function(localFlag) {
      return (state[localFlag] || false);
    });
    return result;
  };

  var applyStateChanges = function(changes, state) {
    if (typeof changes == 'undefined')
      return;
    var flagsToSet = changes.set || [];
    flagsToSet.forEach(function(localFlag) {
      state[localFlag] = true;
    });
    var flagsToRemove= changes.unset || [];
    flagsToRemove.forEach(function(localFlag) {
      delete state[localFlag];
    });
  };

  var determineChoices = function() {
    var scene = $scope.scene;
    var state = scene.state;
    scene.choices.forEach(function(choice) {
      choice.show = areConditionsFulfilled(choice.local, state)
        && areConditionsFulfilled(choice.global, globalState);
    });
  };

  $scope.onChoiceSelected = function(choice) {
    var sceneState = $scope.scene.state;
    applyStateChanges(choice.local, sceneState);
    applyStateChanges(choice.global, globalState);
    var id = choice.href;
    $scope.gotoScene(id);
  };

  $scope.gotoScene = function(id) {
    var scene = scenes[id];
    scene.state = scene.state || {};
    $scope.scene = scene;
    determineChoices();
  };
}]);
