require("../lib/WMLTP-init.js");
const cheerio = require("cheerio");
const fs = require("fs");
const os = require("os");

(async function() {
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
        }).catch(async function(err) {
            if (err.message.search("session deleted because of page crash") != -1) {
                console.log(LOGGER_HEARD() + "remote URL is crashed");

                await MODULE_CSV.close();
                await MODULE_CHROME.close();
            } else {
                throw err;
            }
        });

        console.log(LOGGER_HEARD() + "grasping test case....\n");

        await MODULE_CHROME.script("return document.documentElement.outerHTML").then(async function(html) {
            let graspTotal, graspPass, graspFail;
            let actions = 0;
            let countPasses = 0;
            let countFailures = 0;
            let countTotal = 0;

            await MODULE_CHROME.driver.findElement(MODULE_CHROME.by.xpath("//ul[@id='mocha-stats']/li[@class='passes']//em"))
            .getText().then(function(message) {
                graspPass = message >> 0;
            });

            await MODULE_CHROME.driver.findElement(MODULE_CHROME.by.xpath("//ul[@id='mocha-stats']/li[@class='failures']//em"))
            .getText().then(function(message) {
                graspFail = message >> 0;
            });

            graspTotal = graspPass + graspFail;

            let $ = cheerio.load(html);

            function getSuiteName($, suiteElement) {
                return $(suiteElement).children("h1").children("a").text();
            }

            function checkSuiteOrCase($, suiteElement) {
                let checkPoint = "case";
                $(suiteElement).children("ul").children().each(function(i, element) {
                    if ($(element).attr("class") === "suite") checkPoint = "suite";
                });

                return checkPoint;
            }

            function getCaseStatus($, caseElement) {
                let caseStatus = $(caseElement).attr("class");
                let resultStatus = null;
                if (caseStatus == "test pass pending") {
                    resultStatus = "N/A";
                } else if (caseStatus == "test pass fast" || caseStatus == "test pass slow" || caseStatus == "test pass medium") {
                    resultStatus = "Pass";
                } else if (caseStatus == "test fail") {
                    resultStatus = "Fail";
                } else {
                    throw new Error("not support case status");
                }

                return resultStatus;
            }

            function getCaseName($, caseElement) {
                let caseName = $(caseElement).children("h2").text();
                let length = caseName.length - 1;
                $(caseElement).children("h2").children().each(function(i, element) {
                    length = length - $(element).text().length;
                });
                return caseName.slice(0, length).trim();
            }

            // title suite
            $("#mocha-report").children(".suite").each(function(i, titleElement) {
                let titleName = getSuiteName($, titleElement);

                if (checkSuiteOrCase($, titleElement) == "case") {
                    let moduleName = titleName;

                    // test case
                    $(titleElement).children("ul").children("li").each(function(j, caseElement) {
                        let caseStatusPass, caseStatusFail;
                        let caseStatus = getCaseStatus($, caseElement);
                        let caseName = getCaseName($, caseElement);

                        if (caseStatus == "Pass") {
                            countPasses = countPasses + 1;
                            caseStatusPass = 1;
                            caseStatusFail = null;
                        } else {
                            countFailures = countFailures + 1;
                            caseStatusPass = null;
                            caseStatusFail = 1;
                        }

                        actions = actions + 1;
                        console.log("\033[1A\033[50D\033[K    grasping: " + actions + "/" + graspTotal);

                        let number = j + 1;
                        let DataFormat = {
                            Feature: titleName,
                            CaseId: moduleName + "/" + number,
                            TestCase: caseName,
                            Pass : caseStatusPass,
                            Fail: caseStatusFail,
                            NA: null,
                            ExecutionType: "auto",
                            SuiteName: "tests"
                        };

                        MODULE_CSV.write(DataFormat);
                    });
                } else {
                    // module suite
                    $(titleElement).children("ul").children(".suite").each(function(j, moduleElement) {
                        let moduleName = getSuiteName($, moduleElement).split("#")[1];

                        if (checkSuiteOrCase($, moduleElement) == "case") {
                            // test case
                            $(moduleElement).children("ul").children("li").each(function(k, caseElement) {
                                let caseStatusPass, caseStatusFail;
                                let caseStatus = getCaseStatus($, caseElement);
                                let caseName = getCaseName($, caseElement);

                                if (caseStatus == "Pass") {
                                    countPasses = countPasses + 1;
                                    caseStatusPass = 1;
                                    caseStatusFail = null;
                                } else {
                                    countFailures = countFailures + 1;
                                    caseStatusPass = null;
                                    caseStatusFail = 1;
                                }

                                actions = actions + 1;
                                console.log("\033[1A\033[50D\033[K    grasping: " + actions + "/" + graspTotal);

                                let number = k + 1;
                                let DataFormat = {
                                    Feature: titleName,
                                    CaseId: moduleName + "/" + number,
                                    TestCase: caseName,
                                    Pass : caseStatusPass,
                                    Fail: caseStatusFail,
                                    NA: null,
                                    ExecutionType: "auto",
                                    SuiteName: "tests"
                                };

                                MODULE_CSV.write(DataFormat);
                            });
                        }
                    });
                }
            });

            if (graspPass != countPasses) {
                console.log(LOGGER_HEARD() + graspPass + " : " + countPasses);
                throw new Error("It's wrong to passed result!");
            }

            if (graspFail != countFailures) {
                console.log(LOGGER_HEARD() + graspFail + " : " + countFailures);
                throw new Error("It's wrong to failed result!");
            }

            countTotal = countPasses + countFailures;
            console.log(LOGGER_HEARD() + "grasp all test case: " + countTotal);
            console.log("    Web passes: " + graspPass);
            console.log("  Check passes: " + countPasses);
            console.log("  Web failures: " + graspFail);
            console.log("Check failures: " + countFailures);
            console.log("         TOTAL: " + graspTotal);
        });

        console.log(LOGGER_HEARD() + "finish grasping test result with '" + prefer + "'");
        await MODULE_CSV.close();
        await MODULE_CHROME.close();
    }

    for (let platform of TARGET_PLATFORMS) {
        TEST_PLATFORM = platform;
        let preferArray = GET_PREFER_MODELS();
        console.log(LOGGER_HEARD() + "prefer: " + preferArray);

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
