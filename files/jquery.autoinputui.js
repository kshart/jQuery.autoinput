import $ from 'jquery';
import AutoInput from './AutoInput';

$.fn.AutoInputUI = function (obj, arg1, arg2) {
	const key = "autoinput", 
		  autoinput = this.first(),
		  instance = autoinput.data(key);
	if (instance===undefined) {
		obj = (typeof obj==='object') ? obj : {};
		const autoinputEl = autoinput[0],
			  dropdown = $("[class=\"ai-dropdown\"]", autoinput),
			  dropdownEl = dropdown[0],
			  loadingElement = $('[data-ai-type="text"]', autoinput);
		let dropdownVisible = false,
			selectedID = -1;

		const isAutoinputChild = (node) => {
			if (node == undefined) return false;
			if (node == autoinputEl) return true;
			return isAutoinputChild(node.parentNode);
		};
		const dropdownHide = () => {
			if (!dropdownVisible) return;
			dropdownVisible = false;
			dropdown.css("visibility", "hidden");
			document.removeEventListener('click', click);
		};
		const dropdownShow = () => {
			if (dropdownVisible) return;
			dropdownVisible = true;
			dropdown.css("visibility", "visible");
			document.addEventListener('click', click);
		};
		const click = (e) => {
			if (isAutoinputChild(e.target)) {
				const itemType = e.target.getAttribute('data-ai-output-item');
				if (itemType==='button') {
					selectedID = e.target.getAttribute('data-value');
					autoinput.AutoInputUI('setInputValue', 'search', e.target.getAttribute('data-name'));
					dropdownHide();
				}
			}else{
				dropdownHide();
			}
		};

		$("[data-ai-name]", autoinput).on("focus", () => {
			if ($("[data-ai-output] *", autoinput).length>0) dropdownShow();
		});
		
		autoinput.data(key, new AutoInput(autoinput, {
			clientViewData(el, data) {
				obj.viewData(el, data);
				dropdownShow();
			},
			serverType:"remote",
			serverURL: obj.serverURL,
			serverMethod: obj.serverMethod,
			serverSendArgType:false,
			serverCacheActive:true,
			autoUpdate:true,
			clientAutoUpdateTimeoutMS:100,
			serverOnEndLoad() {
				loadingElement.removeClass('loading');
			},
			serverOnError() {
				loadingElement.removeClass('loading');
			},
			serverOnStartLoad() {
				loadingElement.addClass('loading');
			}
		}));
		
	}else if (obj==="setInputValue" && typeof arg1==="string" && (
			  typeof arg2==="string" ||
			  typeof arg2==="boolean" ||
			  typeof arg2==="number")) {
		instance.setInputValue(arg1, arg2);
	}
	return autoinput;
};
/*
$('#autoinput').AutoInputUI({
	viewData(el, data) {
		let htmlStr = '';
		for(let i in data) {
			htmlStr += '<li class="ai-dropdown-item" data-ai-output-item="button" data-value="'+data[i].id+'" data-name="'+data[i].value+'"><p class="caption">'+data[i].value+'</p><p class="description">Индекс: <strong>'+data[i].index+'</strong></p></li>';
		}
		$(el).html(htmlStr);
	},
	serverURL:"autocomplete",
	serverMethod:"GET"
});*/