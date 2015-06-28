var app = angular.module("githubApp", ["ngRoute", "ngCookies", "ui.router"]);
var apiURL = "https://api.github.com";

app.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $url){
    $url.otherwise("/login");
    $stateProvider.state("login", {
        url: "/login",
        templateUrl: "./views/login.html",
        controller: "loginController"
    }).state("home", {
        url: "/",
        templateUrl: "./views/main.html",
        controller: "mainController",
        abstract: true
    }).state("home.me", {
        url: "",
        templateUrl: "./views/me.html"
    }).state("home.settings", {
        url: "/settings",
        templateUrl: "./views/settings.html"
    }).state("home.repos", {
        url: "/repos",
        templateUrl: "./views/repos.html"
    }).state("gists", {
        url: "/gists",
        templateUrl: "./views/main/gists.html",
        controller: "gistsController"
    }).state("gists.me", {
        url: "/gists/me",
        templateUrl: "./views/gists/me.html"
    });
}]);

app.factory("authService", ["$http", "$cookieStore", "$rootScope", function($http, $cookie, $root){
    var service = {};

    service.login = function(usr, pwd, cb){
        $http.get(apiURL + "/user", {
            headers:{
                "Content-Type":"application/json",
                "Accept":"application/json",
                "Authorization":"Basic " + btoa(usr + ":" + pwd)
            }
        }).success(function(resp){
            cb(resp, null);
        }).error(function(err){
            cb(null, err);
        });
    };

    service.credit = function(usr, pwd){
        var auth = btoa(usr + ":" + pwd);

        $root.globals = {
            currUsr: {
                usr: usr,
                auth: auth
            }
        };

        $http.defaults.headers.common['Authorization'] = "Basic " + auth;
        $cookie.put("globals", $root.globals);
    };

    return service;
}]);

app.factory("gistService", ["$http", function($http){
    var service = {};

    service.mine = function(cb){
        $http.get(apiURL + "/gists").success(function(resp){
            cb(resp, null);
        }).error(function(err){
            cb(null, err);
        });
    };

    service.starred = function(cb){
        $http.get(apiURL + "/gists/starred").success(function(resp){
            cb(resp, null);
        }).error(function(err){
            cb(null, err);
        });
    };

    service.public = function(cb){
        $http.get(apiURL + "/gists/public").success(function(resp){
            cb(resp, null);
        }).error(function(err){
            cb(null, err);
        });
    };

    service.get = function(id, cb){
        $http.get(apiURL + "/gists/" + id).success(function(resp){
            cb(resp, null);
        }).error(function(err){
            cb(null, err);
        });
    };

    return service;
}]);

app.factory("ghService", ["$http", function($http){
    var service = {};

    service.self = function(cb){
        $http.get(apiURL + "/user").success(function(resp){
            cb(resp, null);
        }).error(function(err){
            cb(null, err);
        });
    };

    service.repos = function(cb){
        $http.get(apiURL + "/user/repos").success(function(resp){
            cb(resp, null);
        }).error(function(err){
            cb(null, err);
        });
    };

    return service;
}]);

app.controller("loginController", ["$scope", "$rootScope", "$location", "authService", function($scope, $root, $loc, auth){
    $scope.login = function(){
        $scope.loading = true;
        auth.login($scope.username, $scope.password, function(resp, err){
            if(!err){
                auth.credit($scope.username, $scope.password);
                $loc.path("/");
            } else{
                $scope.error = err;
                $scope.loading = false;
            }
        });
    };
}]);

app.controller("mainController", ["$scope", "ghService", function($scope, $gh){
    $gh.self(function(resp, err){
        if(!err){
            $scope.self = resp;
        } else{
            $scope.error = "Can't login: " + JSON.stringify(err);
        }
    });
    $gh.repos(function(resp, err){
        if(!err){
            $scope.repos = resp;
        } else{
            $scope.error = "Cant resolve repos: " + JSON.stringify(err);
        }
    });

    $scope.toggleSidebar = function(){
        $("body").toggleClass("menu-push-toright");
        $(".menu").toggleClass("menu-open");
        $("#toggle").toggleClass("active");
    };
}]);

app.controller("gistsController", ["$scope", "ghService", "gistService", function($scope, $gh, $gist){
    $gh.self(function(resp, err){
        if(!err){
            $scope.self = resp;
        } else{
            $scope.error = err;
        }
    });
    $gist.mine(function(resp, err){
        if(!err){
            $scope.mine = resp;
        } else{
            $scope.error = err;
        }
    });
    $scope.toggleSidebar = function(){
        $("body").toggleClass("menu-push-toright");
        $(".menu").toggleClass("menu-open");
        $("#toggle").toggleClass("active");
    };
}]);

app.run(["$rootScope", "$location", "$cookieStore", "$http", function($root, $loc, $cookie, $http){
    $root.globals = $cookie.get("globals") || {};

    if($root.globals.currUsr){
        $http.defaults.headers.common['Authorization'] = "Basic " + $root.globals.currUsr.auth;
    }

    $root.$on("$locationChangeStart", function(e, next, curr){
        if($loc.path() !== "/login" && !$root.globals.currUsr){
            $loc.path("/login");
        }

        /*
        * Need to rewrite this for effect


        var toggle = $("#toggle");
        if(toggle.hasClass("active")){
            $("body").toggleClass("menu-push-toright");
            $(".menu").toggleClass("menu-open");
            toggle.toggleClass("active");
        }*/
    });
}]);