(function($){

	function findProperty(soureceObj, property, callback){
		if(soureceObj[property]){
			soureceObj[property] = callback(soureceObj[property]);
		}
		else{
			soureceObj.watch(property, function(property, oldvalue, newValue){
				return callback(newValue);
			});
		}
	}
	
	findProperty(window, 'Backbone', onBackboneFind);
	function onBackboneFind(_Backbone){
		findProperty(_Backbone, 'View', onViewFind);
		return _Backbone;
	}
	function onViewFind(_View){
		findProperty(_View, 'extend', onViewExtendFind);
		return _View;
	}
	function onViewExtendFind(_extend){
		return wrappBB(_extend);
	}

	function wrappBB(_viewExtend){
	    var newExtend = function (protoProps, classProps) {
	    	var url;
	    	var _init = protoProps.initialize;
	    	var newInit = function(){
	    		var self = this;
				_init && (self = _init.apply(this, arguments));
				this.$el && this.$el.attr('view-url', url);
				if(Object.observe){
					Object.observe(this, function(changes){
						var eleProp = _.filter(changes, function(prop){ return prop.name == "$el"; })[0];
						if(!eleProp) return;
						eleProp.object.$el.attr('view-url') ||
						eleProp.object.$el.attr('view-url', eleProp.oldValue.attr('view-url'));
					}, ["update"]);
				}
				return self;
	    	};
	    	protoProps.initialize = newInit;
	    	try{
	    		throw new Error("inject.js");
	    	}
	    	catch(e){
	    		var urls = e.stack.split(' at ');
	    		url = urls.find(function(url){
	    			return url.indexOf('inject.js') == -1;
	    		});
	    	}
	        return _viewExtend.call(this, protoProps, classProps);
	    };
	    return newExtend;
	}	

})();