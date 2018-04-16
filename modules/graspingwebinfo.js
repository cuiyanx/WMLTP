'use strict';

const {Builder, By, Key, until} = require("../node_modules/selenium-webdriver");
const chrome = require("../node_modules/selenium-webdriver/chrome");

class GraspingWebInfo {

    constructor(){
        this.RemoteURL = "http://127.0.0.1:8080";
        this.WaitTime = 10000;
        this.Driver = new Builder()
            .forBrowser("chrome")
            .setChromeOptions(new chrome.Options())
            .build();
        this.CSVFile = null;
        this.countPasses = 0;
        this.countFailures = 0;
        this.csvTitle = null;
        this.csvModule = null;
        this.csvName = null;
        this.csvPass = null;
        this.csvFail = null;
        this.csvExecution = "auto";
        this.csvSuite = "tests";
    }

    async init(Driver, CSVFile, RemoteURL, WaitTime) {
        if (Driver === "andriod") {
            this.Driver = new Builder()
                .forBrowser("chrome")
                .setChromeOptions(new chrome.Options().androidChrome())
                .build();
        } else if (Driver === "ubuntu") {
            this.Driver = new Builder()
                .forBrowser("chrome")
                .setChromeOptions(new chrome.Options())
                .build();
        }

        this.CSVFile = CSVFile;
        this.RemoteURL = RemoteURL;
        this.WaitTime = WaitTime;
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
                this.csvName = message;
                console.log("       " + i + ") " + message);
            });

            await this.getTestCaseError(array[i - 1])
                .then(function(message) {
                this.csvPass = null;
                this.csvFail = "1";
                this.countFailures++;
                console.log("           Test failed!");
            }).catch(function(error) {
                this.csvPass = "1";
                this.csvFail = null;
                this.countPasses++;
                console.log("           Test passed!");
            });

            if (this.csvModule == null) {
                this.csvModule = this.csvTitle;
            }

            let DataFormat = {
                Feature: this.csvTitle,
                CaseId: this.csvModule + "/" + i,
                TestCase: this.csvName,
                Pass : this.csvPass,
                Fail: this.csvFail,
                ExecutionType: this.csvExecution,
                SuiteName: this.csvSuite
            };
            await this.CSVFile.WriteData(DataFormat);

            this.csvName = null;
            this.csvPass = null;
            this.csvFail = null;
        }
    }

    async checkTestResult() {
        console.log("---------------------------------------------------");

        await this.Driver.findElement(By.xpath("//ul[@id='mocha-stats']/li[@class='passes']//em")).getText()
            .then(function(message) {
            let getPasses = message;
            console.log("    Web passes: " + getPasses);
            console.log("  Check passes: " + this.countPasses);
        })
            .catch(function(reason) {
            console.log("ERROR: " + reason);
        });

        await this.Driver.findElement(By.xpath("//ul[@id='mocha-stats']/li[@class='failures']//em")).getText()
            .then(function(message) {
            let getFailures = message;
            console.log("  Web failures: " + getFailures);
            console.log("Check failures: " + this.countFailures);
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

    async WebInfo() {
        try {
            await this.Driver.get(this.RemoteURL);
            await this.Driver.sleep(this.WaitTime);

            // mocha-report
            let arrayTitles = await this.Driver.findElements(By.xpath("//ul[@id='mocha-report']/li[@class='suite']"));
            for (let i = 1; i <= arrayTitles.length; i++) {
                await arrayTitles[i - 1].findElement(By.xpath("./h1/a")).getText()
                    .then(function(message) {
                    this.csvTitle = message;
                    this.csvModule = null;
                    console.log(i + ": " + this.csvTitle);
                });

                let arrayModule = await arrayTitles[i - 1].findElements(By.xpath("./ul/li[@class='suite']"));
                for (let j = 1; j <= arrayModule.length; j++) {
                    await arrayModule[j - 1].findElement(By.xpath("./h1/a")).getText()
                        .then(function(message) {
                        let array = message.split("#");
                        this.csvModule = array[1];
                        console.log("    #" + j + ": " + this.csvModule);
                    });

                    await this.getTestCaseInfo(arrayModule[j - 1]);
                }

                await this.getTestCaseInfo(arrayTitles[i - 1]);
            }

            // mocha-stats
            await this.checkTestResult();
        } finally {
            await this.CSVFile.Close();
            await this.Driver;
        }
    }

}

// PUBLIC API

exports.GraspingWebInfo = new GraspingWebInfo();
