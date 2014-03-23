Crosswords
==========

Crosswords lets you play crosswords on Ubuntu.  It is based on Ubuntu's
[HTML5 SDK][1].

[1]: http://developer.ubuntu.com/api/html5/sdk-14.04/

Crosswords is in very early development.  Right now, there's no
installation procedure.  Ideally, it could be run with
`ubuntu-html5-app-launcher --www=www`.  However, several bugs make the
app launcher sub-optimal in the desktop.  Instead, run the `crosswords`
script to get a little GTK window that does better.

You can also open `www/index.html` in your WebKit-based web browser.
(The SDK doesn't work so well in Firefox.)  Note that some puzzles may
not load, due to cross-origin restrictions.  You may be able to fix this
with your browser's settings.

Crosswords should work on the phone, but you can't do much without the
on-screen keyboard.  So far, I haven't worked out how to trigger it from
the HTML5 SDK.

License
-------
Crosswords is licensed under the GNU General Public License (version 3
or later).  See the LICENSE files for terms.
