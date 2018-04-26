'use strict';

require("../lib/WMLP-init.js");

MODULE_JSON.open();

if (MODULE_JSON.package == null) {
    throw new Error("Need package name");
}

var localPath = PACKAGE_PATH + MODULE_JSON.package;

if (MODULE_JSON.flag) {
    (async function() {
        console.log(LOGGER_HEARD + "install newest package: " + localPath);
        await MODULE_TOOLS.install(localPath);
    })().then(function() {
        console.log("Installing package is completed!");
    }).catch(function(err) {
        console.log("Error" + err);
    });
} else {
    console.log(LOGGER_HEARD + "no need install newest package");
}

MODULE_JSON.close();
