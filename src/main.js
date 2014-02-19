(function($){
    var Config = {
            'path': './'
        },
        Count = 0,
        Scripts = {},
        DynamicLoad = !document.all;

    // for legacy IE
    document.createElement('forceasync');

    $.forceAsync = function(target){
        var $target = $(target);
        this.id = 'forceAsync-' + Count++;
        console.log('forceAsync: find "'+ this.id + '"');
        this.style = $target.parent().attr('style');
        if (typeof this.style !== 'string') {
            this.style = '';
        }
        this.html = target.outerHTML.replace(/^<forceasync/i,    '<script')
                                    .replace(/<\/forceasync>$/i, '<\/script>')
                                    .replace(/&lt;/g,   '<')
                                    .replace(/&gt;/g,   '>')
                                    .replace(/&quot;/g, '"')
                                    .replace(/&amp;/g,  '&');
        this.$iframe = $('<iframe id="' + this.id + '" class="forceAsyncFrame"'
            + ' style="margin:0;border:0;padding:0;width:100%;height:0;"'
            + ' marginwidth="0" marginheight="0" frameborder="0" scrolling="no"'
            + ' allowtransparency="true" seamless />');
        $target.replaceWith(this.$iframe);
    };

    $.forceAsync.prototype = {
        'load': function() {
            if (DynamicLoad) {
                this._loadToDynamicFrame();
            } else {
                this._loadToStaticFrame();
            }

            var that = this;
            this.$iframe.load(function(){
                var h = $(that.contentDocument()).height();
                console.log('forceAsync: loaded "' + that.id
                    + '" (height:' + h + 'px)');
                that.$iframe.height(h);
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

    $.extend($.forceAsync, {
        'config': function(options) {
            $.extend(Config, options);
            if (!/\/$/.test(Config.path)) {
                Config.path += '/';
            }
        },
        'getScript': function(id) {
            return Scripts[id];
        },
        'exec': function() {
            console.log('forceAsync: exec');
            $('forceasync').each(function(){
                var script = new $.forceAsync(this);
                script.load();
                Scripts[script.id] = script;
            });
        }
    });

    $($.forceAsync.exec);
})(jQuery);
