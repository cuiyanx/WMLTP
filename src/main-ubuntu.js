console.log("Start test...");

require("../lib/WMLP-init.js");

const monTransform = {
    Jan: 1,
    Feb: 2,
    Mar: 3,
    Apr: 4,
    May: 5,
    Jun: 6,
    Jul: 7,
    Aug: 8,
    Sep: 9,
    Oct: 10,
    Nov: 11,
    Dec: 12
}

var newestDate = {
    year: 0,
    mon: 0,
    day: 0
};

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

var currentNode = null;
var currentCommit = null;
var packageURL = "http://127.0.0.1:8080/tmp/";
var testResultURL = "http://brucedai.github.io/nt/test/index-local.html";
var csvTitle = null;
var csvModule = null;
var csvName = null;
var csvPass = null;
var csvFail = null;
var csvExecution = "auto";
var csvSuite = "tests";
var packageName = null;

(async function() {
    var graspCommit = async function() {
        let arrayCommit = await global.OPERATE_DRIVER.findElements(global.OPERATE_BY.xpath("//table/tbody/tr/td[@valign='top']"));
        for (let i = 1; i <= arrayCommit.length; i++) {
            await arrayCommit[i - 1].findElement(global.OPERATE_BY.xpath("../td[3]")).getText()
                .then(function(message) {
                let array = message.split(" ");
                array = array[0].split("-");

                let year = parseInt(array[2]);
                let mon = parseInt(monTransform[array[1]]);
                let day = parseInt(array[0]);

                if (year > parseInt(newestDate.year)) {
                    newestDate.year = year;
                    newestDate.mon = mon;
                    newestDate.day = day;
                    currentNode = arrayCommit[i - 1];
                } else if (year == parseInt(newestDate.year)) {
                    if (mon > parseInt(newestDate.mon)) {
                        newestDate.mon = mon;
                        newestDate.day = day;
                        currentNode = arrayCommit[i - 1];
                    } else if (mon == parseInt(newestDate.mon)) {
                        if (day > parseInt(newestDate.day)) {
                            newestDate.day = day;
                            currentNode = arrayCommit[i - 1];
                        }
                    }
                }
            });
        }

        await currentNode.findElement(global.OPERATE_BY.xpath("../td[2]")).getText()
            .then(function(message) {
            currentCommit = message.split("/")[0];
        });
    }

    var graspPackageName = async function() {
        let arrayCommit = await global.OPERATE_DRIVER.findElements(global.OPERATE_BY.xpath("//table/tbody/tr/td[@valign='top']"));
        for (let i = 1; i <= arrayCommit.length; i++) {
            await arrayCommit[i - 1].findElement(global.OPERATE_BY.xpath("../td[2]")).getText()
                .then(function(message) {
                let array = message.split(".");
                for (let x in array) {
                    if (array[x] == "deb") {
                        packageName = message;
                        break;
                    }
                }
            });
        }
    }

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

    var getInfo = async function(element) {
        let arrayTitles, arrayModule;
        let array = await element.findElements(global.OPERATE_BY.xpath("./ul/li[@class='test pass fast' or @class='test pass slow' or @class='test fail']"));

        for (let i = 1; i <= array.length; i++) {
            await getName(array[i - 1])
                .then(function(message) {
                csvName = message;
            });

            await getError(array[i - 1])
                .then(function(message) {
                csvPass = null;
                csvFail = "1";
            }).catch(function(error) {
                csvPass = "1";
                csvFail = null;
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

    var graspTestResult = async function() {
        // mocha-report
        let arrayTitles = await global.OPERATE_DRIVER.findElements(global.OPERATE_BY.xpath("//ul[@id='mocha-report']/li[@class='suite']"));
        for (let i = 1; i <= arrayTitles.length; i++) {
            await arrayTitles[i - 1].findElement(global.OPERATE_BY.xpath("./h1/a")).getText()
                .then(function(message) {
                csvTitle = message;
                csvModule = null;
            });

            let arrayModule = await arrayTitles[i - 1].findElements(global.OPERATE_BY.xpath("./ul/li[@class='suite']"));
            for (let j = 1; j <= arrayModule.length; j++) {
                await arrayModule[j - 1].findElement(global.OPERATE_BY.xpath("./h1/a")).getText()
                    .then(function(message) {
                    let array = message.split("#");
                    csvModule = array[1];
                });

                await getInfo(arrayModule[j - 1]);
            }

            await getInfo(arrayTitles[i - 1]);
        }
    }

    console.log(global.LOGGER_HEARD + "open URL: " + packageURL);
    await global.CHROME_OPEN(packageURL);
    await global.CHROME_WAIT(10000);

    console.log(global.LOGGER_HEARD + "start grasping newest commit");
    await graspCommit();
    console.log(global.LOGGER_HEARD + "grasp newest commit: " + currentCommit);

    let path = packageURL + currentCommit + "/linux_x64_SUCCEED/";
    console.log(global.LOGGER_HEARD + "open URL: " + path);
    await global.CHROME_OPEN(path);
    await global.CHROME_WAIT(10000);

    console.log(global.LOGGER_HEARD + "start grasping newest package name");
    await graspPackageName();
    console.log(global.LOGGER_HEARD + "grasp newest package name: " + packageName);
    await global.CHROME_CLOSE();

    console.log(global.LOGGER_HEARD + "download newest package");
    path = path + packageName;
    await global.TOOLS_DOWNLOAD(path);

    console.log(global.LOGGER_HEARD + "install newest package");
    console.log("Installing newest package maybe fail, you can install the package manually");
    await global.CHROME_WAIT(10000);
    await global.TOOLS_INSTALL(global.PACKAGE_PATH + packageName);

    console.log(global.LOGGER_HEARD + "open csv file");
    await global.CSV_OPEN();

    console.log(global.LOGGER_HEARD + "open URL: " + testResultURL);
    await global.CHROME_CREATE();
    await global.CHROME_OPEN(testResultURL);
    await global.CHROME_WAIT(10000);

    console.log(global.LOGGER_HEARD + "start grasping test result");
    await graspTestResult();

    console.log(global.LOGGER_HEARD + "finish grasping test result");
    await global.CSV_CLOSE();
    await global.CHROME_CLOSE();
})().then(function() {
    console.log("Test completed!")
}).catch(function(err) {
    console.log("ERROR: " + err)
});
