angular.module('app.controllers', [])
	.controller('AppController', ['$scope', '$http', '$location', '$rootScope', function($scope, $http, $location, $rootScope){
		var protocol = $location.protocol();
		$rootScope.appURL = $location.host() === 'blog.dev' ? protocol+'://blog.dev' : protocol+'://peerblog.herokuapp.com';
		$rootScope.imagePath = $rootScope.appURL +'/img/posts_images/';
		$rootScope.admin = 'admin.html#';

	}])
	.controller('PostController', ['$scope', '$http', '$location', '$rootScope', 'paginateSvr', function($scope, $http, $location, $rootScope, paginateSvr){
		var load = function(){
			$http.get($rootScope.appURL + '/posts.json').then( function(response){
				$scope.posts = response.data.posts;
				$scope.paging = response.data.paging;
			});
		};
		
		$scope.pageChanged = function () {
		   	paginateSvr.getData({
		      	params: {
		        	page: $scope.paging.page
		      	}
		   	}).then(function(response){
		   		$scope.posts = response.data.posts;
				$scope.paging = response.data.paging;
		   	});
		};

		load();

		$scope.deletePost = function(index){
			var e = $scope.posts[index];
			$http.delete($rootScope.appURL + '/posts/' + e.Post.id + '.json')
				.then(function(response){
					load();
			});
		};

		$scope.editPost = function(index){
			$location.path('/edit/' + $scope.posts[index].Post.id);
		};

		$scope.viewPost = function(index){
			$location.path('/' + $scope.posts[index].Post.id);
		};
	}])
	.controller('NewPostController', ['$scope', '$http', '$location', '$rootScope', function($scope, $http, $location, $rootScope){
		console.log('New');
		/*Image Upload*/
		var file = {};
		$scope.uploadFile = function(files) {
			file = files;
		};

		$scope.save = function () {
			$http({
				method: 'POST',
				url: $rootScope.appURL + '/posts.json',
				headers: { 'Content-Type': undefined },
				transformRequest: function (data) {
					var formData = new FormData();
					formData.append("Post", angular.toJson($scope.post));
					formData.append("file" , file[0]);
					return formData;
				},
				data: { Post: $scope.post, files: $scope.files }
			}).then(function(response){
				$location.path('/');
			});
		};

		$scope.cancel = function () { $location.path('/'); };
	}])
	.controller('EditPostController', ['$scope', '$http', 'routeParams','$location', '$rootScope', function($scope, $http, $routeParams, $location, $rootScope){
		$http.get($rootScope.appURL + '/posts/' + $routeParams['id'] + '.json')
        	.then(function(data) {
            	$scope.post = data.post.Post;
        });

        $scope.updatePost = function () {
			var _data = {};
			_data.Post = $scope.post;
			$http.put($rootScope.appURL + '/posts/' + $scope.post.id + '.json', _data)
				.then(function(response){
					$location.path('/');
			});
		};

		$scope.cancel = function () { $location.path('/'); };
	}])
	.controller('ViewPostController', ['$scope', '$http', '$routeParams','$location', '$rootScope',function($scope, $http, $routeParams, $location, $rootScope){
		
		$http.get($rootScope.appURL + '/posts/' + $routeParams['id'] + '.json')
        	.then(function(response) {
            	$scope.Post = response.data.post.Post;
        });
	}])
	.controller('AdminController', ['$scope', '$http','$location', '$rootScope','localStorageService','AuthenticationService' ,function($scope, $http, $location, $rootScope, localStorageService,AuthenticationService){
		//$rootScope.user = null;
		$scope.login = function (isValid) {
			if (!isValid) return;
			var _data = {};
			_data.User = $scope.user;
			$http.post($rootScope.appURL + '/users/login.json', _data)
				.then(function(response){
					if( response.data.message.type == 'error' ){
						$scope.Message = response.data.message;
					} else {
						localStorageService.set('token', response.headers('token'));
						localStorageService.set('user', {
						    "id": response.data.user.id,
						    "firstname": response.data.user.firstname,
						    "lastname": response.data.user.lastname,
						    "email": response.data.user.email,
						    "role": response.data.user.role,
						    "created": response.data.user.created,
						});
						AuthenticationService.isLogged = true;
                    	$rootScope.isLogged = true;
						$rootScope.user = localStorageService.get('user');
						$location.path('/dashboard');
					}

				},	function (response){
					$location.path('/');
				}
			);
		};	
	}])
	.controller('DashboardController', ['$scope', '$http', '$rootScope', '$location', '$timeout', function($scope, $http, $rootScope, $location,$timeout){
		$http.get($rootScope.appURL + '/users.json').
			then(function(response){
				$scope.Post = response.data.posts;
			}
		);
	
		$timeout(function () { 
			$rootScope.Message = null; 
		}, 3000); 
	}])
	.controller('LogoutController', ['$scope', '$http', '$rootScope', '$location','localStorageService', function($scope, $http, $rootScope, $location,localStorageService){
		$http.get($rootScope.appURL + '/users/logout.json').
			then(function(response){
				localStorageService.remove('user');
				localStorageService.remove('token');
				$rootScope.isLogged = false;
				delete $rootScope.user;
				$location.path('/');
			});
	}])
	.controller('ProfileController', ['$scope', '$http','$location', '$rootScope', 'localStorageService', function($scope, $http, $location, $rootScope, localStorageService){
		$scope.update_account_info = function(isValid){
			if (!isValid) return;
			var _data = {};
			_data.User = $scope.user;
			$http.put($rootScope.appURL + '/users/' + $scope.user.id + '.json', _data)
				.then(function(response){
					if( response.data.message.type == 'error' ){
						$scope.Message = response.data.message;
					} else {
						localStorageService.set('user', {
						    "id": response.data.user.id,
						    "firstname": response.data.user.firstname,
						    "lastname": response.data.user.lastname,
						    "email": response.data.user.email,
						    "role": response.data.user.role,
						    "created": response.data.user.created,
						});
						$rootScope.user = localStorageService.get('user');
						$location.path('/dashboard');
					}

				},	function (response){
					$location.path('/');
				}
			);
		};

		$scope.change_password = function(isValid){
			if(!isValid) return;
			var _data = {};
			_data.user = $scope.user;
			$rootScope.Message = null;
			if($scope.user.password === $scope.user.confirmpassword){
				$http.post($rootScope.appURL + '/users/change_password.json', _data).then(function(response){
					$rootScope.Message = response.data.message;
					if( response.data.message.type == 'success' ){
						$scope.user.currentpassword = null;
						$scope.user.password = null;
						$scope.user.confirmpassword = null;
					    $location.path('/dashboard');
					}
				});
			} else { 
				$rootScope.Message = {
					'type': 'error',
					'text': 'New Passowrd should match with confirm password'
				};
			}
		};

	}])
	.controller('PostListController', ['$scope', '$http','$location', '$rootScope', 'localStorageService', 'paginateSvr',function($scope, $http, $location, $rootScope, localStorageService, paginateSvr){
		$http.get($rootScope.appURL + '/users/posts_list.json').
			then(function(response){
				$scope.posts = response.data.posts;
				$scope.paging = response.data.paging;
			}
		);

		$scope.pageChanged = function () {
		   	paginateSvr.getData({
		      	params: {
		        	page: $scope.paging.page
		      	}
		   	}).then(function(response){
		   		$scope.posts = response.data.posts;
				$scope.paging = response.data.paging;
		   	});
		};
	}]);
