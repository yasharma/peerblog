(function() {
'use strict';

angular.module('app.directives', [])
    .directive('footer', function() {
        return {
            restrict: 'A',            
            templateUrl: "elements/footer.html",
            controller: ['$scope', '$filter', function ($scope, $filter) {
                // Your behaviour goes here :)
            }]
        };
    })
    .directive('header', function () {
        return {
            restrict: 'A',            
            //scope: {user: '='},
            templateUrl: "elements/header.html",
            controller: ['$scope', '$filter', function ($scope, $filter) {
                // Your behaviour goes here :)
            }]
        };
    })
    .directive('sidebar', function () {
        return {
            restrict: 'A',            
            //scope: {user: '='},
            templateUrl: "elements/sidebar.html",
            controller: ['$scope', 'RestSvr', '$location', function ($scope, RestSvr, $location) {
                // Your behaviour goes here :)
                $scope.search = function(isValid){
                    if(!isValid) return;
                    $location.path('/search').search('q', $scope.post.search);
                };

                RestSvr.get('categories/getByList').then(function(response){
                    $scope.categories = response.records;
                });

                $scope.viewByCategory = function(index){
                    $location.path('/category/' + angular.lowercase($scope.categories[index].Category.name));
                };
            }]
        };
    })
    .directive('adminHeader', function () {
        return {
            restrict: 'A',            
            //scope: {user: '='},
            templateUrl: "elements/admin/header.html",
            controller: ['$scope', '$filter', function ($scope, $filter) {
                // Your behaviour goes here :)
            }]
        };
    })
    .directive('adminSidebar', function () {
        return {
            restrict: 'A',            
            //scope: {user: '='},
            templateUrl: "elements/admin/sidebar.html",
            controller: ['$scope', '$filter', function ($scope, $filter) {
                // Your behaviour goes here :)
            }]
        };
    })
    .directive('navMenu', ['$location', function($location) {
        return function(scope, element, attrs) {
            var links = element.find('a'),
                currentLink,
                urlMap = {},
                activeClass = attrs.navMenu || 'active';

            for (var i = links.length - 1; i >= 0; i--) {
                var link = angular.element(links[i]);
                var url = angular.isUndefined(link.attr('href')) ? link.attr('ng-href'): link.attr('href');
                
                if (url.substring(0,1) === '#') {
                    urlMap[url.substring(1)] = link;
                } else if( url.substring(0,url.indexOf('/')) === '{{admin}}' ) {
                    urlMap[url.substring(url.indexOf('/'))] = link;
                } else {
                    urlMap[url] = link;
                }
            }
            scope.$on('$routeChangeStart', function() {
                var path = urlMap[$location.path()];
                links.parent('li').removeClass(activeClass);
                if (path) {
                    path.parent('li').addClass(activeClass);
                }
            });
        };
    }])
    .directive('setHeight', ['$window', function($window){
        return{
            restrict:'A',
            link: function(scope, element, attrs){
                element.css('min-height', ($window.innerHeight - 50) + 'px');
            }
        };
    }]);
}());