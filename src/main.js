console.log("Test start....");

const childProcess = require("child_process");

(async function() {
    await childProcess.spawnSync("node", ["./examples/download-newest-package.js"], {stdio: "inherit"});

    let processInstall = await childProcess.spawnSync("node", ["./examples/install-newest-package.js"], {stdio: [process.stdin, process.stdout, "pipe"]});

    if (processInstall.stderr.toString() != "") {
        process.exit(1);
    }

    await childProcess.spawnSync("node", ["./examples/grasp-test-result.js"], {stdio: "inherit"});
})().then(function() {
    console.log("Test completed!");
}).catch(function(err) {
    console.log("Error: " + err);
});
