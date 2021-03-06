angular.module('bitclip.historyController', [])

.controller('historyController', ['$scope', 'Utilities', 'History', function($scope, Utilities, History) {
  Utilities.getCurrentAddress().then(function(currentAddress) {
    $scope.currentAddress = currentAddress;
    History.getTransactionHist(currentAddress).then(function(trans) {
      var transaction = [];
      for (var i = 0, l = trans.length; i < l; i++) {
        transaction.push(History.getUsableTransData(trans[i], currentAddress));
      }
      $scope.transactions = transaction;
    });
  });
}]);
