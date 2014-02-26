/**
 * jQuery Force Async v0.0.8
 * https://github.com/gmo-media/jquery.forceAsync
 *
 * Copyright 2014 
 * Released under the MIT license
 * https://github.com/gmo-media/jquery.forceAsync/blob/master/LICENSE
 *
 * Date: 2014-02-26T14:38:08Z
 */
(function($){
    var PluginName = 'forceAsync', $Plugin, Count = 0, Scripts = {},
        DynamicLoad = !document.all,
        Config = {
            'path': './'
        };

    // for legacy IE
    document.createElement('forceasync');

    $Plugin = $[PluginName] = function(target){
        var $target = $(target);
        this.id = target.id !== '' ? target.id : PluginName+'-'+Count++;
        console.log(PluginName+': find "'+this.id+'"'
            + ' - ' + (Date.now() - $Plugin.t0) + 'ms');
        this.style = $target.parent().attr('style');
        if (typeof this.style !== 'string') {
            this.style = '';
        }
        this.html = target.outerHTML.replace(/^<forceasync/i,   '<script')
                                    .replace(/<\/forceasync>$/i,'<\/script>')
                                    .replace(/&lt;/g,   '<')
                                    .replace(/&gt;/g,   '>')
                                    .replace(/&quot;/g, '"')
                                    .replace(/&amp;/g,  '&');
        this.$iframe = $('<iframe name="'+this.id+'" class="forceAsyncFrame"'
            + ' style="margin:0;border:0;padding:0;width:100%;height:0;"'
            + ' marginwidth="0" marginheight="0" frameborder="0" scrolling="no"'
            + ' allowtransparency="true" seamless />');
        this.cb = {};
        $target.replaceWith(this.$iframe);
    };

    $Plugin.prototype = {
        'load': function() {
            if (DynamicLoad) {
                this._dynamicLoad();
            } else {
                this._staticLoad();
            }

            var that = this;
            this.$iframe.load(function(){
                setTimeout(function(){
                    if (that.cb.load) {
                        that.cb.load.call(that);
                    }
                    var h = $(that.document()).height();
                    console.log(PluginName+': onload "'+that.id+'" ('+h+'px)'
                        + ' - ' + (Date.now() - $Plugin.t0) + 'ms');
                    that.$iframe.height(h);
                }, 4);
            });
        },
        '_dynamicLoad': function() {
            console.log(PluginName+': load "'+this.id+'" to dynamic frame'
                + ' - ' + (Date.now() - $Plugin.t0) + 'ms');
            var doc = this.document();
            doc.open('text/html');
            try {
                doc.write('<!DOCTYPE html><html>'
                    + '<body style="margin:0;padding:0;">'
                    + '<div style="'+this.style+'">' + this.getHtml()
                    + '</div></body></html>');
            }
            catch (e) {}
            finally { doc.close() }
        },
        '_staticLoad': function() {
            console.log(PluginName+': load "'+this.id+'" to static frame'
                + ' - ' + (Date.now() - $Plugin.t0) + 'ms');
            var frm = this.$iframe.get(0);
            frm.name = this.id;
            frm.src = Config.path + PluginName + '.html';
        },
        'document': function() {
            var frm = this.$iframe.get(0);
            return frm.contentDocument || frm.contentWindow.document;
        },
        'getHtml': function() {
            return this.cb.html ? this.cb.html(this.html) : this.html;
        }
    };

    $.extend($Plugin, {
        'config': function(options) {
            $.extend(Config, options);
            if (!/\/$/.test(Config.path)) {
                Config.path += '/';
            }
        },
        'getScript': function(id) {
            return Scripts[id];
        },
        'exec': function(arg) {
            console.log(PluginName+': exec'
                + ' - ' + (Date.now() - $Plugin.t0) + 'ms');
            if (typeof arg === 'string') {
                var p = arg, q = arguments[1];
                if (typeof q !== 'string') {
                    q = '';
                }
                arg = {
                    'html': function(html) { return p + html + q }
                };
            }
            else if (typeof arg !== 'object') {
                arg = {};
            }
            $('forceasync').each(function(){
                var script = new $[PluginName](this);
                $.extend(script.cb, arg);
                Scripts[script.id] = script;
                script.load();
            });
        }
    });

    $($Plugin.exec);
    console.log(($Plugin.t0 = Date.now()) && PluginName+': ready - 0ms');
})(jQuery);
