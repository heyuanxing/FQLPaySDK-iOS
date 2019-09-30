(function (exports) {
    if (typeof exports.LexinMonitor != 'undefined') {
        return;
    };
    var LexinMonitor = {};
    LexinMonitor.config = {
        api: {
            h5PerformanceLog: 'lxWebPerformanceLog',
            h5ErrorLog: 'lxWebErrorLog',
            h5ActionLog:'lxWebUserActionLog'
        },
        errorType: {
            h5_resource_error: 'h5_resource_error',
            h5_script_error: 'h5_script_error',
            h5_promise_error: 'h5_promise_error',
            h5_ajax_error: 'h5_ajax_error'
        },
        isFirstReport:true,
        bodyObserver: null,
        isReportPerformance: false,
        currUrl: null,
        bodyData: [],
        navigationStart: 0,
        isBindSpa: false,
        startTagTime: 0,
        endTagTime: 0,
        isReportPageStay:false,
        initTime:new Date().getTime(),
        reportInterval:null
    };
    LexinMonitor.firstScreenStart = function () {
        LexinMonitor.config.startTagTime = new Date().getTime();
    };
    LexinMonitor.firstScreenEnd = function () {
        LexinMonitor.config.endTagTime = new Date().getTime();
    };
    LexinMonitor.resetConfig = function () {
        LexinMonitor.config.isReportPerformance = false;
        LexinMonitor.config.bodyData = [];
        LexinMonitor.config.startTagTime = 0;
        LexinMonitor.config.endTagTime = 0;
        LexinMonitor.config.navigationStart = new Date().getTime();
        LexinMonitor.config.initTime = new Date().getTime();
        LexinMonitor.config.isReportPageStay = false;
        performance && typeof performance.clearResourceTimings != 'undefined' && performance.clearResourceTimings();
    };
    LexinMonitor.utils = {
        parseNumber:function (n) {
            if (n<0){
                return 0;
            }
            return Math.floor(n);
        },
        sizeOfByte:function (str) {
            var total = 0;
            var charCode;
            for(var i = 0, len = str.length; i < len; i++){
                charCode = str.charCodeAt(i);
                if(charCode <= 0x007f) {
                    total += 1;
                }else if(charCode <= 0x07ff){
                    total += 2;
                }else if(charCode <= 0xffff){
                    total += 3;
                }else{
                    total += 4;
                }
            }
            return total;
        },
        parseStr:function(str){
            if (!str){
                return;
            };
            return str.length>20000?str.substring(0,20000):str;
        },
        unicode2Chs:function (str) {
            if(!str){
                return;
            };
            str = LexinMonitor.utils.parseStr(str);
            var len = 1;
            var result = '';
            for (var i = 0; i < str.length; i=i+len) {
                len = 1;
                var temp = str.charAt(i);
                if(temp == '\\'){
                    if(str.charAt(i+1) == 'u'){
                        var unicode = str.substr((i+2),4);
                        result += String.fromCharCode(parseInt(unicode,16).toString(10));
                        len = 6;
                    }else{
                        result += temp;
                    }
                }else{
                    result += temp;
                }
            };
            return result;
        },
        getBusinessId:function () {
            var el = document.getElementsByTagName('lexin-apm')[0];
            if (el && el.getAttribute('business-id')){
                return el.getAttribute('business-id');
            };
            return '1001';
        },
        isDataURL: function(url){
            var pattern = /^data\:([^;]+)(;charset=[^;]+)?;base64,/i;

            pattern.lastIndex = 0;
            return pattern.test(url);
        }
    };
    LexinMonitor.handler = {
        errorHandler: function (e) {
            var data = {
                page_url: exports.location.href

            };
            if (e.error || (e.message && e.filename && e.lineno && e.colno) || e.stack) {
                data.error_type = LexinMonitor.config.errorType.h5_script_error;
                data.error_code = 'error_004';
                data.error_desc = typeof e.stack !='undefined' ? e.stack :(e.message + ' at ' + e.filename + ' line:' + e.lineno + ' col:' + e.colno);
            } else if (e.srcElement&&(e.target.href || e.target.src)) {
                data.error_type = LexinMonitor.config.errorType.h5_resource_error;
                data.error_desc = e.target.href || e.target.src;
                data.error_code = 'error_003';
            } else {
                data.error_type = LexinMonitor.config.errorType.h5_script_error;
                data.error_code = 'error_000';
                data.error_desc = (e.message || '') + ' at ' + (e.filename|| '') + ' line:' + (typeof e.lineno == 'undefined'?'':e.lineno) + ' col:' + (typeof e.colno == 'undefined'?'':e.colno);
            };
            if (data.error_type == LexinMonitor.config.errorType.h5_resource_error && typeof exports.webkit == 'undefined' ){
                return;
            };
            data.business_id = LexinMonitor.utils.getBusinessId();
            LexinMonitor.reportData({api: LexinMonitor.config.api.h5ErrorLog, type: 2, message: data});
        },
        promiseErrorHandler: function (e) {
            var data = {
                page_url: exports.location.href
            };
            data.error_type = LexinMonitor.config.errorType.h5_promise_error;
            data.error_code = 'error_005';
            data.error_desc = e.reason ? JSON.stringify(e.reason):'';
            LexinMonitor.reportData({api: LexinMonitor.config.api.h5ErrorLog, type: 2, message: data});
        },
        performanceHandler: function (type) {
            if (!exports.performance || !exports.performance.timing.loadEventEnd || LexinMonitor.config.isReportPerformance) {
                return;
            };
            var timing = exports.performance.timing;
            var white_screen_duration = (LexinMonitor.config.startTagTime?LexinMonitor.config.startTagTime:timing.domLoading) - timing.navigationStart;
            var first_screen_duration = calcFirstScreen();
            var info = LexinMonitor.getResourcePerformance();
            var navigasitonInfo = null;
            if (typeof performance != 'undefined' && typeof performance.getEntriesByType != 'undefined') {
                navigasitonInfo = performance.getEntriesByType('navigation')[0];
            };
            var data = {
                page_url: exports.location.href,
                complete_load_duration: LexinMonitor.utils.parseNumber(timing.loadEventEnd - timing.navigationStart),
                white_screen_duration: LexinMonitor.utils.parseNumber(white_screen_duration),
                first_screen_duration: LexinMonitor.utils.parseNumber(first_screen_duration),
                interactive_duration: LexinMonitor.utils.parseNumber(timing.domContentLoadedEventEnd - timing.navigationStart),
                stalled_duration: LexinMonitor.utils.parseNumber(timing.domainLookupStart - timing.navigationStart),
                redirect_duration: LexinMonitor.utils.parseNumber(timing.redirectEnd - timing.redirectStart),
                dns_duration: LexinMonitor.utils.parseNumber(timing.domainLookupEnd - timing.domainLookupStart),
                ip_connect_duration: LexinMonitor.utils.parseNumber(timing.connectEnd - timing.connectStart),
                first_data_duration: LexinMonitor.utils.parseNumber(timing.responseStart - timing.requestStart),
                final_data_duration: LexinMonitor.utils.parseNumber(timing.responseEnd - (timing.requestStart?timing.requestStart:timing.fetchStart)),
                dom_operate_duration: LexinMonitor.utils.parseNumber(timing.domComplete - timing.domLoading),
                res_load_duration: LexinMonitor.utils.parseNumber(info.duration),
                res_size: navigasitonInfo ? navigasitonInfo.transferSize : 0,
                res_info: info.list
            };
            if (data.white_screen_duration == 0 || data.first_screen_duration ==0){
                return;
            };
            if (!data.complete_load_duration || !data.dom_operate_duration || !data.interactive_duration || (data.white_screen_duration>=data.first_screen_duration)){
                data.desc = {
                    type:type,
                    timing:JSON.parse(JSON.stringify(timing)),
                    eventList:LexinMonitor.eventList?LexinMonitor.eventList:[],
                    referrer:typeof document == 'undefined'?'':document.referrer,
                    readyState:typeof document == 'undefined'?'':document.readyState,
                    bodyHeight:typeof document == 'undefined'?'':document.body.clientHeight
                };
            };
            LexinMonitor.config.isReportPerformance = true;
            LexinMonitor.config.isFirstReport = false;
            LexinMonitor.config.reportInterval && (clearInterval(LexinMonitor.config.reportInterval));
            LexinMonitor.reportData({api: LexinMonitor.config.api.h5PerformanceLog, type: 2, message: data});
            function calcFirstScreen() {
                var timing = exports.performance.timing;
                if (LexinMonitor.config.endTagTime) {
                    return (LexinMonitor.config.endTagTime - timing.navigationStart);
                };
                var firstScreen = timing.loadEventStart - timing.navigationStart;
                if (typeof exports.performance != 'undefined' && typeof exports.performance.getEntriesByName != 'undefined'){
                    try{
                        var iHeight = exports.innerHeight;
                        var iWidth = exports.innerWidth;
                        var imgList = document.querySelectorAll('img');
                        var loadEventDuration = timing.loadEventEnd - timing.navigationStart;
                        for (var i=0,j=imgList.length;i<j;i++){
                            var target = imgList[i];
                            if (typeof target.getBoundingClientRect != 'undefined' && target.src) {
                                var rectInfo = target.getBoundingClientRect();
                                if (rectInfo){
                                    var pageYOffset = exports.pageYOffset;
                                    var topH = rectInfo.top + pageYOffset;
                                    if (topH < iHeight && rectInfo.left >=0 &&rectInfo.left<iWidth){
                                        var perList = exports.performance.getEntriesByName(target.src);
                                        if (perList.length){
                                            var targetPer = perList[0];
                                            if (targetPer.fetchStart < loadEventDuration){
                                                firstScreen = targetPer.responseEnd;
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    }catch (e) {
                    }
                };
                return firstScreen;
            }
        },
        pageStayHandler:function (type) {
            if (location.href=='about:blank' || LexinMonitor.config.isReportPageStay){
                return;
            };
            LexinMonitor.config.isReportPageStay = true;
            var data = {
                page_url: exports.location.href,
                duration: new Date().getTime() - LexinMonitor.config.initTime,
                page_type:2
            };
            LexinMonitor.reportData({
                api:LexinMonitor.config.api.h5ActionLog,
                type:1,
                message:data
            });
        }
    };
    LexinMonitor.monitor = {
        eventMonitor: function () {
            LexinMonitor.eventList = LexinMonitor.eventList || [];
            exports.addEventListener && exports.addEventListener('DOMContentLoaded', function () {
                LexinMonitor.eventList.push('DOMContentLoaded');
            }, true);
            exports.addEventListener && exports.addEventListener('load', function () {
                LexinMonitor.eventList.push('load');
            }, true);
            exports.addEventListener && exports.addEventListener('beforeunload', function () {
                LexinMonitor.eventList.push('unload');
            }, true);
            exports.addEventListener && exports.addEventListener('unload', function () {
                LexinMonitor.eventList.push('unload');
            }, true);
        },
        errorMonitor: function () {
            exports.addEventListener && exports.addEventListener('error', this.handler.errorHandler, true);
            exports.addEventListener && exports.addEventListener('unhandledrejection', this.handler.promiseErrorHandler, true);
            exports.natvieConsoleError = exports.console.error;
            window.console.error = function (err) {
                LexinMonitor.handler.errorHandler(err);
                exports.natvieConsoleError.apply(exports.console,arguments);
            };
        },
        performanceMonitor: function () {
            exports.addEventListener && exports.addEventListener('load', function () {
                LexinMonitor.config.reportInterval = setInterval(function () {
                    if (typeof exports.performance != 'undefined' && exports.performance.timing && exports.performance.timing.loadEventEnd) {
                        LexinMonitor.handler.performanceHandler.call(LexinMonitor, 'load');
                    };
                },200);
            }, true);
            exports.addEventListener && exports.addEventListener('beforeunload', function () {
                LexinMonitor.handler.performanceHandler.call(LexinMonitor, 'beforeunload');
            }, true);
        },
        xhrMonitor: function () {
            if (!exports.XMLHttpRequest) {
                return;
            };

            exports.XMLHttpRequest.prototype.nativeSetRequestHeader = exports.XMLHttpRequest.prototype.setRequestHeader;
            exports.XMLHttpRequest.prototype.setRequestHeader = function(name,value){
                this.lx_monitor = this.lx_monitor || {};
                this.lx_monitor.header = this.lx_monitor.header || {};
                this.lx_monitor.header[name] = value;
                this.nativeSetRequestHeader.apply(this,arguments);
            };
            exports.XMLHttpRequest.prototype.nativeOpen = exports.XMLHttpRequest.prototype.open;
            exports.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
                this.lx_monitor = this.lx_monitor || {};
                this.lx_monitor._time_open = (new Date).getTime();
                this.lx_monitor._time_done = 0;
                this.lx_monitor._url= url.indexOf('http') == 0 ? url : (exports.location.origin + url);
                this.lx_monitor._method= method;
                this.nativeOpen.apply(this, arguments);
            };
            exports.XMLHttpRequest.prototype.nativeSend = exports.XMLHttpRequest.prototype.send;
            exports.XMLHttpRequest.prototype.send = function (data) {
                var q = "";
                if(data && typeof data === "object"){
                    try{
                        q = JSON.stringify(data);
                    }catch(e){}
                }
                this.lx_monitor._request_data = q;

                this.addEventListener('error', function (e) {
                    e.target.lx_monitor._time_done = (new Date).getTime();
                    e.target.handlerMonitor();
                });

                this.addEventListener('load', function (e) {
                    var target = e.target;
                    if (target.readyState === 4 && target.lx_monitor) {
                        target.lx_monitor._time_done = (new Date).getTime();
                        if (target.status !== 0) {
                            target.handlerMonitor();
                        }
                    }
                });

                this.nativeSend.apply(this, arguments);
            };
            exports.XMLHttpRequest.prototype.handlerMonitor = function () {
                if (!this.lx_monitor) {
                    return;
                };
                var isError = ((this.status > 199 && this.status < 300) || this.status === 304) ? false : true;
                var api = isError ? LexinMonitor.config.api.h5ErrorLog : LexinMonitor.config.api.h5PerformanceLog;
                var xhrTiming = null;
                if (typeof performance != 'undefined' && typeof performance.getEntriesByType != 'undefined'){
                    xhrTiming = performance.getEntriesByName(this.lx_monitor._url)[0];
                };
                var contentLength = Number(this.getResponseHeader("Content-Length") || 0);
                var responseType = this.responseType;
                var resp = "";

                if(!responseType || "text" === responseType){
                    resp = this.responseText;
                }else{
                    resp = this.response;
                }

                if(typeof resp !== "string"){
                    try{
                        resp = JSON.stringify(resp);
                    }catch(e){}
                }

                var data = {
                    api: api, type: 1, message: {
                        url: this.lx_monitor._url,
                        visit_from: 2,
                        from: 0,
                        method: this.lx_monitor._method,
                        time: this.lx_monitor._time_open,
                        rsp_size: contentLength,
                        rsp_code: this.status,
                        first_data_time: xhrTiming?(LexinMonitor.utils.parseNumber(xhrTiming.responseStart - xhrTiming.requestStart)):0,
                        final_data_time: xhrTiming?(LexinMonitor.utils.parseNumber(xhrTiming.responseEnd - xhrTiming.requestStart)):(this.lx_monitor._time_done - this.lx_monitor._time_open),
                        dest_ip: '',
                        dns_time: xhrTiming?LexinMonitor.utils.parseNumber(xhrTiming.domainLookupEnd - xhrTiming.domainLookupStart):0,
                        ip_connect_time: xhrTiming?LexinMonitor.utils.parseNumber(xhrTiming.connectEnd - xhrTiming.connectStart):0,
                        total_data_time:xhrTiming?LexinMonitor.utils.parseNumber(xhrTiming.responseEnd - xhrTiming.fetchStart):0,
                        ssl_time:(xhrTiming&&xhrTiming.secureConnectionStart)?LexinMonitor.utils.parseNumber(xhrTiming.connectEnd - xhrTiming.secureConnectionStart):0,
                        desc: JSON.stringify({
                            request: {
                                data: this.lx_monitor._request_data ? LexinMonitor.utils.parseStr(this.lx_monitor._request_data) : '',
                                cookie:document.cookie,
                                header: this.lx_monitor.header || {}
                            },
                            response: {
                                header: this.getAllResponseHeaders,
                                body: LexinMonitor.utils.unicode2Chs(resp)
                            }
                        }),
                        extent_msg: '',
                        host: exports.location.hostname
                    }
                };
                LexinMonitor.reportData(data);
            };
        },
        pageStayMonitor:function () {
            exports.addEventListener && exports.addEventListener('beforeunload',function () {
                LexinMonitor.handler.pageStayHandler.call(LexinMonitor,'beforeunload');
            },true);
            exports.addEventListener && exports.addEventListener('unload',function () {
                LexinMonitor.handler.pageStayHandler.call(LexinMonitor,'unload');
            },true);
            exports.addEventListener && exports.addEventListener('pagehide',function () {
                LexinMonitor.handler.pageStayHandler.call(LexinMonitor,'pagehide');
            },true);
            exports.addEventListener && exports.addEventListener('viewhide',function () {
                LexinMonitor.handler.pageStayHandler.call(LexinMonitor,'viewhide');
            },true);
            exports.addEventListener && exports.addEventListener('viewshow',function () {
                LexinMonitor.config.isReportPageStay = false;
                LexinMonitor.config.initTime = new Date().getTime();
            },true);
            exports.addEventListener && exports.addEventListener('pageshow',function () {
                if (typeof exports.webkit != 'undefined' ){
                    LexinMonitor.config.isReportPageStay = false;
                    LexinMonitor.config.initTime = new Date().getTime();
                };
            },true);
        }
    };
    LexinMonitor.getResourcePerformance = function () {
        var info = {list: [], size: 0, duration: 0};

        if (typeof exports.performance != 'undefined' && typeof exports.performance.getEntries != 'undefined') {
            var list = exports.performance.getEntries('resource');
            var fetchStart = performance.timing.fetchStart;
            var minList = [];
            var maxList = [];
            for (var i = 0, j = list.length; i < j; i++) {
                var timing = list[i];
                if (timing.initiatorType && timing.initiatorType != 'navigation') {
                    var name = timing.name || "";
                    var data = {
                        res_url: LexinMonitor.utils.isDataURL(name) ? name.substring(0, Math.min(name.length, 1000)) : name,
                        stalled_duration: LexinMonitor.utils.parseNumber(timing.domainLookupStart - timing.fetchStart),
                        dns_duration: LexinMonitor.utils.parseNumber(timing.domainLookupEnd - timing.domainLookupStart),
                        ip_connect_duration: LexinMonitor.utils.parseNumber(timing.connectEnd - timing.connectStart),
                        first_data_duration: LexinMonitor.utils.parseNumber(timing.responseStart - timing.requestStart),
                        final_data_duration: LexinMonitor.utils.parseNumber(timing.responseEnd - (timing.requestStart?timing.requestStart:timing.fetchStart)),
                        res_size: timing.decodedBodySize || 0,
                        start_time:fetchStart+parseInt(timing.fetchStart),
                        end_time:fetchStart+parseInt(timing.responseEnd)
                    };
                    info.list.push(data);
                    info.size = info.size + (timing.decodedBodySize || 0);
                    minList.push(data.start_time);
                    maxList.push(data.end_time);
                }
            };
            info.duration = Math.max.apply(null, maxList)-Math.min.apply(null, minList);
        };
        return info;
    };
    LexinMonitor.reportData = function (data) {
        try {
            if (exports.location.href === 'about:blank'){
                return;
            };
            if (typeof exports.webkit != 'undefined' && typeof exports.webkit.messageHandlers[data.api] != 'undefined' && exports.webkit.messageHandlers[data.api]) {
                exports.webkit.messageHandlers[data.api].postMessage(JSON.stringify({
                    type: data.type,
                    message: data.message
                }));
            } else if (typeof lx_apm_js_bridge != 'undefined' && lx_apm_js_bridge[data.api]) {
                try {
                    var u = navigator.userAgent;
                    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
                    if (isAndroid) {
                        lx_apm_js_bridge[data.api](data.type, JSON.stringify(data.message));
                    } else {
                        lx_apm_js_bridge[data.api](JSON.stringify({type: data.type, message: data.message}));
                    }
                } catch (e) {
                }
            }
        } catch (e) {
        }
    };
    var filterMonitor = {
        "xhrMonitor": /lvmama\.com$/i
    };
    var host = exports.location ? location.hostname || location.host : "";
    var pattern = null;

    for (p in LexinMonitor.monitor) {
        if(host && (p in filterMonitor)){
            pattern = filterMonitor[p];
            pattern.lastIndex = 0;

            if(pattern.test(host)){
                continue;
            }
        }
        LexinMonitor.monitor[p].call(LexinMonitor);
    };
    exports.LexinMonitor = LexinMonitor;
})(window);
