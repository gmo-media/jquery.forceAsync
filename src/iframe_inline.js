(function(w, d){
    function camelize(_, c) {
        return c.toUpperCase();
    }

    function parentStyle(style) {
        var styles = style.split(/; */),
            container = d.getElementById('c'),
            i, len, kv;
        for (i = 0, len = styles.length; i < len; i++) {
            kv = styles[i].split(/: */);
            kv[0] = kv[0].replace(/-(.)/g, camelize);
            try {
                container.style[ kv[0] ] = kv[1];
            }
            catch (e) {}
        }
    }

    if (w.parent && w.parent.jQuery && w.parent.jQuery.forceAsync) {
        var script = w.parent.jQuery.forceAsync.getScript(w.name);
        if (script) {
            try {
                d.write(script.html);
            }
            catch (e) {}

            if (script.style !== '') {
                parentStyle(script.style);
            }
        }
    }
})(window, document);
