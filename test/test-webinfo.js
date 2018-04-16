console.log("Test APIs for Grasping web information...");

const csv = require("../modules/savingcsvfile").SavingCSVFile;
const Web = require("../modules/graspingwebinfo").GraspingWebInfo;

(async function() {
    let driver = "ubuntu";
    let RemoteURL = "http://127.0.0.1:8080/test/";
    let WaitTime = 10000;
    await Web.init(driver, csv, RemoteURL, WaitTime);
    await Web.Grasp();
})().then(_ => console.log("Test complete!"), err => console.log("ERROR: " + err));