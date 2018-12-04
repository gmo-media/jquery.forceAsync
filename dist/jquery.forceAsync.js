/**
 * jQuery Force Async v1.1.1
 * https://github.com/gmo-media/jquery.forceAsync
 *
 * Copyright 2014 GMO Media,Inc.
 * Released under the MIT license
 * https://github.com/gmo-media/jquery.forceAsync/blob/master/LICENSE
 *
 * Date: 2018-12-04T03:59:17Z
 */
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
    };

    function genOuterHTML(node) {
        return '<script' +
            $.map(node.attributes, function(a) {
                return a.specified ? ' '+a.name+'="'+a.value+'"' : '';
            }).join('') +
            '>' + node.innerHTML + '<\/script>';
    }

    FAsync.prototype = {
        '_frame': function() {
            return $('<iframe name="'+this.id+'" class="forceAsyncFrame" style="width:100%;height:0;margin:0;border:0;padding:0;"' +
                ' marginwidth="0" marginheight="0" frameborder="0" scrolling="no" allowtransparency="true" seamless/>');
        },
        'load': function() {
            var self = this,
                $div = $('<div/>').append((self.$f = self._frame()).hide());
            if (self.reload) {
                self.$t.before($div);
            } else {
                self.$t.replaceWith($div);
                self.reload = true;
            }
            self.$f.load(function(){
                setTimeout(function(){
                    self.$f.show();
                    self.onload();
                }, 4);
            });
            self[DynamicLoad ? '_loadD' : '_loadS']();
        },
        'onload': function() {
            var self = this, h;

            h = $(self.doc()).height();
            if (h > 0) {
                self.$t.remove();
                self.$t = self.$f.height(h).parent().height(h);
            }
            if (self.refresh) {
                setTimeout(function(){ self.load() }, self.refresh);
            }
        },
        '_loadD': function() {
            var self = this;
            var doc = self.doc();
            if (!doc) {
                self._loadS();
                return;
            }
            doc.open('text/html');
            try {
                doc.write('<!DOCTYPE html><html><head><meta charset=utf-8">' +
                    '<base target="_blank"></head>' +
                    '<body style="margin:0;padding:0;">' +
                    '<script>document.charset="utf-8";</script>' +
                    self.pretag() + '<div style="'+self.style+'">' +
                    self.html + '</div></body></html>');
            }
            catch (e) {}
            finally { doc.close() }
        },
        '_loadS': function() {
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
        'pretag': function() {
            var tag = '', i = 0, keys, n;
            if (this.require) {
                keys = this.require.split(/, */);
                for (n = keys.length; i < n; i++) {
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
        'exec': function() {
            $('forceasync').each(function(){
                var script = new FAsync(this);
                if (script.libname) {
                    (Requires[script.libname] = script).remove();
                } else {
                    (Scripts[script.id] = script).load();
                }
            });
        }
    });

    $(function(){
        if (Config.delay) {
            $(window).load(FAsync.exec);
        } else {
            setTimeout(FAsync.exec,0);
        }
    });
})(jQuery);
