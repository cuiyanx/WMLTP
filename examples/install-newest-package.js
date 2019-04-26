require("../lib/WMLTP-init.js");
const path = require("path");

(async function() {
    var installPackage = async function() {
        let localPath = path.join(GET_CHROMIUM_PATH(), MODULE_JSON.getPath(), MODULE_JSON.getPackage());
        let resultInstalled = await MODULE_TOOLS.checkInstalled();
        console.log(LOGGER_HEARD() + "check package has installed: " + resultInstalled);

        let installFlag = false;
        if (resultInstalled) {
            let resultMD5 = await MODULE_TOOLS.checkMD5(localPath);
            console.log(LOGGER_HEARD() + "check md5 value of package: " + resultMD5);

            if (resultMD5) {
                installFlag = false;
                console.log(LOGGER_HEARD() + "no need install package");
            } else {
                installFlag = true;
                console.log(LOGGER_HEARD() + "install package");
            }
        } else {
            installFlag = true;
            console.log(LOGGER_HEARD() + "install package");
        }

        if (installFlag) {
            await MODULE_TOOLS.install(localPath);
        }
    }

    for (let x in TARGET_PLATFORMS) {
        TEST_PLATFORM = TARGET_PLATFORMS[x];
        await installPackage();
    }
})().then(function() {
    console.log("Installing package is completed!");
}).catch(function(err) {
    throw err;
});
