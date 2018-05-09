console.log("Test start....");

const childProcess = require("child_process");

(async function() {
    await childProcess.spawnSync("node", ["./examples/download-newest-package.js"], {stdio: "inherit"});
    await childProcess.spawnSync("node", ["./examples/install-newest-package.js"], {stdio: "inherit"});
    await childProcess.spawnSync("node", ["./examples/grasp-test-result.js"], {stdio: "inherit"});
})().then(function() {
    console.log("Test completed!");
}).catch(function(err) {
    console.log("Error: " + err);
});
