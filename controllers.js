

bibleAPIApp.controller('homeController', ['$scope', 'bibleAPIService', '$sce', function ($scope, bibleAPIService, $sce) {

    $scope.submit = function(){

        bibleAPIService.getVerses($scope.searchReference, function(reference, passage){

            //  $scope.$apply() is necessary because this is called in the context of the xhttp.onreadystatechange event handler
            $scope.$apply(function(){

                $scope.referenceAndVerse = $sce.trustAsHtml(reference + ' - ' + passage);

            })

        });



    }

}]);

