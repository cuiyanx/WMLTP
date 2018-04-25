'use strict';

require("../lib/WMLP-init.js");

if (global.NEWEST_PACKAGE == null) {
    throw new Error("Need package name");
}

var localPath = global.PACKAGE_PATH + global.NEWEST_PACKAGE;

(async function() {
    console.log(global.LOGGER_HEARD + "install newest package: " + localPath);
    await global.TOOLS_INSTALL(localPath);
    await global.CHROME_CLOSE();
})().then(function() {
    console.log("Installing package is completed!");
}).catch(function(err) {
    console.log("Error" + err);
});
