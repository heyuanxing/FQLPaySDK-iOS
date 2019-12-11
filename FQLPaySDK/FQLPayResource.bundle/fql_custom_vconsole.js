function appFQLJSBridgeAdapter(methodName,jsonParams) {
    if(/wv_i_v2/i.test(navigator.userAgent)) {
        
        top.webkit.messageHandlers.FQL_JSBridge.postMessage({
                                                            funcName:methodName,
                                                            parameter:jsonParams
                                                            })
        
    } else {
        
        top.FQL_JSBridge[methodName]&top.FQL_JSBridge[methodName](jsonParams)
    }
    
}

function invokeJsApiLog(json) {
    
    console.log(json);
}


function fqlcustomCallBack(json) {
    
    console.log(json);
    var msg = '';
    if(json) {
        
        var str = JSON.stringify(json)
        var lenth = str.length<1000?str.length:1000;
        msg = str.substr(0, lenth);
    }
    
    
    setTimeout(function(){alert(msg);}, 0.1);
    
}

var myPlugin = new VConsole.VConsolePlugin('JSSDK', 'FQL JSSDK');
myPlugin.on('init', function() {
            
            });
myPlugin.on('renderTab', function(callback) {
            var html = '<div>JSAPI参数:<br><textarea type="text" id="params" style="width:95%;height:200px;background-color:#f1f1f1;"></textarea></br>JSAPI 名称:<br><textarea type="text" id="methodname" style="width:95%;height:40px;background-color:#f1f1f1;"></textarea></br></div>';
            callback(html);
            });


myPlugin.on('addTool', function(callback) {
            var button = {
            name: '执行',
            onClick: function(event) {
            
            var methodname = document.getElementById('methodname').value;
            var paramsStr = document.getElementById('params').value;
            appFQLJSBridgeAdapter(methodname,paramsStr);
            
            }
            }
            var select = {
            name: '选择JS API',
            onClick: function (event) {
            
            var fql_js_api_selectMethod = function (v) {
            
            document.getElementById('methodname').value = v.name;
            document.getElementById('params').value = v.params;
            }
            window.fql_js_api_selectMethod = fql_js_api_selectMethod
            appFQLJSBridgeAdapter('showMethodList','')
            }
            }
            callback([button,select]);
            });
vConsole.addPlugin(myPlugin);

