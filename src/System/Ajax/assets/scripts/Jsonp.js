﻿/**
 * @author xuld
 */

using("System.Ajax.Script");

Ajax.transports.jsonp = function (xhrObject, parseData) {

    if (xhrObject.jsonp === undefined) {
        xhrObject.jsonp = 'callback';
    }

    // callback=?
    var jsonpCallback = xhrObject.jsonpCallback || (xhrObject.jsonpCallback = 'jsonp' + Date.now() + JPlus.id++),
        jsonpCallbackOverwritten = window[jsonpCallback],
        responseData;

    // callback=jsonp123
    if (xhrObject.jsonp) {
        if (xhrObject.url.indexOf(xhrObject.jsonp + '=?') >= 0) {
            xhrObject.url = xhrObject.url.replace(xhrObject.jsonp + '=?', xhrObject.jsonp + '=' + jsonpCallback);
        } else {
            xhrObject.url = Ajax.concatUrl(xhrObject.url, xhrObject.jsonp + "=" + jsonpCallback);
        }
    }

    // 插入 JSONP 回调。
    window[jsonpCallback] = function () {
        responseData = arguments;
    };

    // 最后使用 Script 协议发送。
    Ajax.transports.script(xhrObject, function (xhrObject) {
        
        if (!responseData) {
            throw new Error(jsonpCallback + ' was not called');
        }

        return responseData[0];

    }, function () {

        // 回复初始的 jsonpCallback 函数。
        window[jsonpCallback] = jsonpCallbackOverwritten;
    });
};

Ajax.jsonp = function(url, data, onsuccess, onerror) {
    if (typeof data === 'function') {
        onerror = onsuccess;
		onsuccess = data;
		data = null;
	}

	return Ajax.send({
		url: url,
		dataType: 'jsonp',
		data: data,
		success: onsuccess,
		error: onerror
	});
};