require("../lib/WMLP-init.js");

(async function() {
    for (let x in TARGET_PLATFORMS) {
        TEST_PLATFORM = TARGET_PLATFORMS[x];

        let localPath = GET_PACKAGE_PATH() + MODULE_JSON.getPath() + MODULE_JSON.getPackage();

        let checkResult = await MODULE_TOOLS.checkInstalled();
        console.log(LOGGER_HEARD() + "check package has installed: " + checkResult);

        if (checkResult) {
            checkResult = await MODULE_TOOLS.checkMD5(localPath);
            console.log(LOGGER_HEARD() + "check md5 value of package: " + checkResult);

            if (checkResult) {
                console.log(LOGGER_HEARD() + "no need install package");
            } else {
                console.log(LOGGER_HEARD() + "install package");
                await MODULE_TOOLS.install(localPath);
            }
        } else {
            console.log(LOGGER_HEARD() + "install package");
            await MODULE_TOOLS.install(localPath);
        }
    }
})().then(function() {
    console.log("Installing package is completed!");
}).catch(function(err) {
    throw err;
});
