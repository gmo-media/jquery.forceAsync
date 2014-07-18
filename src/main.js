(function($){
    var FAsync, Count = 0, Scripts = {}, Requires = {}, DynamicLoad = !document.all,
        Config = {
            'path': './',
            'delay': false
        };

    // for legacy IE
    document.createElement('forceasync');

    $.forceAsync = FAsync = function(target){
        var self = this;
        self.$t = $(target);
        self.id = target.id || 'forceAsync-'+Count++;
        console.log('forceAsync: find "'+self.id+'"' + ' - ' + (Date.now() - FAsync.t0) + 'ms');
        self.style = self.$t.parent().attr('style');
        if (typeof self.style !== 'string') {
            self.style = '';
        }
        self.html = (target.outerHTML || genOuterHTML(target))
                  .replace(/^<forceasync/i,   '<script')
                  .replace(/<\/forceasync>$/i,'<\/script>')
                  .replace(/&lt;/g,   '<')
                  .replace(/&gt;/g,   '>')
                  .replace(/&quot;/g, '"')
                  .replace(/&amp;/g,  '&');
        self.refresh = (self.$t.data('refresh') || 0) * 1000;
        self.require =  self.$t.data('require');
        self.libname =  self.$t.data('name');
        self.cb = {};
    };
    function genOuterHTML(node) {
        return '<script'
            + $.map(node.attributes, function(a) {
                  return a.specified ? ' '+a.name+'="'+a.value+'"' : '';
              }).join('')
            + '>' + node.innerHTML + '<\/script>';
    }

    FAsync.prototype = {
        '_frame': function() {
            return $('<iframe name="'+this.id+'" class="forceAsyncFrame" style="width:100%;height:0;margin:0;border:0;padding:0;"'
                + ' marginwidth="0" marginheight="0" frameborder="0" scrolling="no" allowtransparency="true" seamless />');
        },
        'load': function() {
            var self = this;
            (self.$f = self._frame()).hide();
            if (self.reload) {
                self.$t.before(self.$f);
            } else {
                self.$t.replaceWith(self.$f);
                self.reload = true;
            }
            DynamicLoad ? self._loadD() : self._loadS();
            self.$f.load(function(){
                setTimeout(function(){
                    self.$f.show();
                    self.onload();
                }, 4);
            });
        },
        'onload': function() {
            var self = this, h;
            if (self.cb.load) {
                self.cb.load(self);
            }

            h = $(self.doc()).height();
            console.log('forceAsync: onload "'+self.id+'" (' + h + 'px)' + ' - ' + (Date.now() - FAsync.t0) + 'ms');
            if (h > 0) {
                self.$t.remove();
                self.$t = self.$f.height(h);
            }
            if (self.refresh) {
                setTimeout(function(){ self.load() }, self.refresh);
            }
        },
        '_loadD': function() {
            var self = this;
            console.log('forceAsync: load "'+self.id+'" to dynamic frame' + ' - ' + (Date.now() - FAsync.t0) + 'ms');
            var doc = self.doc();
            if (!doc) {
                console.log('forceAsync: Dynamic load failed "'+self.id+'"');
                self._loadS();
                return;
            }
            doc.open('text/html');
            try {
                doc.write('<!DOCTYPE html><html><head><meta charset=UTF-8"></head>'
                    + '<body style="margin:0;padding:0;"><script>document.charset="UTF-8";</script>'
                    + self.pretag() + '<div style="'+self.style+'">' + self.tag() + '</div></body></html>');
            }
            catch (e) {}
            finally { doc.close() }
        },
        '_loadS': function() {
            console.log('forceAsync: load "'+this.id+'" to static frame' + ' - ' + (Date.now() - FAsync.t0) + 'ms');
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
        'tag': function() {
            return this.cb.html ? this.cb.html(this.html) : this.html;
        },
        'pretag': function() {
            return this.require && Requires[this.require] ? Requires[this.require].html : '';
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
            console.log('forceAsync: exec' + ' - ' + (Date.now() - FAsync.t0) + 'ms');
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
                    (Requires[script.libname] = script).remove();
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
    console.log((FAsync.t0 = (Date.now || (Date.now=function(){return (new Date()).getTime()}))()) && 'forceAsync: ready - 0ms');
})(jQuery);
