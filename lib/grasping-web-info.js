'use strict';

const {Builder, By, Key, until} = require("../node_modules/selenium-webdriver");
const chrome = require("../node_modules/selenium-webdriver/chrome");

var countPasses = 0;
var countFailures = 0;
var csvTitle = null;
var csvModule = null;
var csvName = null;
var csvPass = null;
var csvFail = null;
var csvExecution = "auto";
var csvSuite = "tests";

class GraspingWebInfo {

    constructor(){
        this.RemoteURL = "http://127.0.0.1:8080/test/";
        this.WaitTime = 10000;
        this.Driver = null;
        this.Options = null;
        this.CSVFile = null;
        this.Path = "/usr/bin/chromium-browser-unstable";
        this.WebMLSwitch = "--enable-features=WebML";
        this.Platforms = "ubuntu";
    }

    setPlatforms(platforms) {
        this.Platforms = platforms;
    }

    setCSVFile(csvfile) {
        this.CSVFile = csvfile;
    }

    setWebMLSwitch(switchs) {
        if (!switchs) {
            this.WebMLSwitch = "--disable-features=WebML";
        }
    }

    setWaitTime(WaitTime) {
        this.WaitTime = WaitTime;
    }

    setRemoteURL(RemoteURL) {
        this.RemoteURL = RemoteURL;
    }

    setChromePath(path) {
        this.Path = path;
    }

    async CreateDriver() {
        if (this.Platforms === "android") {
            this.Options = new chrome
                .Options()
                .androidChrome()
                .addArguments(this.WebMLSwitch);
        } else if (this.Platforms === "ubuntu") {
            this.Options = new chrome
                .Options()
                .setChromeBinaryPath(this.Path)
                .addArguments(this.WebMLSwitch);
        }

        this.Driver = new Builder()
            .forBrowser("chrome")
            .setChromeOptions(this.Options)
            .build();
    }

    async Open(RemoteURL) {
        this.RemoteURL = RemoteURL;
        await this.Driver.get(this.RemoteURL);
        await this.Driver.sleep(this.WaitTime);
    }

    async Close() {
        this.Driver.close();
    }

    async getTestCaseName(element) {
        let Text = null;
        let length = 0;
        await element.findElement(By.xpath("./h2")).getText()
            .then(function(message) {
            length = message.length - 1;
            Text = message;
        });

        let arrayElement = await element.findElements(By.xpath("./h2/child::*"));
        for (let j = 1; j <= arrayElement.length; j++) {
            await arrayElement[j - 1].getText()
                .then(function(message) {
                length = length - message.length;
            });
        }

        return Text.slice(0, length);
    }

    async getTestCaseError(element) {
        let Text = await element.findElement(By.xpath("./pre[@class='error']")).getText();

        return Text;
    }

    async getTestCaseCode(element) {
        let Text = await element.findElement(By.xpath("./pre[last()]")).getText();

        return Text;
    }

    async getTestCaseInfo(element) {
        let arrayTitles, arrayModule;
        let array = await element.findElements(By.xpath("./ul/li[@class='test pass fast' or @class='test pass slow' or @class='test fail']"));

        for (let i = 1; i <= array.length; i++) {
            await this.getTestCaseName(array[i - 1])
                .then(function(message) {
                csvName = message;
                console.log("       " + i + ") " + message);
            });

            await this.getTestCaseError(array[i - 1])
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
            await this.CSVFile.WriteData(DataFormat);

            csvName = null;
            csvPass = null;
            csvFail = null;
        }
    }

    async checkTestResult() {
        console.log("---------------------------------------------------");

        await this.Driver.findElement(By.xpath("//ul[@id='mocha-stats']/li[@class='passes']//em")).getText()
            .then(function(message) {
            let getPasses = message;
            console.log("    Web passes: " + getPasses);
            console.log("  Check passes: " + countPasses);
        })
            .catch(function(reason) {
            console.log("ERROR: " + reason);
        });

        await this.Driver.findElement(By.xpath("//ul[@id='mocha-stats']/li[@class='failures']//em")).getText()
            .then(function(message) {
            let getFailures = message;
            console.log("  Web failures: " + getFailures);
            console.log("Check failures: " + countFailures);
        })
            .catch(function(reason) {
            console.log("ERROR: " + reason);
        });

        await this.Driver.findElement(By.xpath("//ul[@id='mocha-stats']/li[@class='duration']//em")).getText()
            .then(function(message) {
            let Duration = message;
            console.log("      Duration: " + Duration + " ms");
        })
            .catch(function(reason) {
            console.log("ERROR: " + reason);
        });

        console.log("---------------------------------------------------");
    }

    async GraspTestResult() {
        if (this.CSVFile == null) {
            throw new Error("Set saving csv file first!");
        }

        // mocha-report
        let arrayTitles = await this.Driver.findElements(By.xpath("//ul[@id='mocha-report']/li[@class='suite']"));
        for (let i = 1; i <= arrayTitles.length; i++) {
            await arrayTitles[i - 1].findElement(By.xpath("./h1/a")).getText()
                .then(function(message) {
                csvTitle = message;
                csvModule = null;
                console.log(i + ": " + csvTitle);
            });

            let arrayModule = await arrayTitles[i - 1].findElements(By.xpath("./ul/li[@class='suite']"));
            for (let j = 1; j <= arrayModule.length; j++) {
                await arrayModule[j - 1].findElement(By.xpath("./h1/a")).getText()
                    .then(function(message) {
                    let array = message.split("#");
                    csvModule = array[1];
                    console.log("    #" + j + ": " + csvModule);
                });

                await this.getTestCaseInfo(arrayModule[j - 1]);
            }

            await this.getTestCaseInfo(arrayTitles[i - 1]);
        }

        // mocha-stats
        await this.checkTestResult();
    }

}

// PUBLIC API

exports.GraspingWebInfo = new GraspingWebInfo();
