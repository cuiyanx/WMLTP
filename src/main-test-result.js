console.log("Grasping test result...");

const chromedriver = require("../lib/chrome-driver").ChromeDriver;
const csv = require("../lib/saving-csv-file").SavingCSVFile;
const gts = require("../lib/grasping-test-result").TestResult;

(async function() {
    await csv.setPlatform("ubuntu");
    await csv.Open()
        .then(function() {
        console.log("Open csv file success!");
    });

    await chromedriver.setChromePath("/usr/bin/chromium-browser-unstable");
    await chromedriver.setPlatform("ubuntu");
    await chromedriver.setWebMLSwitch(false);
    await chromedriver.create();
    await chromedriver.open("http://brucedai.github.io/nt/test/index-local.html");
    await chromedriver.wait(10000);

    let driver = chromedriver.getDriver();
    let By = chromedriver.getBy();
    await gts.grasp(driver, By, csv)
        .then(function() {
        console.log("Grasp test result success!");
    });

    await chromedriver.close();
    await csv.Close()
        .then(function() {
        console.log("Close csv file success!");
    });
})().then(_ => console.log("Grasping test result is completed!"), err => console.log("ERROR: " + err));
