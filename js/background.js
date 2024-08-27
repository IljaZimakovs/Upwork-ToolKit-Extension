var tabId;
var pathToFile;
var fileSaveName;
var intervalRefresh;
var intervalDownload;
var lastDownload;
var lastRefresh;
var pausedDownloading;
var reloading = false;
var savingRightNow = false;
var visibleDownload = 0;
var visibleRefresh = 0;
var currentIndex = 0;
var urlArray = [];

// Load URLs from the JSON file
function loadURLs() {
    const urlFilePath = "C:/Users/admin/Downloads/upwork/project_urls.json";

    fetch(urlFilePath)
        .then(response => response.json())
        .then(data => {
            urlArray = data.urls || []; // Assuming the JSON file has a "urls" array

            if (urlArray.length === 0) {
                console.warn("No URLs found in the JSON file.");
            } 
            // else {
            //     urlArray.reverse(); // Reverse the array
            // }
        })
        .catch(error => {
            console.error("Error loading URLs from JSON file:", error);
        });
}

// Call this function to load URLs when the extension is initialized

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        loadURLs();
        if (request.type == 'load') {
            var obj = { tabId: tabId, pathToFile: pathToFile, fileSaveName: fileSaveName, intervalRefresh: intervalRefresh, intervalDownload: intervalDownload, visibleDownload: visibleDownload, visibleRefresh: visibleRefresh, pausedDownloading: pausedDownloading }
            sendResponse({ data: obj })
        } else if (request.type == 'update') {
            loadURLs();
            currentIndex = 0;
            tabId = request.data.tabId;
            pathToFile = request.data.pathToFile;
            fileSaveName = request.data.fileSaveName;
            intervalRefresh = request.data.intervalRefresh;
            intervalDownload = request.data.intervalDownload;
            visibleRefresh = intervalRefresh / 1000;
            sendResponse({ state: "done" });
        } else if (request.type == 'startSaving') {
            loadURLs();
            if (!savingRightNow) {
                if (intervalRefresh != 0) {
                    setTimeout(Refresh, intervalRefresh)
                }
            }
        } else if (request.type == 'pauseSaving') {
            pauseSaving()
        } else if (request.type == 'resumeSaving') {
            loadURLs();
            currentIndex = 0;
            resumeSaving()
        }
    })

chrome.tabs.onRemoved.addListener(function (tabIdClose) {
    if (tabIdClose == tabId) {
        console.warn("tab Closed resetting .. ")
        intervalDownload = 0;
        intervalRefresh = 0;
        visibleDownload = 0;
        visibleRefresh = 0;
    }

})

chrome.downloads.onDeterminingFilename.addListener(function (item, suggest) {
    if (item.byExtensionName == "Autosave webpage") {
        var distination = fileSaveName ? pathToFile ? pathToFile + fileSaveName : fileSaveName : "autosave.html";
        suggest({ filename: distination, conflictAction: 'overwrite' });
    }
});
// function StartSaving() {
//     if (!pausedDownloading && intervalDownload != 0 && !reloading) {
//         savingRightNow = true;
//         //clear previous download entry
//         chrome.downloads.erase({query:[fileSaveName ]},function (arrIds){ } )
//         saveHTML(fileSaveName, pathToFile);
//         visibleDownload = intervalDownload /1000;
//         toFront({type:"download",interval:visibleDownload})
//         //toFront lastDownload
//     }else{
//          console.log("passed saving")
//     }
//     setTimeout(StartSaving, intervalDownload)
// }
function Refresh() {
    if (!pausedDownloading && intervalRefresh != 0 && !reloading) {
        reloading = true;

        // Check if we have reached the end of the urlArray
        if (currentIndex < urlArray.length) {
            chrome.tabs.update(tabId, { url: urlArray[currentIndex] }, function() {
                // Delay the saving of the HTML by 2 seconds after the page is refreshed
                setTimeout(function() {
                    saveHTML(fileSaveName, pathToFile);

                    // Move to the next URL
                    currentIndex++;

                    // Set reloading to false after the save is completed
                    reloading = false;

                    // If there are more URLs, schedule the next refresh
                    if (currentIndex < urlArray.length) {
                        setTimeout(Refresh, intervalRefresh);
                    } else {
                        console.log("Finished looping through all URLs.");
                    }
                }, 3000); // 2000 milliseconds = 2 seconds
            });

            visibleRefresh = intervalRefresh / 1000;
            toFront({type: "refresh", interval: visibleRefresh});
        }
    }
}



chrome.tabs.onUpdated.addListener(function (tabIdChanged, changeInfo, tab) {
    // console.log(tabIdChanged + "tabIdChanged")
    //console.log(changeInfo)
    if (tabId == tabIdChanged &&
        changeInfo.url === undefined && changeInfo.status == "complete") {
        reloading = false;
    }
});

function pauseSaving() {
    pausedDownloading = true;
}
function resumeSaving() {
    pausedDownloading = false;
}
function setLastRefresh() { }
function setLastSave() { }

function random() {
    return Math.ceil(Math.random() * 6000)
}

function saveHTML(fileName, path) {
    chrome.tabs.executeScript(tabId, {
        code: "document.getElementsByTagName('html')[0].innerHTML;"
    }, function (res) {
        if (chrome.runtime.lastError) {
            console.warn("Whoops.. " + chrome.runtime.lastError.message);
        } else {
            // Define the destination for the HTML file
            var distination = fileName ? (path ? path + fileName : fileName) : "autosave.html";
            console.log(distination);
            var fileHTML = res[0];
            path = path ? path.replace(/\\/ig, "\/") : "";

            // Save the HTML content
            chrome.downloads.download({
                url: "data:text/html," + encodeURIComponent(fileHTML),
                filename: distination,
                conflictAction: "overwrite"
            });

            // Save the URL to the text file (always overwrite)
            chrome.tabs.get(tabId, function (tab) {
                var url = tab.url;
                var urlText = "URL: " + url;
                var urlFilePath = "upwork/saved_urls.txt"; // Will be saved in the Downloads/upwork/ directory

                // Create a data URL for the text file content
                chrome.downloads.download({
                    url: "data:text/plain," + encodeURIComponent(urlText),
                    filename: urlFilePath,
                    conflictAction: "overwrite"
                });
            });
        }
    });
}

function toFront(data, callback) {
    chrome.runtime.sendMessage(data, function (response) {
        if (typeof callback === "function") {
            callback(response)
        }
    });
}


renderDownloadTimer();
renderRefreshTimer();
function renderDownloadTimer() {
    if (visibleDownload > 0) {
        visibleDownload--;
    }
    setTimeout(renderDownloadTimer, 1000)
}
function renderRefreshTimer() {
    if (visibleRefresh > 0) {
        visibleRefresh--;
        var mins = toMinutes(visibleRefresh);
        var secs = visibleRefresh % 60;
    }
    setTimeout(renderRefreshTimer, 1000)
}
function toMinutes(num) {
    return Math.floor(num / 60)
}
function toSeconds(num) {
    return Math.floor(num / 60)
}