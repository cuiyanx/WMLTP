console.log("Test start....");

const childProcess = require("child_process");
const fs = require("fs");

var WMLPjson = JSON.parse(fs.readFileSync("./lib/WMLP-init.json"));
var platforms = WMLPjson.platform;

(async function() {
    for (let x in platforms) {
        WMLPjson = JSON.parse(fs.readFileSync("./lib/WMLP-init.json"));
        WMLPjson.currentplatform = platforms[x];
        fs.writeFileSync("./lib/WMLP-init.json", JSON.stringify(WMLPjson, null, 4));

        await childProcess.spawnSync("node", ["./examples/download-newest-package.js"], {stdio: "inherit"});
        await childProcess.spawnSync("node", ["./examples/install-newest-package.js"], {stdio: "inherit"});
        await childProcess.spawnSync("node", ["./examples/grasp-test-result.js"], {stdio: "inherit"});
    }
})().then(function() {
    console.log("Test completed!");
}).catch(function(err) {
    console.log("Error" + err);
});
