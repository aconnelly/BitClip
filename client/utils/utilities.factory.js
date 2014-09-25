angular.module('bitclip.utilitiesFactory', [])

.factory('Utilities', ['$http', '$q', function($http, $q) {
  var InitObj = function() {
    this.currentAddress = '';
    this.currentPrivateKey = '';
    this.allAddressesAndKeys = [];
  };

  var initialize = function() {
    var deferred = $q.defer();
    chrome.storage.local.get(['isMainNet', 'mainNet', 'testNet'], function(obj) {
      if (obj.isMainNet === undefined) {
        obj.isMainNet = true;
      }
      if (obj.mainNet === undefined) {
        obj.mainNet = new InitObj();
      }
      if (obj.testNet === undefined) {
        obj.testNet = new InitObj();
      }
      chrome.storage.local.set(obj, function() {
        deferred.resolve('Initialization complete.');
      });
    });
    return deferred.promise;
  };

  var httpGet = function(url, callback) {
    $http.get(url)
      .success(function(data) {
        callback(data);
      })
      .error(function(data, status, headers, config) {
        callback('HTTP GET request failed: ', data, status, headers, config);
      });
  };

  var isMainNet = function() {
    var deferred = $q.defer();
    chrome.storage.local.get('isMainNet', function(obj) {
      deferred.resolve(obj.isMainNet);
    });
    return deferred.promise;
  };

  var getNetworkData = function(request) {
    var deferred = $q.defer();
    chrome.storage.local.get(['isMainNet', 'mainNet', 'testNet'], function(obj) {
      if (obj.isMainNet === true) {
        var result = obj.mainNet[request];
        deferred.resolve(result);
      } else if (obj.isMainNet === false) {
        var result = obj.testNet[request];
        deferred.resolve(result);
      } else {
        deferred.reject('Network type not defined.');
      }
    });
    return deferred.promise;
  };

  var getCurrentAddress = function() {
    return getNetworkData('currentAddress');
  };

  var getCurrentPrivateKey = function() {
    return getNetworkData('currentPrivateKey');
  };

  var getAllAddresses = function() {
    var deferred = $q.defer();
    getNetworkData('allAddressesAndKeys').then(function(arr) {
      var result = [];
      for (var i = 0, l = arr.length; i < l; i++) {
        result.push(arr[i][0]);
      }
      deferred.resolve(result);
    });
    return deferred.promise;
  };

  var getBalances = function(addresses) {
    var deferred = $q.defer();
    isMainNet().then(function(bool) {
      var baseUrl = 'http://' + (bool ? 'mainnet' : 'testnet') + '.helloblock.io/v1/addresses?addresses=';
      var requestString = '';
      if (addresses.length > 1) {
        requestString += addresses.join('&addresses=');
      } else if (addresses.length === 1) {
        requestString = addresses[0];
      } else {
        deferred.resolve([]);
        return deferred.promise;
      }
      baseUrl += requestString;
      httpGet(baseUrl, function(obj) {
        deferred.resolve(obj.data.addresses);
      });
    });
    return deferred.promise;
  };

  var getLiveBalanceForCurrentAddress = function(callback) {
    isMainNet().then(function(bool) {
      getCurrentAddress().then(function(currentAddress) {
        var url = 'wss://socket-' + (bool ? 'mainnet' : 'testnet') + '.helloblock.io';
        var ws = new WebSocket(url);
        ws.onopen = function() {
          ws.send(JSON.stringify({
            'op': 'subscribe',
            'channel': 'addresses',
            'filters': [currentAddress]
          }));

          ws.onmessage = function(e) {
            var data = JSON.parse(e.data);
            if (data.data) {
              callback(null, data.data);
            }
          };

          ws.onclose = function(e) {
            setTimeout(function() {
              connect();
            }, 1000);
          };

          ws.onerror = function(err) {
            callback(err.message, null);
            ws.close();
          };
        };
      });
    });
  };

  return {
    initialize: initialize,
    isMainNet: isMainNet,
    httpGet: httpGet,
    getCurrentAddress: getCurrentAddress,
    getCurrentPrivateKey: getCurrentPrivateKey,
    getAllAddresses: getAllAddresses,
    getBalances: getBalances,
    getLiveBalanceForCurrentAddress: getLiveBalanceForCurrentAddress
  };
}]);