console.log("Test APIs for Grasping web information...");

const csv = require("../lib/saving-csv-file").SavingCSVFile;
const Web = require("../lib/grasping-web-info").GraspingWebInfo;

(async function() {
    let platforms = "ubuntu";
    let RemoteURL = "http://127.0.0.1:8080/test/";
    let WaitTime = 20000;
    await Web.setPlatforms(platforms);
    await Web.setCSVFile(csv);
    await Web.setWaitTime(WaitTime);
    await Web.CreateDriver();
    await Web.Open(RemoteURL);
    await Web.GraspTestResult();
    await Web.Close();
})().then(_ => console.log("Test complete!"), err => console.log("ERROR: " + err));