require("../lib/WMLP-init.js");

(async function() {
    for (let x in TARGET_PLATFORMS) {
        TEST_PLATFORM = TARGET_PLATFORMS[x];

        let localPath = PACKAGE_PATH + MODULE_JSON.getPath() + MODULE_JSON.getPackage();

        let checkResult = await MODULE_TOOLS.check(localPath);
        console.log(LOGGER_HEARD() + "check newest package: " + checkResult);

        if (MODULE_JSON.getFlag()) {
            console.log(LOGGER_HEARD() + "install newest package: " + MODULE_JSON.getFlag());
            try {
                await MODULE_TOOLS.install(localPath);
            } catch(e) {
                MODULE_JSON.writeMd5(null);
                throw e;
            }
        } else {
            console.log(LOGGER_HEARD() + "no need install newest package");
        }
    }
})().then(function() {
    console.log("Installing package is completed!");
}).catch(function(err) {
    throw err;
});
