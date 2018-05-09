require("../lib/WMLP-init.js");

MODULE_CSV.header = [
    "Feature",
    "CaseId",
    "TestCase",
    "Pass",
    "Fail",
    "N/A",
    "Measured",
    "Comment",
    "MeasuredName",
    "Value",
    "Unit",
    "Target",
    "Failure",
    "ExecutionType",
    "SuiteName"
];

var countPasses = 0;
var countFailures = 0;
var csvTitle = null;
var csvModule = null;
var csvName = null;
var csvPass = null;
var csvFail = null;
var csvExecution = "auto";
var csvSuite = "tests";
var remoteURL = "http://brucedai.github.io/nt/test/index-local.html";

(async function() {
    var getName = async function(element) {
        let Text = null;
        let length = 0;
        await element.findElement(MODULE_CHROME.by.xpath("./h2")).getText()
            .then(function(message) {
            length = message.length - 1;
            Text = message;
        });

        let arrayElement = await element.findElements(MODULE_CHROME.by.xpath("./h2/child::*"));
        for (let j = 1; j <= arrayElement.length; j++) {
            await arrayElement[j - 1].getText()
                .then(function(message) {
                length = length - message.length;
            });
        }

        return Text.slice(0, length);
    }

    var getError = async function(element) {
        let Text = await element.findElement(MODULE_CHROME.by.xpath("./pre[@class='error']")).getText();

        return Text;
    }

    var getCode = async function(element) {
        let Text = await element.findElement(MODULE_CHROME.by.xpath("./pre[last()]")).getText();

        return Text;
    }

    var getInfo = async function(element) {
        let arrayTitles, arrayModule;
        let array = await element.findElements(MODULE_CHROME.by.xpath("./ul/li[@class='test pass fast' or @class='test pass slow' or @class='test fail']"));

        for (let i = 1; i <= array.length; i++) {
            await getName(array[i - 1])
                .then(function(message) {
                csvName = message;
                console.log("       " + i + ") " + message);
            });

            await getError(array[i - 1])
                .then(function(message) {
                csvPass = null;
                csvFail = "1";
                countFailures++;
                console.log("           Test failed!");
            }).catch(function(error) {
                csvPass = "1";
                csvFail = null;
                countPasses++;
                console.log("           Test passed!");
            });

            if (csvModule == null) {
                csvModule = csvTitle;
            }

            let DataFormat = {
                Feature: csvTitle,
                CaseId: csvModule + "/" + i,
                TestCase: csvName,
                Pass : csvPass,
                Fail: csvFail,
                ExecutionType: csvExecution,
                SuiteName: csvSuite
            };
            await MODULE_CSV.write(DataFormat);

            csvName = null;
            csvPass = null;
            csvFail = null;
        }
    }

    var check = async function() {
        await MODULE_CHROME.driver.findElement(MODULE_CHROME.by.xpath("//ul[@id='mocha-stats']/li[@class='passes']//em")).getText()
            .then(function(message) {
            let getPasses = message;
            console.log("    Web passes: " + getPasses);
            console.log("  Check passes: " + countPasses);
        });

        await MODULE_CHROME.driver.findElement(MODULE_CHROME.by.xpath("//ul[@id='mocha-stats']/li[@class='failures']//em")).getText()
            .then(function(message) {
            let getFailures = message;
            console.log("  Web failures: " + getFailures);
            console.log("Check failures: " + countFailures);
        });

        await MODULE_CHROME.driver.findElement(MODULE_CHROME.by.xpath("//ul[@id='mocha-stats']/li[@class='duration']//em")).getText()
            .then(function(message) {
            let Duration = message;
            console.log("      Duration: " + Duration + " ms");
        });
    }

    var grasp = async function() {
        // mocha-report
        let arrayTitles = await MODULE_CHROME.driver.findElements(MODULE_CHROME.by.xpath("//ul[@id='mocha-report']/li[@class='suite']"));
        for (let i = 1; i <= arrayTitles.length; i++) {
            await arrayTitles[i - 1].findElement(MODULE_CHROME.by.xpath("./h1/a")).getText()
                .then(function(message) {
                csvTitle = message;
                csvModule = null;
                console.log(i + ": " + csvTitle);
            });

            let arrayModule = await arrayTitles[i - 1].findElements(MODULE_CHROME.by.xpath("./ul/li[@class='suite']"));
            for (let j = 1; j <= arrayModule.length; j++) {
                await arrayModule[j - 1].findElement(MODULE_CHROME.by.xpath("./h1/a")).getText()
                    .then(function(message) {
                    let array = message.split("#");
                    csvModule = array[1];
                    console.log("    #" + j + ": " + csvModule);
                });

                await getInfo(arrayModule[j - 1]);
            }

            await getInfo(arrayTitles[i - 1]);
        }

        // mocha-stats
        await check();
    }

    for (let x in TARGET_PLATFORMS) {
        TEST_PLATFORM = TARGET_PLATFORMS[x];

        console.log(LOGGER_HEARD() + "open csv file");
        await MODULE_CSV.open();

        console.log(LOGGER_HEARD() + "open URL: " + remoteURL);
        await MODULE_CHROME.setBrowserNewest(true);
        await MODULE_CHROME.create();
        await MODULE_CHROME.open(remoteURL);
        await MODULE_CHROME.wait(10000);

        console.log(LOGGER_HEARD() + "start grasping test result");
        await grasp();

        console.log(LOGGER_HEARD() + "finish grasping test result");
        await MODULE_CSV.close();
        await MODULE_CHROME.close();
    }
})().then(function() {
    console.log("Grasping test result is completed!");
}).catch(function(err) {
    console.log("Error: " + err);
});
