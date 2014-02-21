function timelog(label) {
    console.log(label + ' - ' + (Date.now() - $.forceAsync.t0) + 'ms');
};

// Date.now
if (typeof Date.now !== 'function') {
    Date.now = function(){ return (new Date()).getTime() };
}

// console.log
if (!window.console) {
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

