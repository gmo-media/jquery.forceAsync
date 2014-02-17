var w = window,
    s = w.parent.jQuery.forceAsync.getScript(w.name);
if (s) {
    try{
        w.document.write('<div style="' + s.style + '">' + s.html + '</div>');
    } catch(e) {}
}
