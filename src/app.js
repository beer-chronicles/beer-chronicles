var angular = require('angular');

var app = angular.module('beerChronicles', []);

app.filter('linebreaks', require('./filters').linebreaks);


app.controller('GameCtrl', ['$http', '$scope', '$log', '$q', function($http, $scope, $log, $q) {
  var scenes;
  var locations;
  var characters;
  var globalState = {};
  var dialogCounter = 0;

  $scope.developmentMode=false;

  var locationsLoader = $http.get("/assets/locations.json");
  var charactersLoader = $http.get("/assets/characters.json");
  var sceneLoaders = ["start", "apartment", "jakobsApartment", "gasStation", "lockUp", "funfair", "graveyard", "credits", "badEnd"]
      .map(function(resource) {
        return $http.get("/assets/scenes/" + resource + ".json");
      });

  var verifyScenes = function() {
    Object.keys(scenes).forEach(function(sceneId) {
      var scene = scenes[sceneId];
      $log.debug("Verifying scene " + scene.location);
      if (!(scene.location in locations)) {
        $log.error("Location " + scene.location + " for scene " + sceneId + " is not defined!");
      }
      scene.location = locations[scene.location];

      for (k in scene.dialogs) {
        scene.dialogs[k].forEach(function(step) {
          step.character = characters[step.character];
        });
      };
      var sceneName = scene.id + ": " + scene.location.title;
      scene.choices.forEach(function(choice) {
        choice.character = characters[choice.character];
        if (typeof choice.href != 'undefined' && !(choice.href in scenes)) {
          $log.error("Choice '" + choice.text + "' of scene " + sceneName + " references invalid scene id " + choice.href);
        }
      });
    });
  };
  $q.all([locationsLoader, charactersLoader].concat(sceneLoaders)).then(function(data) {
    locations = data[0].data;
    for (var key in locations) {
      var img = new Image();
      img.src = locations[key].backgroundImage;
    }
    characters = data[1].data;
    for (var key in characters) {
      var img = new Image();
      img.src = characters[key].image;
    }
    // Scenes begin at index 2
    var loadedScenes = data.slice(2);
    loadedScenes = loadedScenes.map(function(result) {
      return result.data;
    });
    scenes = {};
    loadedScenes.reduce(function(previousValue, currentValue) {
      previousValue[currentValue.id] = currentValue;
      return previousValue;
    }, scenes);
    verifyScenes();
    $scope.gotoScene("start");
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
    if (typeof condition.counters != 'undefined') {
      result = result && condition.counters.every(function(counter) {
        var counterState = state[counter.name];
        var counterValue = (typeof counterState != 'undefined' ? state[counter.name].value : 0);
        var result = true;
        result = result && (typeof counter.lessThan == 'undefined' || counterValue < counter.lessThan);
        result = result && (typeof counter.greaterThan == 'undefined' || counterValue > counter.greaterThan);
        result = result && (typeof counter.equals == 'undefined' || counterValue === counter.equals);
        return result;
      });
    }
    if (typeof condition.chance != 'undefined') {
      result = result && condition.chance > Math.random();
    }
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
	case "rnd":
	  counterState.value = Math.floor(Math.random() * change.amount);
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
    var choiceCounter = sceneState["choiceCounter"] || {value : 0 };
    sceneState["choiceCounter"] = choiceCounter;
    choiceCounter.value++;
    applyStateChanges(choice.local, sceneState);
    applyStateChanges(choice.global, globalState);
    var id = choice.href || $scope.scene.id;
    $scope.gotoScene(id, choice.dialog || "default");
  };

  $scope.gotoScene = function(id, dialogKey) {
    $log.debug("Switching to scene " + id);
    var scene = scenes[id];
    dialogKey = dialogKey || "default";

    if(scene.hasOwnProperty("dialogs") && scene.dialogs.hasOwnProperty(dialogKey)) {
      scene.dialog = scene.dialogs[dialogKey];
    } else {
      scene.dialog = [];
      $log.error("no dialog "+dialogKey);
    }
    scene.state = scene.state || {};
    $scope.scene = scene;
    dialogCounter = 0;
    $scope.dialogStep = undefined;
    $scope.nextDialogStep();
    determineChoices();
  };

  $scope.nextDialogStep = function() {
    if(dialogCounter < $scope.scene.dialog.length) {
      $scope.dialogStep = $scope.scene.dialog[dialogCounter];
      dialogCounter++;
    } else {
      $scope.dialogStep = undefined;
    }
  }

  $scope.skipDialog = function() {
    while (typeof $scope.dialogStep != 'undefined') {
      $scope.nextDialogStep();
    }
  }

  $scope.goFullScreen = function() {
    var elem = document.getElementById("body");
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    }
    $scope.fullScreen = true;
  };
}]);
