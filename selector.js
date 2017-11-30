function selector(config) {
    config = $.extend(false, {
        url: '',
        param: {},
        async: true,
        text: 'text',
        value: 'value',
        exclude: [],
        container: '',
        cache: true,
        callback: function() {},
        change: function () {}
    }, config);

    if(config.cache && $(config.container + ' option').size() > 1) {
        return;
    }
    $(config.container).html('');

    $.devopsAjax().query({
        url: config.url,
        data: config.param,
        async: config.async,
        success: function(data) {
            var selectorData = [];
            for(var item in data) {
                var val = data[item][config.value];
                if(config.exclude.indexOf(val) !== -1) {
                    continue;
                }

                selectorData.push({
                    text: data[item][config.text],
                    value: val
                });
            }

            $.get('../js/template/common_selector_template.html', function (tmp) {
                var bt = baidu.template;
                var fn = bt(tmp);

                if((typeof config.selected) === 'undefined'){
                    config.selected = '-1';
                }

                var optionDiv = fn({
                    data: selectorData,
                    selected: config.selected
                });
                $(config.container).html(optionDiv);

                if($.isFunction(config.callback)) {
                    config.callback();
                }

                if($.isFunction(config.change)) {
                    $(config.container).change(function() {
                        config.change(this);
                    });
                }
            });
        }
    });
};