console.log("Test APIs for Grasping web information...");

const csv = require("../lib/savingcsvfile").SavingCSVFile;
const Web = require("../lib/graspingwebinfo").GraspingWebInfo;

(async function() {
    let platforms = "ubuntu";
    let RemoteURL = "http://127.0.0.1:8080/test/";
    let WaitTime = 10000;
    await Web.init(platforms, csv, RemoteURL, WaitTime);
    await Web.Grasp();
    await Web.Close();
})().then(_ => console.log("Test complete!"), err => console.log("ERROR: " + err));