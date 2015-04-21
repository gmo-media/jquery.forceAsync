/* globals jQuery */

/* DEBUG */
if (!Date.now) {
    Date.now = function() { return (new Date()).getTime() };
}
/* END */
(function($){
    var FAsync, Count = 0, Scripts = {}, Requires = {}, DynamicLoad = !document.all,
        Config = {
            'path': './',
            'delay': false
        };
/* DEBUG */
    var log = function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift('forceAsync:');
        if (args[2]) {
            args[2] = '"' + args[2] + '"';
        }
        if (args[args.length - 1] === false) {
            args.pop();
        } else {
            args.push('-', (Date.now() - FAsync.t0) + 'ms');
        }
        console.log(args.join(' '));
    };
/* END */

    // for legacy IE
    document.createElement('forceasync');

    $.forceAsync = FAsync = function(target){
        var self = this;
        self.$t = $(target);
        self.id = target.id || 'forceAsync-'+Count++;
/* DEBUG */
        log('find', self.id);
/* END */
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
            self[DynamicLoad ? '_loadD' : '_loadS']();
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
/* DEBUG */
            log('onload', self.id, '('+h+'px)');
/* END */
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
/* DEBUG */
            log('load', self.id, 'to dynamic frame');
/* END */
            var doc = self.doc();
            if (!doc) {
/* DEBUG */
                log('Dynamic load failed', self.id, false);
/* END */
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
/* DEBUG */
            log('load', this.id, 'to static frame');
/* END */
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
            var tag = '', keys, i, n;
            if (this.require) {
                keys = this.require.split(/, */);
                for (i = 0, n = keys.length; i < n; i++) {
                    tag += Requires[keys[i]] ? Requires[keys[i]].html : '';
                }
            }
            return tag;
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
/* DEBUG */
            log('exec');
/* END */
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
/* DEBUG */
    FAsync.t0 = Date.now();
    log('ready - 0ms');
/* END */
})(jQuery);
