

bibleAPIApp.service('bibleAPIService', [function(){

    var rootUrl = 'http://www.esvapi.org/v2/rest';
    var apiKey = 'REMOVED';

    var self = this;
    self.reference = '';
    self.passage = '';

    self.xhttp = new XMLHttpRequest();


    self.getVerses = function(searchReference, onComplete){

        self.reference = searchReference;
        searchReference = searchReference.replace(' ', '+');

        self.xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                //  this is outside of the angular context, which is why I need to later call $scope.$apply in order for the change to propagate to angular

                //self.xmlParser = getXMLParser(this.responseText);

                //var reference = retrieveReference();
                var passage = retrievePassage(this.responseText);

                //angular.copy(passage, self.passage);
                //self.passage = passage;

                onComplete(self.reference, passage);

            }
        };

        self.xhttp.open("GET", rootUrl + '/passageQuery?key=' + apiKey + '&passage=' + searchReference, true);
        self.xhttp.send();


    }

    var retrievePassage = function(responseText){

        //  so I thought that I could use the XML parser for this, but that's not working properly, I think because the xml coming back from the Bible API isn't formatted properly

        var deleteUpToIndex = responseText.indexOf('</span>');
        var stringContainsPassage = responseText.substr(deleteUpToIndex, responseText.length);

        var deleteAfterIndex = stringContainsPassage.indexOf('(<a');
        stringContainsPassage = stringContainsPassage.substr(0, deleteAfterIndex)


        var arrayOfVerses = stringContainsPassage.split('</span>');

        for(i = 0; i < arrayOfVerses.length; i++) {
            var currVerse = arrayOfVerses[i];

            console.log('before: ' + currVerse);

            currVerse = removeFormatters(currVerse);
            currVerse = removeTagAndOnwards(currVerse);
            currVerse = putExtraSpacingAtEnd(currVerse);

            arrayOfVerses[i] = currVerse;
        }

        return arrayOfVerses.join(' ');

    }

    var removeFormatters = function(currVerse){

        //  double and single quotes
        currVerse = currVerse.replace(/&#8220;/g, '"');
        currVerse = currVerse.replace(/&#8221;/g, '"');
        currVerse = currVerse.replace(/&#8216;/g, '\'');
        currVerse = currVerse.replace(/&#8217;/g, '\'');

        //  some type of cross-reference <span> tag that just gets in the way.  I don't know what woc stands for
        currVerse = currVerse.replace('<span class="woc">', '');

        //  small but all capitalized word
        currVerse = currVerse.replace('<span class="small-caps">', '');


        //  remove <h[1-6]> tags - these are section headings
        currVerse = removeUnwantedMiddleofString(currVerse, '<h', '</h', 6);

        //  Revelation 1:4,5 issue where new paragraph starts but the verse doesn't end
        currVerse = removeUnwantedMiddleofString(currVerse, '</p>', '">', 2, '<br />');

        //  remove header text from the start of the string
        currVerse = removePartialHeader(currVerse);

        return currVerse;
    }

    var removeUnwantedMiddleofString = function(currVerse, startingWith, endingWith, charsToRemoveAtEndOfSubStr, replacement){
        //  startingWith - the string that is the start of the substring to remove
        //  endingWith - the string that is the end of the substring to remove
        //  charsToRemoveAtEndOfSubStr - the # of characters that should be removed starting from the endingWith index
        //  replacement - a string to replace the removed substring with

        if(!replacement){ replacement = '';}

        var indexStartOfStrToRemove = currVerse.indexOf(startingWith);
        if(indexStartOfStrToRemove > -1){
            var subStrToRemoveAndOnwards = currVerse.substr(indexStartOfStrToRemove + 1);
            var indexEndOfSubStrToRemove = subStrToRemoveAndOnwards.indexOf(endingWith);

            var lastPartOfString = subStrToRemoveAndOnwards.substr(indexEndOfSubStrToRemove + charsToRemoveAtEndOfSubStr);

            //  redefine currVerse as everything before and after the <p> tag section
            currVerse = currVerse.substr(0, indexStartOfStrToRemove) +
                replacement + lastPartOfString;

        }

        return currVerse;
    }

    var removePartialHeader = function(currVerse){

        var indexHeaderClose = currVerse.indexOf('</h');
        if(indexHeaderClose > -1){
            currVerse = currVerse.substr(indexHeaderClose + 6)
        }

        return currVerse
    }

    var removeTagAndOnwards = function(currVerse){

        //  prevent <br /> and indents from being removed
        currVerse = currVerse.replace('<br />', 'LNBR');
        currVerse = currVerse.replace('<span class="indent">', ' &nbsp; &nbsp; &nbsp; ');

        //  remove any content after a <
        var deleteAfterIndex = currVerse.indexOf('<');
        if (deleteAfterIndex > -1) {

            currVerse = currVerse.substr(0, deleteAfterIndex)
        }

        //  restore the <br />
        currVerse = currVerse.replace(/LNBR/g, '<br />');


        //  remove blank space before and after
        currVerse = currVerse.trim();

        return currVerse;
    }

    var putExtraSpacingAtEnd = function(currVerse){
        //  check for periods and question marks, in which case I like to have two spaces at the end of a sentence

        var arrTwoSpacesGoAfterTheseChars = '.?'.split('');
        var arrLastTwoChars = [
            currVerse[currVerse.length - 1],
            currVerse[currVerse.length - 2]
        ];

        var noExtraSpaceNecessary = arrLastTwoChars.every(function(char){
            return !arrTwoSpacesGoAfterTheseChars.includes(char);
        })

        //  if period/question mark is either the last or penultimate character, then add an extra space at the end
        if(!noExtraSpaceNecessary
        //&& i < arrayOfVerses.length - 1  doesn't always end up being the last part of the verse
        ){
            currVerse += '&nbsp;';
        }

        return currVerse;
    }

    //var getXMLParser = function(xml){
    //
    //    var xmlDoc;
    //    if (window.DOMParser)
    //    {
    //        var parser = new DOMParser();
    //        xmlDoc = parser.parseFromString(xml, "text/xml");
    //    }
    //    else // Internet Explorer
    //    {
    //        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    //        xmlDoc.async = false;
    //        xmlDoc.loadXML(xml);
    //    }
    //
    //    return xmlDoc;
    //}

    //var retrieveReference = function(){
    //
    //    var stringContainsReference = self.xmlParser.getElementsByTagName("h2")[0].innerHTML.toString();
    //    var removeFromIndex = stringContainsReference.indexOf('<object');
    //
    //    var reference = stringContainsReference.substr(0, removeFromIndex).trim();
    //
    //    return reference;
    //
    //}


}])
