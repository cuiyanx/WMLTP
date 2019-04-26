require("../lib/WMLTP-init.js");
const fs = require("fs");
const os = require("os");

(async function() {
    var getCaseStatus = async function(element) {
        return element.getAttribute("class").then(function(message) {
            let graspCaseStatus = null;
            if (message == "test pass pending") {
                graspCaseStatus = "N/A";
            } else if (message == "test pass fast" || message == "test pass slow" || message == "test pass medium") {
                graspCaseStatus = "Pass";
            } else if (message == "test fail") {
                graspCaseStatus = "Fail";
            } else {
                throw new Error("not support case status");
            }

            return graspCaseStatus;
        });
    }

    var getCaseName = async function(element) {
        let Text = null;
        let length = 0;
        await element.findElement(MODULE_CHROME.by.xpath("./h2")).getText().then(function(message) {
            length = message.length - 1;
            Text = message;
        });

        let arrayElement = await element.findElements(MODULE_CHROME.by.xpath("./h2/child::*"));
        for (let j = 1; j <= arrayElement.length; j++) {
            await arrayElement[j - 1].getText().then(function(message) {
                length = length - message.length;
            });
        }

        return Text.slice(0, length);
    }

    var grasp = async function() {
        let pageData = new Map();
        let graspTotal, graspPass, graspFail;
        let actions = 0;
        let actionCount = 0;
        let countPasses = 0;
        let countFailures = 0;

        await MODULE_CHROME.driver.findElement(MODULE_CHROME.by.xpath("//ul[@id='mocha-stats']/li[@class='passes']//em"))
        .getText().then(function(message) {
            graspPass = message >> 0;
        });

        await MODULE_CHROME.driver.findElement(MODULE_CHROME.by.xpath("//ul[@id='mocha-stats']/li[@class='failures']//em"))
        .getText().then(function(message) {
            graspFail = message >> 0;
        });

        graspTotal = graspPass + graspFail;

        await MODULE_CHROME.driver.findElements(MODULE_CHROME.by.xpath("//ul[@id='mocha-report']/li[@class='suite']"))
        .then(function(titleElements) {
            for (let titleElement of titleElements) {
                titleElement.findElement(MODULE_CHROME.by.xpath("./h1/a")).getAttribute("textContent")
                .then(function(titleName) {
                    pageData.set(titleName, new Map());

                    titleElement.findElements(MODULE_CHROME.by.xpath("./ul/li[@class='suite']"))
                    .then(function(moduleElements) {
                        if (moduleElements.length === 0) {
                            pageData.get(titleName).set(titleName, new Map());

                            titleElement.findElements(MODULE_CHROME.by.xpath(
                                "./ul/li[@class='test pass fast' or " +
                                "@class='test pass slow' or " +
                                "@class='test fail' or " +
                                "@class='test pass pending' or " +
                                "@class='test pass medium']"))
                            .then(async function(caseElements) {
                                for (let x in caseElements) {
                                    let caseNumber = (parseInt(x) + 1).toString();
                                    pageData.get(titleName).get(titleName).set(caseNumber, new Map());

                                    let caseName = await getCaseName(caseElements[x]);
                                    pageData.get(titleName).get(titleName).get(caseNumber).set("TestCase", caseName);

                                    let caseStatus = await getCaseStatus(caseElements[x]);
                                    if (caseStatus == "Pass") {
                                        countPasses = countPasses + 1;
                                        pageData.get(titleName).get(titleName).get(caseNumber).set("Pass", 1);
                                        pageData.get(titleName).get(titleName).get(caseNumber).set("Fail", null);
                                    } else {
                                        countFailures = countFailures + 1;
                                        pageData.get(titleName).get(titleName).get(caseNumber).set("Pass", null);
                                        pageData.get(titleName).get(titleName).get(caseNumber).set("Fail", 1);
                                    }

                                    actions = actions + 1;
//                                    let showNumber = actions;
//                                    console.log(LOGGER_HEARD() + showNumber + ": " + titleName + "---" + titleName + "---" + caseName);
                                }
                            });
                        } else {
                            for (let moduleElement of moduleElements) {
                                moduleElement.findElement(MODULE_CHROME.by.xpath("./h1/a")).getAttribute("textContent")
                                .then(function(moduleName) {
                                    moduleName = moduleName.split("#")[1];
                                    pageData.get(titleName).set(moduleName, new Map());

                                    moduleElement.findElements(MODULE_CHROME.by.xpath(
                                        "./ul/li[@class='test pass fast' or " +
                                        "@class='test pass slow' or " +
                                        "@class='test fail' or " +
                                        "@class='test pass pending' or " +
                                        "@class='test pass medium']"))
                                    .then(async function(caseElements) {
                                        for (let x in caseElements) {
                                            let caseNumber = (parseInt(x) + 1).toString();
                                            pageData.get(titleName).get(moduleName).set(caseNumber, new Map());

                                            let caseName = await getCaseName(caseElements[x]);
                                            pageData.get(titleName).get(moduleName).get(caseNumber).set("TestCase", caseName);

                                            let caseStatus = await getCaseStatus(caseElements[x]);
                                            if (caseStatus == "Pass") {
                                                countPasses = countPasses + 1;
                                                pageData.get(titleName).get(moduleName).get(caseNumber).set("Pass", 1);
                                                pageData.get(titleName).get(moduleName).get(caseNumber).set("Fail", null);
                                            } else {
                                                countFailures = countFailures + 1;
                                                pageData.get(titleName).get(moduleName).get(caseNumber).set("Pass", null);
                                                pageData.get(titleName).get(moduleName).get(caseNumber).set("Fail", 1);
                                            }

                                            actions = actions + 1;
//                                            let showNumber = actions;
//                                            console.log(LOGGER_HEARD() + showNumber + ": " + titleName + "---" + moduleName + "---" + caseName);
                                        }
                                    });
                                });
                            }
                        }
                    });
                });
            }
        });

        await MODULE_CHROME.check(function() {
            if (actionCount != actions) {
                actionCount = actions;
            }

            return (actions == graspTotal);
        }, 5000000).then(function() {
            console.log(LOGGER_HEARD() + "grasp all test case: " + actionCount);
        }).catch(function() {
            console.log(LOGGER_HEARD() + "total: " + graspTotal + " grasp: " + actionCount);
            throw new Error("failed to grasp all test result");
        });

        if (graspPass != countPasses) {
            console.log(LOGGER_HEARD() + graspPass + " : " + countPasses);
            throw new Error("It's wrong to passed result!");
        }

        if (graspFail != countFailures) {
            console.log(LOGGER_HEARD() + graspFail + " : " + countFailures);
            throw new Error("It's wrong to failed result!");
        }

        console.log("    Web passes: " + graspPass);
        console.log("  Check passes: " + countPasses);
        console.log("  Web failures: " + graspFail);
        console.log("Check failures: " + countFailures);
        console.log("         TOTAL: " + graspTotal);

        for (let titleName of pageData.keys()) {
            for (let moduleName of pageData.get(titleName).keys()) {
                for (let caseNumber of pageData.get(titleName).get(moduleName).keys()) {
                    let DataFormat = {
                        Feature: titleName,
                        CaseId: moduleName + "/" + caseNumber,
                        TestCase: pageData.get(titleName).get(moduleName).get(caseNumber).get("TestCase"),
                        Pass : pageData.get(titleName).get(moduleName).get(caseNumber).get("Pass"),
                        Fail: pageData.get(titleName).get(moduleName).get(caseNumber).get("Fail"),
                        NA: null,
                        ExecutionType: "auto",
                        SuiteName: "tests"
                    };

                    await MODULE_CSV.write(DataFormat);
                }
            }
        }
    }

    var testResult = async function(prefer) {
        console.log(LOGGER_HEARD() + "start grasping test result with '" + prefer + "'");

        let csvFilePath = await MODULE_CSV.open(prefer);
        console.log(LOGGER_HEARD() + "open csv file: '" + csvFilePath + "'");

        await MODULE_CHROME.setBrowserNewest(true);
        await MODULE_CHROME.create(prefer);

        let remoteURL = MODULE_CHROME.getRemoteTestURL();
        await MODULE_CHROME.open(remoteURL);

        console.log(LOGGER_HEARD() + "open URL: " + remoteURL);

        await MODULE_CHROME.check(async function() {
            return MODULE_CHROME.script("return window.mochaFinish;");
        }, 500000).then(async function() {
            console.log(LOGGER_HEARD() + "load remote URL is completed, no crash");

            if (TEST_PLATFORM == "android") {
                let URLPath, sourceHTMLPath;
                if (os.type() == "Windows_NT") {
                    sourceHTMLPath = ".\\output\\source-" + prefer + ".html";
                    URLPath = "file://" + process.cwd() + "\\output\\source-" + prefer + ".html";
                } else {
                    sourceHTMLPath = "./output/source-" + prefer + ".html";
                    URLPath = "file://" + process.cwd() + "/output/source-" + prefer + ".html";
                }

                await MODULE_CHROME.script("return document.documentElement.outerHTML").then(function(html) {
                    console.log(LOGGER_HEARD() + "dowload source html to " + sourceHTMLPath);

                    fs.createWriteStream(sourceHTMLPath, {flags: "w"}).write(html);
                });

                await MODULE_CHROME.close();
                await MODULE_CHROME.wait(2000);

                await MODULE_CHROME.setBrowserNewest(false);
                await MODULE_CHROME.create(null);
                await MODULE_CHROME.open(URLPath);
            }
        }).catch(async function(err) {
            if (err.message.search("session deleted because of page crash") != -1) {
                console.log(LOGGER_HEARD() + "remote URL is crashed");

                await MODULE_CSV.close();
                await MODULE_CHROME.close();
            } else {
                throw err;
            }
        });

        console.log(LOGGER_HEARD() + "grasping test case....");
        await grasp();

        console.log(LOGGER_HEARD() + "finish grasping test result with '" + prefer + "'");
        await MODULE_CSV.close();
        await MODULE_CHROME.close();
    }

    for (let platform of TARGET_PLATFORMS) {
        TEST_PLATFORM = platform;
        let preferArray = GET_PREFER_MODELS();
        CHECK_RUN_ENV();

        if (preferArray.length == 0) {
            await MODULE_TOOLS.uninstallChromium();
            continue;
        } else {
            for (let prefer of preferArray) {
                await testResult(prefer);
            }

            await MODULE_TOOLS.uninstallChromium();
        }
    }
})().then(function() {
    console.log(LOGGER_HEARD() + "Grasping test result is completed!");
}).catch(function(err) {
    throw err;
});
