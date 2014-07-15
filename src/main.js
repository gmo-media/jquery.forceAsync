(function($){
    var FAsync, Count = 0, Scripts = {}, Libs = {}, DynamicLoad = !document.all,
        Config = {
            'path': './',
            'delay': false
        };

    // for legacy IE
    document.createElement('forceasync');

    $.forceAsync = FAsync = function(target){
        this.$t = $(target);
        this.id = target.id || 'forceAsync-'+Count++;
        console.log('forceAsync: find "'+this.id+'"'
            + ' - ' + (Date.now() - FAsync.t0) + 'ms');
        this.style = this.$t.parent().attr('style');
        if (typeof this.style !== 'string') {
            this.style = '';
        }
        this.html = (target.outerHTML || genOuterHTML(target))
                  .replace(/^<forceasync/i,   '<script')
                  .replace(/<\/forceasync>$/i,'<\/script>')
                  .replace(/&lt;/g,   '<')
                  .replace(/&gt;/g,   '>')
                  .replace(/&quot;/g, '"')
                  .replace(/&amp;/g,  '&');
        this.refresh = (this.$t.data('refresh') || 0) * 1000;
        this.require =  this.$t.data('require');
        this.libname =  this.$t.data('name');
        this.cb = {};
    };
    function genOuterHTML(node) {
        return '<script'
            + $.map(node.attributes, function(a){
                  return a.specified ? ' '+a.name+'="'+a.value+'"' : '';
              }).join('')
            + '>' + node.innerHTML + '<\/script>';
    }

    FAsync.prototype = {
        '_frame': function() {
            return $('<iframe name="'+this.id+'" class="forceAsyncFrame"'
                + ' style="margin:0;border:0;padding:0;width:100%;height:0;"'
                + ' marginwidth="0" marginheight="0" frameborder="0"'
                + ' scrolling="no" allowtransparency="true" seamless />');
        },
        'load': function() {
            var that = this;
            (that.$f = that._frame()).hide();
            if (that.reload) {
                that.$t.before(that.$f);
            } else {
                that.$t.replaceWith(that.$f);
                that.reload = true;
            }
            DynamicLoad ? that._loadD() : that._loadS();
            that.$f.load(function(){
                setTimeout(function(){
                    that.$f.show();
                    that._onload();
                }, 4);
            });
        },
        '_onload': function() {
            var that = this, h;
            if (that.cb.load) {
                that.cb.load.call(that);
            }

            h = $(that.doc()).height();
            console.log('forceAsync: onload "'+this.id+'" (' + h + 'px)'
                + ' - ' + (Date.now() - FAsync.t0) + 'ms');
            if (h > 0) {
                that.$t.remove();
                that.$t = that.$f.height(h);
            }
            if (that.refresh) {
                setTimeout(function(){ that.load() }, that.refresh);
            }
        },
        '_loadD': function() {
            console.log('forceAsync: load "'+this.id+'" to dynamic frame'
                + ' - ' + (Date.now() - FAsync.t0) + 'ms');
            var doc = this.doc();
            if (!doc) {
                console.log('forceAsync: Dynamic load failed "'+this.id+'"');
                this._loadS();
                return;
            }
            doc.open('text/html');
            try {
                doc.write('<!DOCTYPE html><html>'
                    + '<head><meta charset=UTF-8"></head>'
                    + '<body style="margin:0;padding:0;">'
                    + '<script>document.charset="UTF-8";</script>'
                    + '<div style="'+this.style+'">' + this.getHtml()
                    + '</div></body></html>');
            }
            catch (e) {}
            finally { doc.close() }
        },
        '_loadS': function() {
            console.log('forceAsync: load "'+this.id+'" to static frame'
                + ' - ' + (Date.now() - FAsync.t0) + 'ms');
            var frm = this.$f.get(0);
            frm.name = this.id;
            frm.src = Config.path + 'forceAsync.html';
        },
        'remove': function() {
            this.$t.remove();
        },
        'doc': function() {
            var frm = this.$f.get(0), cw = 'contentWindow';
            return frm.contentDocument || frm[cw] && frm[cw].document;
        },
        'getHtml': function() {
            var html = this.html;
            if (this.cb.html) {
                html = this.cb.html(html);
            }
            if (this.require && Libs[this.require]) {
                html = Libs[this.require].html + html;
            }
            return html;
        }
    };

    $.extend(FAsync, {
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
            console.log('forceAsync: exec'
                + ' - ' + (Date.now() - FAsync.t0) + 'ms');
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
                var script = new FAsync(this);
                if (script.libname) {
                    (Libs[script.libname] = script).remove();
                } else {
                    $.extend(script.cb, arg);
                    (Scripts[script.id] = script).load();
                }
            });
        }
    });

    $(function(){
        if (Config.delay) {
            $(window).load(FAsync.exec);
        } else {
            FAsync.exec();
        }
    });
    console.log((FAsync.t0 = Date.now()) && 'forceAsync: ready - 0ms');
})(jQuery);
