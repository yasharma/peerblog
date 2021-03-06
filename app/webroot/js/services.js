(function() {
'use strict';

angular.module('app.services', [])
	.factory('AuthenticationService', function () {
	    var auth = {
	        isLogged: false
	    };

	    return auth;
	})
	/*
	* can be uncommented by running your node server 
	* run node server.js and then uncomment following code
	.factory('socketio', ['$rootScope', '$location',function ($rootScope, $location) {
		
		var socket = io.connect('http://'+ $location.host() +':8082');
		return {
			on: function (eventName, callback) {
				socket.on(eventName, function () {  
					var args = arguments;
					$rootScope.$apply(function () {
						callback.apply(socket, args);
					});
				});
			},
			emit: function (eventName, data, callback) {
				socket.emit(eventName, data, function () {
					var args = arguments;
					$rootScope.$apply(function () {
						if (callback) {
							callback.apply(socket, args);
						}
					});
				});
			}
		};
	}])*/
	.factory('RestSvr', ['$http', 'mapUrlExt',function ($http, mapUrlExt) {
		return{
			login: function(option){
				return $http.post(mapUrlExt.json(option.apiUrl), option.data).then(function(response){
					return {
						message: {
							type: response.data.message.type,
							text: response.data.message.text
						},	
						user: response.data.user,
						token: response.headers('token')
					};
				});
			},
			paginate: function(apiUrl, params, queryString){
				var p = !angular.isUndefined(params) ? params : '';
				var q = !angular.isUndefined(queryString) ? queryString : '';
				return $http.get(mapUrlExt.json(apiUrl + p ), q).then(function(response){
					return {
						records: response.data.records,
						paging: response.data.paging
					};
				});
			},
			get: function(apiUrl, params){
				var p = !angular.isUndefined(params) ? params : null;
				return $http.get(mapUrlExt.json(apiUrl), params).then(function(response){
					return {
						records: response.data.records
					};
				});
			},
			getById: function(option){
				return $http.get(mapUrlExt.json(option.apiUrl + option.id)).then(function(response){
					return {
						record: response.data.record
					};
				});	
			},
			post: function(option){
				return $http.post(mapUrlExt.json(option.apiUrl), option.data).then(function(response){
					return {
						type: response.data.message.type,
						text: response.data.message.text
					};
				});
			},
			put: function(option){
				return $http.put(mapUrlExt.json(option.apiUrl + option.id), option.data).then(function(response){
					return {
						type: response.data.message.type,
						text: response.data.message.text
					};
				});
			},
			delete: function(option){
				return $http.delete(mapUrlExt.json(option.apiUrl + option.id)).then(function(response){
					return {
						type: response.data.message.type,
						text: response.data.message.text
					};
				});	
			}
		};
	}])
	.factory('Upload', ['$rootScope', '$http', 'mapUrlExt',function ($rootScope, $http, mapUrlExt) {
		return{
			file: function(object){
				var modelKey = Object.keys(object)[1];
				return $http({
					method: 'POST',
					url: mapUrlExt.json(object.apiUrl),
					headers: { 'Content-Type': undefined },
					transformRequest: function (data) {
						var formData = new FormData();
						formData.append("Post", angular.toJson(object.Post));
						formData.append("file" , object.file);
						return formData;
					},
					data: { modelKey: object.Post, files: object.file }
				});
			}
		};
	}])	
	.factory('mapUrlExt', ['$rootScope', function($rootScope){
		return{
			json: function(url){
				return $rootScope.appURL + url + '.json';
			}
		};
	}]);	
}());