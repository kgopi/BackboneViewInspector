/**
 * Created by KGopi on 12/3/2015.
 */
(function($){

    window._cid = Math.floor(Math.random() * 26) + Date.now();
	!window.bvt && (window.bvt = {});
	if(!window.bvt.views){
        window.bvt.views = [];
        var _push = Array.prototype.push;
        window.bvt.views.push = function(){
            _push.apply(this, arguments);
			sendMessage(); // do notify
        }
        var _splice = Array.prototype.splice;
        window.bvt.views.splice = function(){
            _splice.apply(this, arguments);
			sendMessage(); // do notify
        }
    }

	document.addEventListener('SEND_VIEW_COUNT', function(eve){
		sendMessage();
	});

    function sendMessage(){
		var detail = {};
		detail[document.__bvtExtRoot._cid] = document.__bvtExtRoot.bvt.views.length;
		var event = new CustomEvent('SHOW_BANNER_TEXT', {detail : detail});
		document.__bvtExtRoot.document.dispatchEvent(event);
    }

	function isWindowAccessible(_win){
		try{
			_win.document;
		}
		catch (e){
			return false;
		}
		return true;
	}

	function setAppRoot(){
		var currentWindow = window;
		while(isWindowAccessible(currentWindow.parent) && currentWindow.parent != currentWindow){
			currentWindow = currentWindow.parent;
		}
		document.__bvtExtRoot = currentWindow;
	}
	setAppRoot();

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

	function onBackboneFind(_Backbone){
		findProperty(_Backbone, 'View', onViewFind);
		return _Backbone;
	}

	function onViewFind(_View){
		findProperty(_View, 'extend', onViewExtendFind);
		return _View;
	}

	function onViewExtendFind(_extend){
		_hackViewProps(Backbone.View);
		return wrapViewExtend(_extend);
	}

	function _hackViewProps(_View){
		var _remove = _View.prototype.remove;
		_View.prototype.remove = function(){
			var viewIndex = window.bvt.views.indexOf(window._cid + this.cid);
			if(viewIndex > -1){
				window.bvt.views.splice(viewIndex, 1);
				window != document.__bvtExtRoot && document.__bvtExtRoot.bvt.views.splice(viewIndex, 1);
			}
			return _remove.apply(this, arguments);
		};

		var _initialize = _View.prototype.initialize;
		_View.prototype.initialize = function(){
			var self = _initialize.apply(this, arguments);
			updateViewsList(this.cid);
			var url;
			try{
				throw new Error("inject.js");
			}
			catch(e){
				var urls = e.stack.split(' at ');
				url = urls.find(function(url){
                    // Expecting View object will be created via new operator
					return url.indexOf('inject.js') == -1 && url.indexOf("new ") == 0;
				});
			}
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
	}

	function wrapViewExtend(_viewExtend){
	    var newExtend = function (protoProps, classProps) {
	    	var url;
	    	var _init = protoProps.initialize;
            var newInit = function(){
	    		var self = this;
				_init && (self = _init.apply(this, arguments));
                updateViewsList(this.cid);
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

	function updateViewsList(viewId){
		var key = window._cid + viewId;
		var viewIndex = window.bvt.views.indexOf(key);
		if(viewIndex > -1){
			window.bvt.views[viewIndex] = key; // Need to update with view-object
			window != document.__bvtExtRoot && (document.__bvtExtRoot.bvt.views[viewIndex] = key); // Need to update with view-object
		}
		else{
			window.bvt.views.push(key);
			window != document.__bvtExtRoot && document.__bvtExtRoot.bvt.views.push(key);
		}
	}

	findProperty(window, 'Backbone', onBackboneFind);

})();