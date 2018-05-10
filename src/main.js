console.log("Test start....");

const childProcess = require("child_process");

(async function() {
    let processDownload = await childProcess.spawnSync(
        "node",
        ["./examples/download-newest-package.js"],
        {stdio: [process.stdin, process.stdout, "pipe"]}
    );

    if (processDownload.stderr.toString() != "") {
        console.log(processDownload.stderr.toString());
        process.exit(1);
    }

    let processInstall = await childProcess.spawnSync(
        "node",
        ["./examples/install-newest-package.js"],
        {stdio: [process.stdin, process.stdout, "pipe"]}
    );

    if (processInstall.stderr.toString() != "") {
        console.log(processInstall.stderr.toString());
        process.exit(1);
    }

    let processTestResult = await childProcess.spawnSync(
        "node",
        ["./examples/grasp-test-result.js"],
        {stdio: [process.stdin, process.stdout, "pipe"]}
    );

    if (processTestResult.stderr.toString() != "") {
        console.log(processTestResult.stderr.toString());
        process.exit(1);
    }
})().then(function() {
    console.log("Test completed!");
}).catch(function(err) {
    console.log("Error: " + err);
});
