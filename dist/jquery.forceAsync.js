/**
 * jQuery Force Async v0.0.8
 * https://github.com/gmo-media/jquery.forceAsync
 *
 * Copyright 2014 
 * Released under the MIT license
 * https://github.com/gmo-media/jquery.forceAsync/blob/master/LICENSE
 *
 * Date: 2014-02-26T08:01:16Z
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
        Count++;
        this.id = target.id !== '' ? target.id : PluginName+'-'+Count;
        
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
                    var h = $(that.document()).height();
                    
                    that.$iframe.height(h);
                }, 4);
            });
        },
        '_dynamicLoad': function() {
            
            var doc = this.document();
            doc.open('text/html');
            try {
                doc.write('<!DOCTYPE html><html>'
                    + '<body style="margin:0;padding:0;">'
                    + '<div style="'+this.style+'">' + this.html
                    + '</div></body></html>');
            }
            catch (e) {}
            finally { doc.close() }
        },
        '_staticLoad': function() {
            
            var frm = this.$iframe.get(0);
            frm.name = this.id;
            frm.src = Config.path + PluginName + '.html';
        },
        'document': function() {
            var frm = this.$iframe.get(0);
            return frm.contentDocument || frm.contentWindow.document;
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
        'exec': function(callback) {
            
            $('forceasync').each(function(){
                var script = new $[PluginName](this);
                if (typeof callback === 'function') {
                    callback(script);
                }
                script.load();
                Scripts[script.id] = script;
            });
        }
    });

    $($Plugin.exec);
    
})(jQuery);
