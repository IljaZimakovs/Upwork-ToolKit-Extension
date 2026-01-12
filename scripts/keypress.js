/*Copyright (c) 2024 ksoft https://www.dummysoftware.com*/var keyPressManager={tabId:null,lastSendMessageDate:null,onKeyPress:function(e){var o=10,a=new Date;3<(o=null!=keyPressManager.lastSendMessageDate?(a-keyPressManager.lastSendMessageDate)/1e3:o)&&(keyPressManager.lastSendMessageDate=a,e=e||window.event,chrome.runtime.sendMessage({tabId:keyPressManager.tabId,action:"resetInterval"}))},click:function(e){var o=null;try{var a,o=0==e.indexOf("document.")?(a=e.replace(/"/g,"'"),console.log("Auto command."),setTimeout(a,100),null):(console.log("Auto click: "+e),document.querySelector(e))}catch(e){}null!=o&&o.click()},playSound:function(e){var o=new Audio;return o.src=e,o.play()},play:function(o){var e=keyPressManager.playSound(o);void 0!==e&&e.then(e=>{console.log("Playing notification sound "+o)}).catch(e=>{console.warn(`Unable to play notification sound ${o}
`+e),keyPressManager.modal("Easy Auto Refresh: Notification Sounds","Please click the button below to enable sound notifications in this tab.","Enable Sound",function(){return keyPressManager.playSound(o),!0})})},modal:function(e,o,a,n){let t=document.getElementById("easy-auto-refresh-modal");function s(){n(t)&&(localStorage["easy-auto-refresh-modal"]="false",document.body.removeChild(t))}t||"false"==localStorage["easy-auto-refresh-modal"]||((t=document.createElement("div")).innerHTML=`
            <div id="easy-auto-refresh-modal" class="modal fade" style="font-family: sans-serif; font-size: 13px; position: absolute; top: 0; left: 0; border-radius: 5px; border: 1px solid #c0c0c0; background: white; opacity: 0.95;" id="modal-sound-notification" tabindex="-1" role="dialog" aria-labelledby="modal-sound-notification-label" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content" style="">
                        <div class="modal-header" style="font-size: 15px; background: #fff;">
                            <div class="modal-title" id="modal-sound-notification-label" style="padding: 10px;">
                                ${e}
                                <div id="btnX" class="close" style="float: right; font-size: 16px; cursor: pointer;">&times;</div>
                            </div>
                        </div>
                        <div class="modal-body" style="padding: 0 10px 0 10px;">
                            ${o}
                            <hr/>
                        </div>
                    </div>
                    <div class="modal-footer" style="background: #f0f0f0;">
                        <div style="padding: 10px;">
                            <div style="float: left; margin-right: 8px;">
                                <button id="btnPrimary" type="button" class="btn btn-secondary" data-dismiss="modal" style="background: cornflowerblue; color: white; border-radius: 5px; padding: 3px; cursor: pointer;">
                                    ${a}
                                </button>
                            </div>
                            <div id="btnClose" class="btn btn-secondary close" data-dismiss="modal" style="color: black; margin-top: 6px; float: right; cursor: pointer;">
                                Dismiss
                            </div>
                            <div style="clear: both;"></div>
                        </div>
                    </div>
                </div>
            </div>`,t.querySelector("#btnPrimary").onclick=function(){n(t)&&document.body.removeChild(t)},t.querySelector("#btnX").onclick=s,t.querySelector("#btnClose").onclick=s,document.body.appendChild(t))},remove:function(){document.removeEventListener("keypress",keyPressManager.onKeyPress)},setup:function(e){keyPressManager.tabId=e,keyPressManager.remove(),document.addEventListener("keypress",keyPressManager.onKeyPress)}};