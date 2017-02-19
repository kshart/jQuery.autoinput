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
	$("#autoinput").AutoInput({
		localRequest:function(e, limit) {
			var arr = [{value:1, tag:"isRed"}, {value:2, tag:"isBlue"}, {value:3, tag:"isGreen isBlue"}], result = [];
			if (limit===undefined) {
				if (e.color===undefined) return {data:arr};
				for(var i in arr) {
					if (arr[i].tag.indexOf(e.color.value)>=0) result.push(arr[i]);
				}
				return {data:result};
			}else{
				var limitRet = {
					itemsOnPage:limit.itemsOnPage,
					pageCount:1,
					page:1
				}
				if (typeof limit.page==="number") limitRet.page = limit.page;
				if (e.color===undefined) return {data:arr};
				for(var i in arr) {
					if (arr[i].tag.indexOf(e.color.value)>=0) result.push(arr[i]);
				}
				limitRet.pageCount = Math.ceil(result.length/limit.itemsOnPage);
				return {data:result.slice((limitRet.page-1)*limit.itemsOnPage, limitRet.page*limit.itemsOnPage), limit:limitRet};
			}
			
		},
		serverType:"remote",
		serverURL:"http://localhost:8383/file",
		serverMethod:"GET",
		serverSendArgType:false,
		serverOnStartLoad:function() {
			console.log("serverOnStartLoad");
		},
		serverOnEndLoad:function() {
			console.log("serverOnEndLoad");
		},
		serverOnProgressLoad:function(e) {
			console.log("serverOnProgressLoad", e);
		},
		serverOnError:function() {
			console.log("serverOnError");
		},
		clientLimitViewCount:1,
		clientAutoUpdate:true,
		clientAutoUpdateTimeoutMS:1000,
		clientViewData:function(el, data) {
			console.log("clientViewData", data);
			var arr = [];
			for(var i in data) {
				arr.push(data[i].value);
			}
			$(el).html(arr.join(", "));
		},
		params:{
			color:{
				type:"radio"
			},
			textinput:{
				type:"text"
			}
		}
	});
}));