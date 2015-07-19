#!/usr/bin/env node

// Hook to install plugins
// http://devgirl.org/2013/11/12/three-hooks-your-cordovaphonegap-project-needs/

var pluginList = [
    "https://github.com/Initsogar/cordova-webintent.git",
    "intentFilterPlugin"
];

var sys = require("sys");
var exec = require("child_process").exec;

function puts(error, stdout, stderr) {
    sys.puts(stdout);
}

pluginList.forEach(function (plug) {
    exec("cordova plugin add " + plug, puts);
});
