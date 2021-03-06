(function() {
'use strict';

angular.module('app', ['ngRoute', 'app.controllers', 'app.directives','app.services','angular-loading-bar','ui.bootstrap','LocalStorageModule','textAngular'])
	.config(['$routeProvider','cfpLoadingBarProvider','$httpProvider', function($routeProvider, cfpLoadingBarProvider,$httpProvider){
		cfpLoadingBarProvider.includeSpinner = false;
		$routeProvider
		.when('/', {
			templateUrl: 'views/admin/login.html', 
			controller: 'AdminController',
			access: {requiredLogin: false}
		})
		.when('/dashboard', {
			templateUrl: 'views/admin/dashboard.html', 
			controller: 'DashboardController',
			access: {requiredLogin: true}
		})
		.when('/logout', {
			template: '', 
			controller: 'LogoutController',
			access: {requiredLogin: true}
		})
		.when('/profile', {
			templateUrl: 'views/admin/profile.html', 
			controller: 'ProfileController',
			access: {requiredLogin: true}
		})
		.when('/posts', {
			templateUrl: 'views/admin/post.html', 
			controller: 'PostListController',
			access: {requiredLogin: true}
		})
		.when('/create', {
			templateUrl: 'views/admin/create.html', 
			controller: 'NewPostController',
			access: {requiredLogin: true}
		})
		.when('/edit/:id', {
			templateUrl: 'views/admin/edit.html', 
			controller: 'EditPostController',
			access: {requiredLogin: true}
		})
		.when('/category', {
			templateUrl: 'views/admin/categories.html',
			controller: 'CategoryController',
			access: {requiredLogin: true}
		})
		.when('/create-category', {
			templateUrl: 'views/admin/create_categories.html',
			controller: 'NewCategoryController',
			access: {requiredLogin: true}
		})
		.when('/edit-category/:id', {
			templateUrl: 'views/admin/create_categories.html',
			controller: 'EditCategoryController',
			access: {requiredLogin: true}
		})
		.otherwise({
			redirectTo: '/'
		});

		// Enable CORS
		$httpProvider.defaults.useXDomain = true;
    	delete $httpProvider.defaults.headers.common['X-Requested-With'];
		var interceptor = ['$q', '$window', '$rootScope', 'localStorageService', 'AuthenticationService', 'mapUrlExt','$timeout',function ($q, $window, $rootScope, localStorageService, AuthenticationService, mapUrlExt, $timeout) {

	        return {
	        	request: function (config) {
		           	config.headers = config.headers || {};
		           	var token = localStorageService.get('token');
		           	if (token) {
		               	config.headers.token = token;
		               	AuthenticationService.isLogged = 1;
	                    $rootScope.isLogged = 1;
		           	}
		           	return config;
		       	},

	            requestError: function (rejection) {
	                return $q.reject(rejection);
	            },

	            response: function (response) {
	                
	                $timeout(function () { 
	                	$rootScope.Message = {type: 'fade'};
	                }, 5000);	

	                return response || $q.when(response);
	            },

	            // Revoke client authentication if 400 is received

	            responseError: function (rejection) {
	                
	                if (rejection !== null && rejection.status === 400) {

	                	console.log(rejection);
	                	localStorageService.remove('token');
	                	localStorageService.remove('user');
	                	AuthenticationService.isLogged = false;
	                	$rootScope.isLogged = false;
	                	$window.location.href = "admin.html";
	                }
	                return $q.reject(rejection);
	            }
	        };
	    }];

    	$httpProvider.interceptors.push(interceptor);

	}])
	.run(['$rootScope', '$location', 'localStorageService', 'AuthenticationService',function ($rootScope, $location, localStorageService, AuthenticationService) {
		$rootScope.$on("$routeChangeStart", function (event, nextRoute, currentRoute) {
			if ( nextRoute !== null && nextRoute.access !== null && nextRoute.access.requiredLogin && !AuthenticationService.isLogged && !localStorageService.get('user')) {
			    AuthenticationService.isLogged = 0;
			    $location.path("/");
			} else {
				var token = localStorageService.get('token');
				if($location.path() == '/' && token ){
					$location.path("/dashboard");
				}
			}
			
		});
		$rootScope.user = localStorageService.get('user');
	}]);
}());	