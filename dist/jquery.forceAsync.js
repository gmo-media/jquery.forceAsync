/**
 * jQuery Force Async v0.0.9
 * https://github.com/gmo-media/jquery.forceAsync
 *
 * Copyright 2014 GMO Media,Inc.
 * Released under the MIT license
 * https://github.com/gmo-media/jquery.forceAsync/blob/master/LICENSE
 *
 * Date: 2014-03-11T14:27:35Z
 */
(function($){
    var PluginName = 'forceAsync', $Plugin, Count = 0, Scripts = {},
        DynamicLoad = !document.all,
        Config = {
            'path': './',
            'onload': false
        };

    // for legacy IE
    document.createElement('forceasync');

    $Plugin = $[PluginName] = function(target){
        this.$t = $(target);
        this.id = target.id !== '' ? target.id : PluginName+'-'+Count++;
        
        this.style = this.$t.parent().attr('style');
        if (typeof this.style !== 'string') {
            this.style = '';
        }
        this.html = target.outerHTML.replace(/^<forceasync/i,   '<script')
                                    .replace(/<\/forceasync>$/i,'<\/script>')
                                    .replace(/&lt;/g,   '<')
                                    .replace(/&gt;/g,   '>')
                                    .replace(/&quot;/g, '"')
                                    .replace(/&amp;/g,  '&');
        this.refresh = (this.$t.data('refresh') || 0) * 1000;
        this.cb = {};
    };

    $Plugin.prototype = {
        '_createFrame': function() {
            return $('<iframe name="'+this.id+'" class="forceAsyncFrame"'
                + ' style="margin:0;border:0;padding:0;width:100%;height:0;"'
                + ' marginwidth="0" marginheight="0" frameborder="0"'
                + ' scrolling="no" allowtransparency="true" seamless />');
        },
        'load': function() {
            var that = this;
            (this.$f = this._createFrame()).hide();
            if (this.reload) {
                this.$t.before(this.$f);
            } else {
                this.$t.replaceWith(this.$f);
                this.reload = true;
            }
            DynamicLoad ? this._dynamicLoad() : this._staticLoad();
            this.$f.load(function(){
                setTimeout(function(){ that._onload() }, 4);
            });
        },
        '_onload': function() {
            this.$f.show();
            if (this.cb.load) {
                this.cb.load.call(this);
            }

            var that = this, h = $(this.document()).height();
            
            if (h > 0) {
                this.$t.remove();
                this.$t = this.$f.height(h);
            }
            if (this.refresh) {
                setTimeout(function(){ that.load() },
                    h === 0 ? 1000 : this.refresh);
            }
        },
        '_dynamicLoad': function() {
            
            var doc = this.document();
            if (!doc) {
                
                this._staticLoad();
                return;
            }
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
            
            var frm = this.$f.get(0);
            frm.name = this.id;
            frm.src = Config.path + PluginName + '.html';
        },
        'document': function() {
            var frm = this.$f.get(0), w = 'contentWindow';
            return frm.contentDocument || frm[w] && frm[w].document;
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
                (Scripts[script.id] = script).load();
            });
        }
    });

    $(function(){
        if (Config.onload) {
            $(window).load($Plugin.exec);
        } else {
            $Plugin.exec();
        }
    });
    
})(jQuery);
