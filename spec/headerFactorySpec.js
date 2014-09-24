describe('Unit: headerFactory', function () {
  beforeEach(module('bitclip'));

  var $scope, $rootScope, $location, $window, createController, Header, Utilities, tempStore;

  beforeEach(inject(function($injector) {
    $rootScope = $injector.get('$rootScope');
    $location = $injector.get('$location');
    $scope = $rootScope.$new();
    $window = $injector.get('$window');

    Header = $injector.get('Header');
    Utilities = $injector.get('Utilities');

    $window.chrome = {
                      storage:{
                        local: {
                            set: function(obj , callback){ 
                              tempStore = obj;
                              callback();
                            },
                            get: function(propStrOrArray, callback){ 
                              var result = {};
                              //TODO later: must also handle case when key input
                              //has no value in tempstore;
                              if (typeof propStrOrArray === 'string'){
                                result[propStrOrArray] = tempStore[propStrOrArray];
                              } else if (Array.isArray(propStrOrArray)){
                                propStrOrArray.forEach(function(propName){
                                  result[propName] = tempStore[propName];
                                });
                              } else if (propStrOrArray === null) {
                                result = tempStore;
                              }
                              callback(result);
                            },
                            remove: function(){ },
                            clear: function(){ }
                        }
                      }
                    };
    tempStore = {
      isMainNet: false,
      mainNet: {
                  currentAddress: "",
                  currentPrivateKey: "",
                  allAddressesAndKeys: []
               },
      testNet: {
                  currentAddress: "mjjeyn6Vs4TAtMFKJEwpMPJsAVysxL4nYG",
                  currentPrivateKey: "",
                  allAddressesAndKeys: []
               }
    };
  }));

  afterEach(function() {
    //$window.localStorage.removeItem('com.shortly'); //something like this but for chrome storage
  });

  it('setNetwork should be a function', function () {
    expect(Header.setNetwork).to.be.a('function');
  });

  it('setNetwork change isMainNet in chrome.storage.local', function () {
    Header.setNetwork(true, function(){
      console.log("tempStore", tempStore);
      expect(tempStore.isMainNet).to.equal(true);
    });
  });

  it('getBalanceForCurrentAddress should return the correct balance for the currentAddress', function () {
    Header.getBalanceForCurrentAddress().then(function(currentBalance){
      var currentBalance1 = currentBalance;
      Utilities.httpGet('http://testnet.helloblock.io/v1/addresses/mjjeyn6Vs4TAtMFKJEwpMPJsAVysxL4nYG', function(data){
        var currentBalance2 = data.data.address.balance;
        expect(currentBalance1).to.equal(currentBalance2);
      });
    });
  });

})