#! /usr/bin/perl
use strict;
use warnings;
use CGI;

my $q = new CGI;

my $sec = $q->param("sleep");
if ($sec =~ /\A[1-9]\d*\z/) {
	sleep $sec;
}
else {
	$sec = 0;
}

print <<EOH;
Content-Type: text/javascript; charset=UTF-8

document.writeln('<div style="background:blue;color:white;font-weight:bold;">Sleep $sec</div>');
EOH
