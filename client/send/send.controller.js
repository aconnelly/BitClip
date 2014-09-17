angular.module('bitclip.send', [
  'ngMorph'
])

.controller('sendController', function($scope) {
  

  $scope.send = {
    closeEl: '.close',
    modal: {
      templateUrl: 'send/send.btn.html',
      position: {
        top: '90%',
        left: '0%'
      },
      fade: false
    }
  };

  
  
  //sendPayment Method
  
  $scope.sendPayment = function(amount){  
    console.log('hello worldz', $scope.amount);


  }


});
