var angular = require('angular');


var app = angular.module('beerChronicles', []);


app.controller('GameCtrl', ['$scope', function($scope) {
  $scope.scene = {
    "id": 0,
    "location": {
      "backgroundImage": "assets/locations/tankstelle.jpg"
    },
    "choices": [
      {
        "text": "Wir gehen Bier holen an der Tanke!",
        "href": 1
      }, {
        "text": "Wir warten hier erstmal.",
        "href": 0
      }, {
        "text": "Wir suchen eine Brauerei.",
        "href": 2
      }
    ]
  };
}]);
