var entuURL = 'https://ylikool.entu.ee/api2/';

function cl(data) {
    console.log(data);
}

function toLecture(data) {
    try        { var date = data.properties.kuupaev.values[0].value; }
    catch(err) { var date = ''; }

    try        { var description = data.properties.kirjeldus.values[0].value; }
    catch(err) { var description = ''; }

    try        { var title = data.properties.nimi.values[0].value; }
    catch(err) { var title = ''; }

    try        { var subject = data.properties.teema.values; }
    catch(err) { var subject = []; }

    try        { var author = data.properties.esitaja.values; }
    catch(err) { var author = []; }

    try        { var editor = data.properties.toimetaja.values; }
    catch(err) { var editor = []; }

    try        { var music = data.properties.muusika.values; }
    catch(err) { var music = []; }

    try        { var sound = data.properties.heli.values; }
    catch(err) { var sound = []; }

    try        { var other = data.properties.teised.values; }
    catch(err) { var other = []; }

    try        { var link = data.properties.link.values[0].value; }
    catch(err) { var link = ''; }

    var item_subject = [];
    for(u in subject) { item_subject.push(subject[u].value); }

    var item_author = [];
    for(a in author) { item_author.push(author[a].value); }

    var item_editor = [];
    for(e in editor) { item_editor.push(editor[e].value); }

    var item_music = [];
    for(m in music) { item_music.push(music[m].value); }

    var item_sound = [];
    for(s in sound) { item_sound.push(sound[s].value); }

    var item_other = [];
    for(o in other) { item_other.push(other[o].value); }

    return {
        id          : data.id,
        description : description,
        date        : date,
        year        : date.substring(0, 4),
        title       : title,
        subject     : item_subject.sort(),
        author      : item_author.sort(),
        editor      : item_editor.sort(),
        music       : item_music.sort(),
        sound       : item_sound.sort(),
        other       : item_other.sort(),
        link        : link,
    };

}

angular.module('ylikoolApp', ['ngRoute'])

    .config(['$routeProvider', '$sceDelegateProvider', function($routeProvider, $sceDelegateProvider) {
        $routeProvider
            .when('/ajatelg', {
                templateUrl : 'pages/history.html',
                controller  : 'listCtrl'
            })
            .when('/konelejad', {
                templateUrl : 'pages/authors.html',
                controller  : 'listCtrl'
            })
            .when('/teemad', {
                templateUrl : 'pages/subjects.html',
                controller  : 'listCtrl'
            })
            .when('/:id', {
                templateUrl : 'pages/lecture.html',
                controller  : 'lectureCtrl'
            })
            .otherwise({ redirectTo: '/ajatelg' });

        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            'http://heli.er.ee/**'
        ]);
    }])

    .controller('mainCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {
        $rootScope.url = $location.path().replace('/', '');
        $scope.nightTipNr = Math.floor((Math.random()*3)+1);
        $scope.pages = [
            {url: 'ajatelg',   title: 'Ajatelg'},
            {url: 'konelejad', title: 'Kõnelejad'},
            {url: 'teemad',    title: 'Teemad'},
        ];

        $scope.nightToggle = function () {
            $scope.nightMode = !$scope.nightMode;
            $scope.hideNightTip = true;
        }
    }])

    .controller('listCtrl', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
        $rootScope.url = $location.path().replace('/', '');

        if($rootScope.lectures || $rootScope.years || $rootScope.authors) {
            $scope.lectures = $rootScope.lectures;
            $scope.years    = $rootScope.years;
            $scope.authors  = $rootScope.authors;
            $scope.subjects = $rootScope.subjects;
        } else {
            $http({method: 'GET', url: entuURL+'entity', params: {definition: 'loeng'}}).success(function(data) {
                $rootScope.lectures_count  = data.result.length;
                $rootScope.lectures_loaded = 0;
                $rootScope.lectures        = [];
                $rootScope.years           = [];
                $rootScope.authors         = [];
                $rootScope.subjects        = [];

                for(i in data.result) {
                    $http({method: 'GET', url: entuURL+'entity-'+data.result[i].id}).success(function(data) {
                        var lecture = toLecture(data.result);

                        $rootScope.lectures.push(lecture);

                        if($rootScope.years.indexOf(lecture.year) == -1) {
                            $rootScope.years.push(lecture.year);
                            $rootScope.years = $rootScope.years.sort();
                            $rootScope.years = $rootScope.years.reverse();
                        }

                        for(a in lecture.author) {
                            if($rootScope.authors.indexOf(lecture.author[a]) == -1) {
                                $rootScope.authors.push(lecture.author[a]);
                                $rootScope.authors = $rootScope.authors.sort();
                            }
                        }

                        for(s in lecture.subject) {
                            if($rootScope.subjects.indexOf(lecture.subject[s]) == -1) {
                                $rootScope.subjects.push(lecture.subject[s]);
                                $rootScope.subjects = $rootScope.subjects.sort();
                            }
                        }

                        $scope.lectures = $rootScope.lectures;
                        $scope.years    = $rootScope.years;
                        $scope.authors  = $rootScope.authors;
                        $scope.subjects = $rootScope.subjects;

                        $rootScope.lectures_loaded += 1;
                    });
                };
            });
        }
     }])

    .controller('lectureCtrl', ['$rootScope', '$scope', '$http', '$routeParams', function($rootScope, $scope, $http, $routeParams) {
        $rootScope.url = $routeParams.id;

        $http({method: 'GET', url: entuURL+'entity-'+$routeParams.id}).success(function(data) {
            $scope.lecture = toLecture(data.result);
        });

        $scope.palyAudio = function(lecture) {
            $rootScope.current_lecture = lecture;
        }
    }]);
