/* --- Made by justgoscha and licensed under MIT license --- */

var app = angular.module('targetAutocomplete', []);

app.directive('targetAutocomplete', function(){
  var index = -1;

  return {
    restrict: 'E',
    scope: {
      targetSearchParam: '=ngModel',
      suggestions: '=data',
      onType: '=onType'
    },
    controller: function($scope, $element, $attrs){
      $scope.targetSearchParam;

      // with the searchFilter the suggestions get filtered
      $scope.searchFilter;

      // the index of the suggestions that's currently selected
      $scope.selectedIndex = -1;

      // set new index
      $scope.setIndex = function(i){
        $scope.selectedIndex = parseInt(i);
      }

      this.setIndex = function(i){
        $scope.setIndex(i);
        $scope.$apply();
      }

      $scope.getIndex = function(i){
        return $scope.selectedIndex;
      }

      // watches if the parameter filter should be changed
      var watching = true;

      // autocompleting drop down on/off
      $scope.targetCompleting = false;

      // starts autocompleting on typing in something
      $scope.$watch('targetSearchParam', function(){
        if(watching && $scope.targetSearchParam) {
          $scope.targetCompleting = true;
          $scope.searchFilter = $scope.targetSearchParam;
          $scope.selectedIndex = -1;
        }

        // function thats passed to on-type attribute gets executed
        if($scope.onType)
          $scope.onType($scope.targetSearchParam);
      });

      // for hovering over suggestions
      this.preSelect = function(suggestion){

        watching = false;

        // this line determines if it is shown 
        // in the input field before it's selected:
        //$scope.targetSearchParam = suggestion;

        $scope.$apply();
        watching = true;

      }

      $scope.preSelect = this.preSelect;

      this.preSelectOff = function(){
        watching = true;
      }

      $scope.preSelectOff = this.preSelectOff;

      // selecting a suggestion with RIGHT ARROW or ENTER
      $scope.select = function(suggestion){
        if(suggestion){
          console.log(suggestion);
        //  $scope.targetSearchParam = suggestion;
        //  $scope.searchFilter = suggestion;
        } else {
          console.log("not selected");
        }
        //watching = false;
        //$scope.targetCompleting = false;
        //setTimeout(function(){watching = true;},1000);
        //$scope.setIndex(-1);

      }

    },
    link: function(scope, element, attrs){

      var attr = '';

      // Default atts
      scope.attrs = {
        "placeholder": "start typing...",
        "class": "",
        "id": "",
        "inputclass": "",
        "inputid": ""
      };

      for (var a in attrs) {
        attr = a.replace('attr', '').toLowerCase();
        // add attribute overriding defaults
        // and preventing duplication
        if (a.indexOf('attr') === 0) {
          scope.attrs[attr] = attrs[a];
        }
      }

      if(attrs["clickActivation"]=="true"){
        element[0].children[0].children[0].onclick = function(e){
          if(!scope.targetSearchParam){
            scope.targetCompleting = !scope.targetCompleting;
            scope.$apply();
          }
        };
      }

      var key = {left: 37, up: 38, right: 39, down: 40 , enter: 13, esc: 27};

      element[0].addEventListener("keydown", function(e){
        var keycode = e.keyCode || e.which;

        switch (keycode){
          case key.esc:
            // disable suggestions on escape
            scope.targetSearchParam = "";
            scope.targetCompleting = false;
            scope.setIndex(-1);
            scope.$apply();
            e.preventDefault();
        }
      }, true);

      element[0].addEventListener("blur", function(e){
        // disable suggestions on blur
        // we do a timeout to prevent hiding it before a click event is registered
        setTimeout(function() {
          scope.select();
//          scope.targetCompleting = false;
          scope.$apply();
        }, 200);
      }, true);

      element[0].addEventListener("keydown",function (e){
        var keycode = e.keyCode || e.which;

        var l = angular.element(this).find('li').length;

        // implementation of the up and down movement in the list of suggestions
        switch (keycode){
          case key.up:    
 
            index = scope.getIndex()-1;
            if(index<-1){
              index = l-1;
            } else if (index >= l ){
              index = -1;
              scope.setIndex(index);
              scope.preSelectOff();
              break;
            }
            scope.setIndex(index);

            if(index!==-1)
              scope.preSelect(angular.element(angular.element(this).find('li')[index]).text());

            scope.$apply();

            break;
          case key.down:
            index = scope.getIndex()+1;
            if(index<-1){
              index = l-1;
            } else if (index >= l ){
              index = -1;
              scope.setIndex(index);
              scope.preSelectOff();
              scope.$apply();
              break;
            }
            scope.setIndex(index);
            
            if(index!==-1)
              scope.preSelect(angular.element(angular.element(this).find('li')[index]).text());

            break;
          case key.left:    
            break;
          case key.right:  
          case key.enter:  

            index = scope.getIndex();
            // scope.preSelectOff();
            if(index !== -1)
              scope.select(angular.element(angular.element(this).find('li')[index]).text());
            scope.setIndex(-1);     
            scope.$apply();

            break;
          case key.esc:
            // disable suggestions on escape
            scope.select();
            scope.setIndex(-1);
            scope.$apply();
            e.preventDefault();
            break;
          default:
            return;
        }

        if(scope.getIndex()!==-1 || keycode == key.enter)
          e.preventDefault();
      });
    },
    templateUrl: function(element, attr) {
      return 'views/templates/' + attr.templateUrl + '.html';
    }
  }
});

app.filter('targetHighlight', function ($sce) {

  return function (input, targetSearchParam) {

    if (targetSearchParam) {
      var words = targetSearchParam.split(/\ /).join('|'),
          exp = new RegExp("(" + words + ")", "gi");

      if (words.length) {
        input = $sce.trustAsHtml(input.replace(exp, "<span class=\"highlight\">$1</span>")); 
      }
    }

    return input;

  }

});

app.directive('targetSuggestion', function(){
  return {
    restrict: 'A',
    require: '^targetAutocomplete', // ^look for controller on parents element
    link: function(scope, element, attrs, autoCtrl){
      element.bind('mouseenter', function() {
        autoCtrl.preSelect(attrs['val']);
        autoCtrl.setIndex(attrs['index']);
      });

      element.bind('mouseleave', function() {
        autoCtrl.preSelectOff();
      });
    }
  }
});
