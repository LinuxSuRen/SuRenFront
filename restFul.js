/**
 * 本插件主要用于简化基于Restful风格下的前后端分离开发，主要提供了save、del、update、query、等方法，
 * 分别对应保存、删除、更新、查询接口。开发人员，不需要关心Restful风格请求的技术细节，可以把精力放在业务
 * 逻辑上。
 * 为了能够解决在前后端分离开发环境下，前端开发过程需要依赖后端接口的困境，使用本插件可以基本脱离（尤其是
 * 查询类的界面开发）对后端开发进度的依赖，从而更加高效的完成开发工作。前端人员，只需要在工程根目录下的
 * debugData中，依据API接口路径创建对应的json文件即可。例如：你需要请求的API地址为/users/1，那么，
 * 你需要创建对应的json文件路径为：/debugData/users/1.json。然后，通过浏览器就可以切换为调试模式，
 * 你可以在localStorage或者sessionStorage中添加key值为devops.debug，value为demo的设置。
 * 本插件依赖jQuery
 * @author suren <http://surenpi.com>
 */
if(typeof define === 'function' && define.amd) {
    define('suren-restful', ['jquery'], function (jQuery) {
        (function ($) {
            "use strict";

            var ajaxGlobalConf = {
                dataType: 'json',
                contentType: 'application/json'
            };

            var debugConf = {
                storageKey: 'suren.debug',
                debugData: '/debugData',
                dataSuffix: '.json',
                apiPrefix: '/api'
            };

            /**
             * 判断是否为向后台请求的地址
             * @param url
             * @returns {boolean}
             */
            function isServiceUrl(url) {
                return (!url.endsWith('.html') &&
                    !url.endsWith('.js') &&
                    !url.endsWith('.css') &&
                    !url.endsWith('.json'));
            }

            /**
             * token处理
             */
            function tokenHandle(request) {
                var token = getAccessToken();
                request.headers = {
                    Authorization: 'Bearer' + token
                };

                request.complete = function (e, xhr, opts) {
                    ajaxComplete(e, xhr, opts);
                };
            }

            /**
             * 全局的ajax请求完成处理函数
             * @param e
             * @param xhr
             * @param opts
             */
            function ajaxComplete(e, xhr, opts) {
                if(e.status === 401) {
                    gotoLoginPage();
                }
            }

            /**
             * 跳转到登录页面
             */
            function gotoLoginPage() {
                window.location = '/login.html';
            }

            /**
             * 获取accessToken
             */
            function getAccessToken() {
                return sessionStorage.getItem('access_token');
            }

            /**
             * 判断是否为debug模式
             * @returns {boolean} 如果是debug模式返回true，否则false
             */
            function isDebugMode() {
                var sessionDebug = sessionStorage.getItem(debugConf.storageKey);
                var localDebug = localStorage.getItem(debugConf.storageKey);
                if(sessionDebug === 'demo' || localDebug === 'demo') {
                    return true;
                } else {
                    return false;
                }
            }

            $.extend({
                unserialize: function (str) {
                    var result = {};
                    if(typeof str === 'string') {
                        var items = str.split('&');
                        for(var i = 0; i < items.length; i++) {
                            var map = items[i].split('=');
                            if(map.length !== 2) {
                                continue;
                            }

                            result[map[0]] = map[1];
                        }
                    }

                    return result;
                },
                suAjax: function (userConfig) {
                    var config = $.extend(false, ajaxGlobalConf, userConfig);
                    if(config) {
                        if('form' in config && config.form !== '') {
                            var formSelector = config.form;
                            var data = $(formSelector).serializeJson();
                            var usrDataType = (typeof config.data);

                            var jsonObj = null;
                            if(usrDataType === 'object') {
                                jsonObj = $.extend(false, JSON.parse(data), config.data);
                            } else if(usrDataType === 'string') {
                                try{
                                    jsonObj = $.extend(false, JSON.parse(data), JSON.parse(config.data));
                                } catch (e) {
                                    if(config.data.indexOf('=') !== -1) {
                                        jsonObj = $.extend(false, JSON.parse(data), $.unserialize(config.data));
                                    } else {
                                        console.log(e);
                                    }
                                }
                            } else {
                                config.data = data;
                            }

                            if(jsonObj !== null) {
                                config.data = JSON.stringify(jsonObj);
                            }
                        }
                    }

                    var suAjax = {
                        prepareRequest: function(request, type) {
                            if(type == 'GET') {
                                config.type = 'GET';
                            } else if(type == 'POST') {
                                config.type = 'POST';
                            } else if(type == 'DELETE') {
                                config.type = 'DELETE';
                            } else if(type == 'PUT') {
                                config.type = 'PUT';
                            }

                            request = $.extend(false, config, request);
                            if(isServiceUrl(request.url) && !request.url.startsWith(debugConf.apiPrefix) &&
                                !request.url.startsWith(debugConf.debugData)) {
                                var urlItems = request.url.split('/');
                                if(isDebugMode()) {
                                    if(urlItems[0].startsWith('http')) {
                                        urlItems[2] = urlItems[2] + debugConf.debugData;

                                        request.url = urlItems.join('/');
                                    } else if(request.url.startsWith('/') && isServiceUrl(request.url)) {
                                        request.url = (debugConf.debugData + request.url);
                                    }

                                    request.url = request.url + debugConf.dataSuffix;
                                } else {
                                    if(urlItems[0].startsWith('http')) {
                                        urlItems[2] = urlItems[2] + debugConf.apiPrefix;

                                        request.url = urlItems.join('/');
                                    } else if(request.url.startsWith('/') && isServiceUrl(request.url)) {
                                        request.url = (debugConf.apiPrefix + request.url);
                                    }
                                }
                            }

                            tokenHandle(request);

                            return request;
                        },
                        ajax: function (request) {
                            return $.ajax(this.prepareRequest(request, ''));
                        },
                        save: function (request) {
                            this.ajax(this.prepareRequest(request, 'POST'));
                        },
                        del: function (request) {
                            this.ajax(this.prepareRequest(request, 'DELETE'));
                        },
                        update: function (request) {
                            this.ajax(this.prepareRequest(request, 'PUT'));
                        },
                        query: function (request) {
                            this.ajax(this.prepareRequest(request, 'GET'));
                        },
                        upload: function (request) {
                            this.save($.extend(false, {
                                processData: false,
                                contentType: false
                            }, request));
                        }
                    };

                    return suAjax;
                }
            });

            $.fn.extend({
                serializeJson: function () {
                    var container = this;
                    var arrayData = container.serializeArray();
                    var len = arrayData.length;
                    var jsonRes = {};

                    for(var i = 0; i < len; i++) {
                        var arrayItem = arrayData[i];
                        jsonRes[arrayItem.name] = arrayItem.value;
                    }

                    return JSON.stringify(jsonRes);
                },
                fillForm: function (data, exclude) {
                    if(typeof data !== 'object' || $.isArray(data)) {
                        return;
                    }

                    if(!$.isArray(exclude)) {
                        exclude = [];
                    }

                    var form = $(this);
                    for(var i in data) {
                        if($.inArray(i, exclude) !== -1) {
                            continue;
                        }
                        form.find(':input[name=' + i + ']').val(data[i]);
                    }
                }
            });

            if(typeof exports !== 'undefined') {
                exports.help = function () {
                    console.log('help message');
                };
            }
        })(jQuery);

        return {
            help: function () {
                console.log('hello from http://surenpi.com');
            },
            deps: function () {
                return ['jquery'];
            }
        };
    });
}