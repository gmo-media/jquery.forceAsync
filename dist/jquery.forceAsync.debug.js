/**
 * jQuery Force Async v0.0.3
 * https://github.com/gmo-media/jquery.forceAsync
 *
 * Copyright 2014 GMO Media,Inc.
 * Released under the MIT license
 * https://github.com/gmo-media/jquery.forceAsync/blob/master/LICENSE
 *
 * Date: 2014-02-18T06:00:24Z
 */
(function($){
    var Count = 0, DynamicLoad = !document.all, Scripts = {}, Config = {
        'path': './'
    };

    // constructor
    $.forceAsync = function(target){
        var $target = $(target);
        this.id = 'forceAsync-' + Count++;
        this.type  = $target.data('forceasync');
        this.style = $target.parent().attr('style');
        this.html  = target.outerHTML.replace(/^<noscript/i,    '<script')
                                     .replace(/<\/noscript>$/i, '<\/script>')
                                     .replace(/&lt;/g,   '<')
                                     .replace(/&gt;/g,   '>')
                                     .replace(/&quot;/g, '"')
                                     .replace(/&amp;/g,  '&');
        this.$iframe = $('<iframe id="' + this.id + '" class="forceAsyncFrame"'
            + ' style="margin:0;border:0;padding:0;width:100%;height:0;"'
            + ' frameborder="0" marginwidth="0" marginheight="0" scrolling="no"'
            + ' allowtransparency="true" seamless />');
        $target.replaceWith(this.$iframe);
        console.log('forceAsync: find "'+ this.id + '"');
    };

    // instance method
    $.forceAsync.prototype = {
        'load': function() {
            if (DynamicLoad && this.type !== 'static') {
                this._loadToDynamicFrame();
            } else {
                this._loadToStaticFrame();
            }

            var that = this;
            this.$iframe.load(function(){
                console.log('forceAsync: loaded "' + that.id + '" (height='
                    + $(that.contentDocument()).height() + ')');
                that.$iframe.height($(that.contentDocument()).height());
            });
        },
        '_loadToDynamicFrame': function() {
            console.log('forceAsync: load "'+ this.id+ '" to dynamic frame');
            var doc = this.contentDocument();
            doc.open('text/html');
            try {
                doc.write('<!DOCTYPE html><html>'
                    + '<body style="margin:0;padding:0;">'
                    + '<div style="' + this.style + '">' + this.html
                    + '</div></body></html>');
            }
            catch (e) {}
            finally { doc.close() }
        },
        '_loadToStaticFrame': function() {
            console.log('forceAsync: load "'+ this.id + '" to static frame');
            var frm = this.$iframe.get(0);
            frm.name = this.id;
            frm.src = Config.path + 'forceAsync.html';
        },
        'contentDocument': function() {
            var frm = this.$iframe.get(0);
            return frm.contentDocument || frm.contentWindow.document;
        }
    };

    // static method
    $.extend($.forceAsync, {
        'config': function(options) {
            $.extend(Config, options);
            if (/\/$/.test(Config.path)) {
                Config.path += '/';
            }
        },
        'getScript': function(id) {
            return Scripts[id];
        },
        'exec': function() {
            console.log('forceAsync: exec');
            $('noscript[data-forceAsync]').each(function(){
                var script = new $.forceAsync(this);
                script.load();
                Scripts[script.id] = script;
            });
        }
    });

    // initialize
    $($.forceAsync.exec);
})(jQuery);