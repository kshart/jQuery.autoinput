import $ from 'jquery'

const DEFAULTS = {
	serverType:"remote",
	serverURL:"",
	serverMethod:"GET",
	serverSendArgType:false,
	autoUpdate:true,
	cacheActive:false
};
const noop = () => {};

class AutoInput {
	constructor(el, options) {
		var val = Object.assign({}, DEFAULTS, options);
		
		this.beforeUpdateTimerID;
		this.lastRequest;
		this.el = el;
		this.element = el[0];
		this.elInputs = $("[data-ai-name]", el);
		this.elOutput = $("[data-ai-output]", el).first();
		this.elLimit = $("[data-ai-limit]", el).first();
		this.elLimitPage = $("[data-ai-limit-page]", el);
		this.elLimitPageCount = $("[data-ai-limit-page-count]", el);
		this.elLimitPrev = $("[data-ai-limit-prev]", el);
		this.elLimitNext = $("[data-ai-limit-next]", el);
		this.clientLimit = {
			pageCount:1,
			page:1,
			itemsOnPage:(typeof val.clientLimitViewCount==="number") ? val.clientLimitViewCount : 0
		};
		this.clientAutoUpdateTimeoutMS = (typeof val.clientAutoUpdateTimeoutMS==="number") ? val.clientAutoUpdateTimeoutMS : 1000;
		this.clientViewData = (typeof val.clientViewData==="function") ? val.clientViewData : noop;
		if (typeof val.clientLimitUpdate==="function") this.clientLimitUpdate = val.clientLimitUpdate;
		
		
		if (val.serverType==="local") {
			this.localRequest = val.localRequest;
		}else if (val.serverType==="remote") {
			this.server = {
				url:val.serverURL,
				method:val.serverMethod,
				sendArgType:val.serverSendArgType,
				cache:val.serverCacheActive===true,
				xhr:new XMLHttpRequest()
			};
			this.server.xhr.timeout = (typeof val.serverTimeoutMS==="number") ? val.serverTimeoutMS : 10000;

			if (typeof val.serverOnEndLoad==="function") {
				this.server.xhr.onload = () => {
					val.serverOnEndLoad();
					this.serverLoadedItems();
				};
			}else{
				this.server.xhr.onload = () => {this.serverLoadedItems();};
			}

			if (typeof val.serverOnStartLoad==="function") {
				this.server.xhr.onloadstart = () => {val.serverOnStartLoad();};
			}
			if (typeof val.serverOnProgressLoad==="function") {
				this.server.xhr.onprogress = (e) => {val.serverOnProgressLoad(e);};
			}
			if (typeof val.serverOnError==="function") {
				this.server.xhr.ontimeout = 
				this.server.xhr.onabort =
				this.server.xhr.onerror = () => {val.serverOnError();};
			}
		}
		
		if (val.autoUpdate) {
			$("[data-ai-name]", this.el).each((i, el) => {
				const tag = el.tag,
					  type = el.getAttribute("data-ai-type"),
					  bUpdate = () => this.beforeUpdate();
				switch(type) {
					case "text":
						if ("onpropertychange" in el) {
							el.onkeyup = el.oninput = bUpdate;
							el.onpropertychange = (event) => {if (event.propertyName==="value") bUpdate();};
							el.oncut = () => {setTimeout(bUpdate, 0);};
						}else{
							el.addEventListener("input", bUpdate);
						}
						return;
					case "radio":
					case "checkbox":
						el.addEventListener("change", bUpdate);
						return;
				}
			});
		}
		
		
		$("[data-ai-update]", el).each((i, element) => {
			element.addEventListener("click", () => this.update());
		});
	}
	setInputValue(name, value) {
		//name exploit?
		const inputElement = $('[data-ai-name="'+name+'"]', this.el);
		switch (inputElement.attr('data-ai-type')) {
			case 'radio':
			case 'checkbox':
				inputElement.attr('checked', value == true);
				return true;
			case 'text':
				inputElement.val(value);
				return true;
		}
	}
	clientLimitUpdate(el, limit) {
		this.elLimitPage.text(limit.page);
		this.elLimitPageCount.text(limit.pageCount);
		this.elLimitPrev.on("click", () => {this.clientLimitPrevPage();});
		this.elLimitNext.on("click", () => {this.clientLimitNextPage();});
	}
	clientLimitPrevPage() {
		if (this.lastRequest===undefined||
			this.clientLimit.page===1) return;
		--this.clientLimit.page;
		this.sendRequest(this.lastRequest);
	}
	clientLimitNextPage() {
		if (this.lastRequest===undefined||
			this.clientLimit.page===this.clientLimit.pageCount) return;
		++this.clientLimit.page;
		this.sendRequest(this.lastRequest);
	}
	clientLimitGoPage(page) {
		if (typeof page!=="number"||this.lastRequest===undefined) return;
		page = Math.ceil(page);
		if (this.clientLimit.page===page) return;
		this.clientLimit.page = page;
		
		if (this.clientLimit.page<1) {
			this.clientLimit.page = 1;
		}else if (this.clientLimit.page>this.clientLimit.pageCount) {
			this.clientLimit.page = this.clientLimit.pageCount;
		}
		this.sendRequest(this.lastRequest);
	}
	
	beforeUpdate() {
		if (this.beforeUpdateTimerID===undefined) {
			this.beforeUpdateTimerID = setTimeout(()=>this.update(), this.clientAutoUpdateTimeoutMS);
		}
	}
	update() {
		let request = {};
		this.beforeUpdateTimerID = undefined;
		this.clientLimit.page = 1;
		this.clientLimit.pageCount = 1;
		
		this.elInputs.each((i, el) => {
			const name = el.getAttribute("data-ai-name"),
				  type = el.getAttribute("data-ai-type");
			if (type==="radio"&&!el.checked) return; 
			switch(type) {
				case "text":
					return request[name] = {type:"text", value:el.value};
				case "radio":
					return request[name] = {type:"radio", value:el.getAttribute("data-ai-value")};	
				case "checkbox":
					return request[name] = {type:"checkbox", value:el.checked};
			}
		});
		this.lastRequest = request;
		this.sendRequest(request);
	}
	
	sendRequest(request) {
		if (this.server===undefined) {
			let limit;
			if (this.clientLimit.itemsOnPage!==0) limit = {
				itemsOnPage:this.clientLimit.itemsOnPage,
				page:this.clientLimit.page
			};
			let result = this.localRequest(request, limit);
			if (result.limit===undefined) {
				this.clientLimit.page = 1;
				this.clientLimit.pageCount = 1;
				this.clientLimit.itemsOnPage = 0;
			}else{
				this.clientLimit.page = result.limit.page;
				this.clientLimit.pageCount = result.limit.pageCount;
				this.clientLimit.itemsOnPage = result.limit.itemsOnPage;
			}
			if (this.elOutput[0]!==undefined) {
				this.clientViewData(this.elOutput[0], result.data);
				if (this.elLimit[0]!==undefined) this.clientLimitUpdate(this.elLimit[0], this.limit);
			}
			return;
		}
		//remote
		this.server.xhr.abort();
		
		var cacheRequestStr = "ai:"+this.server.url;
		if (this.server.cache) for(let i in request) {
			switch (request[i].type) {
				case "checkbox":
					cacheRequestStr += i+request[i].type+(request[i].value===true?"1":"0");
					break;
				case "text":
				case "radio":
				default:
					cacheRequestStr += i+request[i].type+request[i].value;
			}
		}
		if (this.clientLimit.itemsOnPage!==0 && this.server.cache) {
			cacheRequestStr += this.clientLimit.itemsOnPage+this.clientLimit.page+this.clientLimit.pageCount;
		}
		
		if (this.server.cache) {
			let cacheValue = JSON.parse(sessionStorage.getItem(cacheRequestStr));
			if (cacheValue!==null && cacheValue!==undefined && this.elOutput[0]!==undefined) {
				this.clientViewData(this.elOutput[0], cacheValue);
				if (this.elLimit[0]!==undefined) this.clientLimitUpdate(this.elLimit[0], this.clientLimit);
			}
		}
		
		if (this.server.method==="POST") {
			this.server.xhr.open("POST", this.server.url);
			var completeRequest = {};
			
			if (this.server.sendArgType) {
				let requestWithoutArgType = {};
				for(let i in request) {
					requestWithoutArgType[i] = {value:request.value};
				}
				completeRequest.data = requestWithoutArgType;
			}else{
				completeRequest.data = request;
			}
			if (this.clientLimit.itemsOnPage!==0) completeRequest.limit = this.clientLimit;
			this.server.xhr.send(JSON.stringify(completeRequest));
		}else{//GET
			var getStr = "?";
			if (this.server.sendArgType) {
				for(let i in request) {
					switch (request[i].type) {
						case "checkbox":
							getStr += encodeURIComponent(i)+"="+(request[i].value===true?"1&":"0&")+i+"type="+encodeURIComponent(request[i].type)+"&";
							break;
						case "text":
						case "radio":
						default:
							getStr += encodeURIComponent(i)+"="+encodeURIComponent(request[i].value)+"&"+i+"type="+encodeURIComponent(request[i].type)+"&";
					}
				}
			}else{
				for(let i in request) {
					switch (request[i].type) {
						case "checkbox":
							getStr += encodeURIComponent(i)+"="+(request[i].value===true?"1":"0")+"&";
							break;
						case "text":
						case "radio":
						default:
							getStr += encodeURIComponent(i)+"="+encodeURIComponent(request[i].value)+"&";
					}
				}
			}
			
			if (this.clientLimit.itemsOnPage!==0) {
				getStr += "page="+Math.ceil(this.clientLimit.page)+"&itemsonpage="+Math.ceil(this.clientLimit.itemsOnPage);
			}else{
				getStr = getStr.substr(0, getStr.length-1);
			}
			this.server.xhr.open("GET", this.server.url+getStr);
			this.server.xhr.send(null);
		}
	}
	serverLoadedItems() {
		var response;
		switch (this.server.xhr.responseType) {
			case "json":
				response = this.server.xhr.response;
				break;
			case "text":
			default:
				response = JSON.parse(this.server.xhr.response);
				break;
		}
		if (typeof response.limit==="object") {
			if (typeof response.limit.pageCount==="number"||
				typeof response.limit.page==="number"||
				typeof response.limit.itemsOnPage==="number") {
				this.clientLimit.pageCount = Math.ceil(response.limit.pageCount);
				this.clientLimit.page = Math.ceil(response.limit.page);
				this.clientLimit.itemsOnPage = Math.ceil(response.limit.itemsOnPage);
			}else{
				this.clientLimit.pageCount = 1;
				this.clientLimit.page = 1;
				this.clientLimit.itemsOnPage = 0;
			}
		}
		if (typeof response.items==="undefined") response.items = [];
		if (this.elOutput[0]!==undefined) {
			this.clientViewData(this.elOutput[0], response.items);
			if (this.elLimit[0]!==undefined) this.clientLimitUpdate(this.elLimit[0], this.clientLimit);
		}
		if (this.server.cache) {
			if (sessionStorage.length > 100) {
				for(let i=0, key; i<sessionStorage.length; ++i) {
					key = sessionStorage.key(i);
					if (key[0]!=="a" || 
						key[1]!=="i" || 
						key[2]!==":") continue;
					sessionStorage.removeItem(key);
				}
			}
			var requestStr = "";
			for(let i in this.lastRequest) {
				switch (this.lastRequest[i].type) {
					case "checkbox":
						requestStr += i+this.lastRequest[i].type+(this.lastRequest[i].value===true?"1":"0");
						break;
					case "text":
					case "radio":
					default:
						requestStr += i+this.lastRequest[i].type+this.lastRequest[i].value;
				}
			}
			if (this.clientLimit.itemsOnPage > 0) {
				requestStr += this.clientLimit.itemsOnPage+this.clientLimit.page+this.clientLimit.pageCount;
			}
			sessionStorage.setItem("ai:"+this.server.url+requestStr, JSON.stringify(response.items));
		}
	}
}

export default AutoInput;