
import {AutoInput} from "./AutoInput"

(function (factory) {
	"use strict";
	if (typeof define==='function' && define.amd) {
		define(['jquery'], factory);
	}else if (typeof exports==='object' && typeof require==='function') {
		factory(require('jquery'));
	}else{
		factory(jQuery);
	}
}(function($, undefined) {
	"use strict";
	$.fn.AutoInput = function (obj, arg1, arg2) {
		var key = "autoinput", 
			el = this.first(),
			instance = el.data(key);
		if (instance===undefined) {
			el.data(key, new AutoInput(el, obj));
		}else if (obj==="trigger" && typeof arg1==="string") {
			switch (arg1) {
				case "limit.prev":
					instance.clientLimitPrevPage();
					break;
				case "limit.next":
					instance.clientLimitNextPage();
					break;
				case "limit.go":
					instance.clientLimitGoPage(arg2);
					break;
			}
		}
		return el;
	};
}));
