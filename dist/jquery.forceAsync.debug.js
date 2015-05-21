/**
 * jQuery Force Async v0.3.0
 * https://github.com/gmo-media/jquery.forceAsync
 *
 * Copyright 2014 GMO Media,Inc.
 * Released under the MIT license
 * https://github.com/gmo-media/jquery.forceAsync/blob/master/LICENSE
 *
 * Date: 2015-05-21T11:17:45Z
 */
/* globals jQuery */

if (!Date.now) {
    Date.now = function() { return (new Date()).getTime() };
}
(function($){
    var FAsync, Count = 0, Scripts = {}, Requires = {}, DynamicLoad = !document.all,
        Config = {
            'path': './',
            'delay': false
        };
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

    // for legacy IE
    document.createElement('forceasync');

    $.forceAsync = FAsync = function(target){
        var self = this;
        self.$t = $(target);
        self.id = target.id || 'forceAsync-'+Count++;
        log('find', self.id);
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
            log('onload', self.id, '('+h+'px)');
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
            log('load', self.id, 'to dynamic frame');
            var doc = self.doc();
            if (!doc) {
                log('Dynamic load failed', self.id, false);
                self._loadS();
                return;
            }
            doc.open('text/html');
            try {
                doc.write('<!DOCTYPE html><html><head><meta charset=UTF-8">'
                    + '<base target="_blank"></head>'
                    + '<body style="margin:0;padding:0;">'
                    + '<script>document.charset="UTF-8";</script>'
                    + self.pretag() + '<div style="'+self.style+'">'
                    + self.tag() + '</div></body></html>');
            }
            catch (e) {}
            finally { doc.close() }
        },
        '_loadS': function() {
            log('load', this.id, 'to static frame');
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
            log('exec');
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
    FAsync.t0 = Date.now();
    log('ready - 0ms');
})(jQuery);
