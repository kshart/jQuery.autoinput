
import {AutoInput} from "./AutoInput"

	/*
	 * clientLimitViewCount: 0
	 * clientAutoUpdateTimeoutMS: 1000
	 * clientViewData(DOMElement, data:[{}, {}])
	 * clientLimitUpdate(DOMElement, limit:{page, pageCount, itemsOnPage})
	 * 
	 * serverType 'local'|'remote'
	 * localRequest(data, limit:{page, pageCount, itemsOnPage}|undefined)
	 * 
	 * serverURL: url
	 * serverMethod: 'GET'|'POST'
	 * serverTimeoutMS: 100000
	 * serverSendArgType true|false
	 * serverCacheActive: true:false
	 * serverOnEndLoad()
	 * serverOnStartLoad()
	 * serverOnProgressLoad(e)
	 * serverOnError()
	 * 
	 * autoUpdate true|false
	 * 
	 * $.fn.AutoInput('trigger', 'limit.prev'|'limit.next'|'limit.go', page)
	 * $.fn.AutoInput('setInputValue', name, e.target.getAttribute('value'));
	 * 
	 * 
	 */
	
(function (factory) {
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
		}else if (obj==="setInputValue" && typeof arg1==="string" && (
				  typeof arg2==="string" ||
				  typeof arg2==="boolean" ||
				  typeof arg2==="number")) {
			instance.setInputValue(arg1, arg2);
		}
		return el;
	};
}));
