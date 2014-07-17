var t0;
function timelog(label) {
    if ($ && $.forceAsync && $.forceAsync.t0) {
        t0 = $.forceAsync.t0;
    }
    console.log(label + ' - ' + (Date.now() - t0) + 'ms');
};

// Date.now
if (typeof Date.now !== 'function') {
    Date.now = function(){ return (new Date()).getTime() };
}
t0 = Date.now();

// console.log
if (!window.console) {
    alert('create console window');
    var con = window.console = {
        doc: null,
        log: function(msg) {
            con.doc.writeln(
                msg.replace(/&/g,'&amp;')
                   .replace(/</g,'&lt;')
                   .replace(/>/g,'&gt;')
                   .replace(/"/g,'&quot;')
                   .replace(/\n/g, '<br>'),
                '<hr>'
            );
        },
        init: function() {
            con.doc = window.open('', '_blank').document;
            con.doc.open('text/html');
            con.doc.write('<h1>console.log</h1>');
        }
    };
    con.init();
}

// set event handler
$(document).ready(function(){ timelog('document.ready') });
$( window ).load( function(){ timelog('window.load') });

