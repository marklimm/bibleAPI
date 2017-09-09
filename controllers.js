

bibleAPIApp.controller('homeController', ['$scope', 'bibleAPIService', '$sce', function ($scope, bibleAPIService, $sce) {


	String.prototype.replaceAt=function(index, replacement) {
		return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
	}


	var capitalizeFirstLetter = function(reference){
		
		var indexOfFirstChar = reference.search(/[a-z]/i)
		var capitalizedFirstLetter = reference[indexOfFirstChar].toUpperCase();
		
		return reference.replaceAt(indexOfFirstChar, capitalizedFirstLetter)
	}

    $scope.submit = function(){

		$scope.searchReference = capitalizeFirstLetter($scope.searchReference)
		
	
        bibleAPIService.getVerses($scope.searchReference, function(reference, passage){

            //  $scope.$apply() is necessary because this is called in the context of the xhttp.onreadystatechange event handler
            $scope.$apply(function(){

                $scope.referenceAndVerse = $sce.trustAsHtml(reference + ' - ' + passage);

            })

        });



    }

}]);

