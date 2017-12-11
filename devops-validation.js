(function ($) {
    $.fn.bootstrapValidator.i18n = $.extend(true, $.fn.bootstrapValidator.i18n, {
        safeName: {
            'default': 'Please enter a safe String, can not contains ?*/%!@#$^&|<>[]:;'
        },
        chinese: {
            'default': '请输入中文字符'
        },
        duplicate: {
            'default': '重复'
        }
    });

    $.fn.bootstrapValidator.validators = $.extend(true, $.fn.bootstrapValidator.validators, {
        safeName: {
            enableByHtml5: function ($field) {
                var safeName = $field.attr('safeName') + '';
                return ('safeName' === safeName || 'true' === safeName);
            },
            validate: function (validator, $field, options) {
                var value = $field.val();
                for(var i in value) {
                    if("?*/\%!@#$^&|<>[]:;".indexOf(value[i]) != -1){
                        return false;
                    }
                }
                return true;
            }
        },
        chinese: {
            html5Attributes: {
                message: 'message',
                language: 'chinese'
            },
            enableByHtml5: function ($field) {
                var language = $field.attr('language') + '';
                return ('chinese' === language);
            },
            validate: function (validator, $field, options) {
                var value = $field.val();
                return (/^[\u4e00-\u9fa5]*$/.test(value));
            }
        },
        notEmptySelector: {
            enableByHtml5: function ($field) {
                var notEmptySelector = $field.attr('notEmptySelector') + '';
                return ('notEmptySelector' === notEmptySelector || 'true' === notEmptySelector);
            },
            validate: function (validator, $field, options) {
                var val = $field.val();
                return val !== '-1' && val !== '';
            }
        },
        duplicate: {
            html5Attributes: {
                message: 'message'
            },
            enableByHtml5: function ($field) {
                var duplicate = $field.attr('duplicate') + '';
                return ('duplicate' === duplicate || 'true' === duplicate);
            },
            validate: function (validator, $field, options) {
                var val = $field.val();
                var name = $field.attr('name');
                var remote = $field.attr('data-remote');
                //var param = $field.attr('data-remove-param');
                var message = $field.attr('duplicate-message');

                var requestParam = {};
                requestParam[name] = val;
                var result = true;

                $.devopsAjax({
                    data: requestParam
                }).query({
                    url: remote,
                    async: false,
                    success: function (data) {
                        result = !data.exists;
                    }
                });

                return {
                    valid: result,
                    message: message || $.fn.bootstrapValidator.i18n.duplicate
                };
            }
        }
    });
}(window.jQuery));