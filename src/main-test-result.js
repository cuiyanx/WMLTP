console.log("Grasping test result...");

const csv = require("../lib/saving-csv-file").SavingCSVFile;
const Web = require("../lib/grasping-web-info").GraspingWebInfo;

(async function() {
    await csv.setPlatform("ubuntu");
    await csv.Open()
        .then(function() {
        console.log("Open csv file success!");
    })
        .catch(function() {
        console.log("Open csv file fail!");
    });

    await Web.setChromePath("/usr/bin/chromium-browser-unstable");
    await Web.setCSVFile(csv);
    await Web.setPlatforms("ubuntu");
    await Web.setWebMLSwitch(false);
    await Web.CreateDriver();
    await Web.Open("http://brucedai.github.io/nt/test/index-local.html");
    await Web.GraspTestResult()
        .then(function() {
        console.log("Grasp test result success!");
    })
        .catch(function(e) {
        console.log("Grasp test result fail!");
        throw e;
    });
    await Web.Close();

    await csv.Close()
        .then(function() {
        console.log("Close csv file success!");
    })
        .catch(function() {
        console.log("Close csv file fail!");
    });
})().then(_ => console.log("Grasping test result is completed!"), err => console.log("ERROR: " + err));
