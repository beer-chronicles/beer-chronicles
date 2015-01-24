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
    result = result && condition.counters.every(function(counter) {
      var counterState = state[counter.name];
      var counterValue = (typeof counterState != 'undefined' ? state[counter.name].value : 0);
      var result = true;
      result = result && (typeof counter.lessThan == 'undefined' || counterValue < counter.lessThan);
      result = result && (typeof counter.greaterThan == 'undefined' || counterValue > counter.greaterThan);
      result = result && (typeof counter.equals == 'undefined' || equals === counter.equals);
      return result;
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
    var countersToChange = changes.counters || [];
    countersToChange.forEach(function(change) {
      if (typeof change.operation == 'undefined')
        return; 
      var counterState = state[change.name] || { "value": 0};
      state[change.name] = counterState; 
      switch (change.operation) {
        case "add":
          counterState.value += change.amount;
          break;
        case "sub":
          counterState.value -= change.amount;
          break;
        case "set":
          counterState.value = change.amount;
          break;
        default:
          $log.error("UNSUPPORTED COUNTER OPERATION: " + change.operation);
          break;
      }
      $log.debug("New counter value for " + change.name + ": " + counterState.value);
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
