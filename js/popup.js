var tabId;
var pathToFile;
var fileSaveName;
var intervalRefresh;
var intervalDownload;
/* var lastDownload;
var lastRefresh; */
var pausedDownloading;
var visibleDownload= 0 ; 
var visibleRefresh = 0 ; 

//load from background 
//on change save to background
$(document).ready(function () {
	//load from background 
	//expected errors tabs closed path invalid
	toBack({ type: 'load' }, function (response) { if (response.data.tabId) { loadOldData(response) } })
	assignEventListeners()

})

function assignEventListeners() {
	$(".upRight").click(function () {

		if ($(this).hasClass("red")) {
			pausedDownloading= false;
			toBack({ type: "resumeSaving" })

		} else {
			pausedDownloading = true;
			toBack({ type: "pauseSaving" })
			

		}
		$(this).toggleClass("red");
		$(this).find("#pause").text($(this).hasClass("red") ? "Resume" : "Pause");
		//change state
	})
	$("#addTab").click(function () {
		var query = { active: true, currentWindow: true };
		chrome.tabs.query(query, function (tab) {
		//	console.log(tab)
			tabId = tab[0].id;
			$("#tabTitle").text(tab[0].title);
			//TODO : should pause
		});
	});
	$("#btnUpdate").click(function () {
		pathToFile = $("#filePath").val();
		fileSaveName = $("#fileName").val();
		intervalRefresh = parseInt($("#refreshInterval").val() * 1000 * 60);
		intervalDownload = parseInt($("#saveInterval").val() * 1000);
		visibleRefresh = intervalRefresh/ 1000 ;
		var obj = { tabId: tabId, pathToFile: pathToFile, fileSaveName: fileSaveName, intervalRefresh: intervalRefresh, intervalDownload: intervalDownload }
		console.log("sending to back", obj);
		//send to background 
		toBack({ type: "update", data: obj }, function (res) {
			if (res.state == "done") {
				toBack({ type: "startSaving" });
			}
		})
	})

}

function loadOldData(response) {
	console.log(response)
	tabId = response.data.tabId;
	pathToFile = response.data.pathToFile;
	fileSaveName = response.data.fileSaveName;
	intervalRefresh = response.data.intervalRefresh;
	intervalDownload = response.data.intervalDownload;
	visibleDownload = response.data.visibleDownload;
	visibleRefresh = response.data.visibleRefresh;
	pausedDownloading = response.data.pausedDownloading;

	//put it to display
	chrome.tabs.get(parseInt(tabId), function (tab) {
		$("#tabTitle").text(tab.title);
	});
	$("#filePath").val(pathToFile);
	$("#fileName").val(fileSaveName);
	$("#refreshInterval").val(intervalRefresh / (60000));
	$("#saveInterval").val(intervalDownload / 1000);
	console.log(pausedDownloading)
	if (pausedDownloading) {
		$(".upRight").toggleClass("red");
	}
	$(".upRight").find("#pause").text($(".upRight").hasClass("red") ? "Resume" : "Pause");
}


function toBack(data, callback) {
	chrome.runtime.sendMessage(data, function (response) {
		if (typeof callback === "function") {
			callback(response)
		}
	});
}


chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		console.log("arequest ", request)
		if (request.type == 'download') {
			visibleDownload = request.interval;
		}else if (request.type == 'refresh'){
			visibleRefresh = request.interval;
		}
	}
)

renderDownloadTimer();
renderRefreshTimer();
function renderDownloadTimer(){
	if(visibleDownload > 0  && !pausedDownloading){
		visibleDownload -- ;
		$("#countDownDown").text(visibleDownload)
	}
	setTimeout(renderDownloadTimer , 1000)
}
function renderRefreshTimer(){
	if(visibleRefresh > 0  && !pausedDownloading){
		visibleRefresh -- ;
		var mins = toMinutes(visibleRefresh);
		var secs = visibleRefresh%60 ; 
		$("#countDownRefresh").text(mins +":"+secs)
	}
	setTimeout(renderRefreshTimer , 1000)
}
function toMinutes(num){
	return Math.floor(num/60)
}
function toSeconds(num){
	return Math.floor(num/60)
}