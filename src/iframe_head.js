function camelize(_, c) {
    return c.toUpperCase();
}

function setStyle(style) {
    var styles = style.split(/; */),
        container = document.getElementById('c'),
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

var $ = window.parent.jQuery, script;
if ($ && $.forceAsync) {
    script = $.forceAsync.getScript(window.name);
}

if (script) {
    try {
        document.write(script.pretag());
    }
    catch (e) {}
}
