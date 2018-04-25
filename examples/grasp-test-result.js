'use strict';

require("../lib/WMLP-init.js");

global.CSV_HEADER = [
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
        await element.findElement(global.OPERATE_BY.xpath("./h2")).getText()
            .then(function(message) {
            length = message.length - 1;
            Text = message;
        });

        let arrayElement = await element.findElements(global.OPERATE_BY.xpath("./h2/child::*"));
        for (let j = 1; j <= arrayElement.length; j++) {
            await arrayElement[j - 1].getText()
                .then(function(message) {
                length = length - message.length;
            });
        }

        return Text.slice(0, length);
    }

    var getError = async function(element) {
        let Text = await element.findElement(global.OPERATE_BY.xpath("./pre[@class='error']")).getText();

        return Text;
    }

    var getCode = async function(element) {
        let Text = await element.findElement(global.OPERATE_BY.xpath("./pre[last()]")).getText();

        return Text;
    }

    var getInfo = async function(element) {
        let arrayTitles, arrayModule;
        let array = await element.findElements(global.OPERATE_BY.xpath("./ul/li[@class='test pass fast' or @class='test pass slow' or @class='test fail']"));

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
            await global.CSV_WRITE(DataFormat);

            csvName = null;
            csvPass = null;
            csvFail = null;
        }
    }

    var check = async function() {
        await global.OPERATE_DRIVER.findElement(global.OPERATE_BY.xpath("//ul[@id='mocha-stats']/li[@class='passes']//em")).getText()
            .then(function(message) {
            let getPasses = message;
            console.log("    Web passes: " + getPasses);
            console.log("  Check passes: " + countPasses);
        });

        await global.OPERATE_DRIVER.findElement(global.OPERATE_BY.xpath("//ul[@id='mocha-stats']/li[@class='failures']//em")).getText()
            .then(function(message) {
            let getFailures = message;
            console.log("  Web failures: " + getFailures);
            console.log("Check failures: " + countFailures);
        });

        await global.OPERATE_DRIVER.findElement(global.OPERATE_BY.xpath("//ul[@id='mocha-stats']/li[@class='duration']//em")).getText()
            .then(function(message) {
            let Duration = message;
            console.log("      Duration: " + Duration + " ms");
        });
    }

    var grasp = async function() {
        // mocha-report
        let arrayTitles = await global.OPERATE_DRIVER.findElements(global.OPERATE_BY.xpath("//ul[@id='mocha-report']/li[@class='suite']"));
        for (let i = 1; i <= arrayTitles.length; i++) {
            await arrayTitles[i - 1].findElement(global.OPERATE_BY.xpath("./h1/a")).getText()
                .then(function(message) {
                csvTitle = message;
                csvModule = null;
                console.log(i + ": " + csvTitle);
            });

            let arrayModule = await arrayTitles[i - 1].findElements(global.OPERATE_BY.xpath("./ul/li[@class='suite']"));
            for (let j = 1; j <= arrayModule.length; j++) {
                await arrayModule[j - 1].findElement(global.OPERATE_BY.xpath("./h1/a")).getText()
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

    console.log(global.LOGGER_HEARD + "open csv file");
    await global.CSV_OPEN();

    console.log(global.LOGGER_HEARD + "open URL: " + remoteURL);
    await global.CHROME_OPEN(remoteURL);
    await global.CHROME_WAIT(10000);

    console.log(global.LOGGER_HEARD + "start grasping test result");
    await grasp();

    console.log(global.LOGGER_HEARD + "finish grasping test result");
    await global.CSV_CLOSE();
    await global.CHROME_CLOSE();
})().then(function() {
    console.log("Grasping test result is completed!");
}).catch(function(err) {
    console.log("Error" + err);
});
