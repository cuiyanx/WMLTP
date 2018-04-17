console.log("Test APIs for Grasping web information...");

const csv = require("../lib/savingcsvfile").SavingCSVFile;
const Web = require("../lib/graspingwebinfo").GraspingWebInfo;

(async function() {
    await csv.Open("ubuntu")
        .then(function() {
        console.log("Open csv file success!");
    })
        .catch(function() {
        console.log("Open csv file fail!");
    });

    let driver = "ubuntu";
    //let driver = "andriod";
    let RemoteURL = "http://127.0.0.1:8080/test/";
    //let RemoteURL = "http://brucedai.github.io/nt/test/index-local.html";
    let WaitTime = 10000;
    await Web.init(driver, csv, RemoteURL, WaitTime);
    await Web.Grasp();

    await csv.Close()
        .then(function() {
        console.log("Close csv file success!");
    })
        .catch(function() {
        console.log("Close csv file fail!");
    });
})().then(_ => console.log("Test complete!"), err => console.log("ERROR: " + err));