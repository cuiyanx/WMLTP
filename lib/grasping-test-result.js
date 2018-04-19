'use strict';

var countPasses = 0;
var countFailures = 0;
var csvTitle = null;
var csvModule = null;
var csvName = null;
var csvPass = null;
var csvFail = null;
var csvExecution = "auto";
var csvSuite = "tests";

function checkDriver(driver) {
    if (driver == null) {
        throw new Error("Need chrome driver to grasp web info!");
    }
}

function checkBy(By) {
    if (By == null) {
        throw new Error("Need By to grasp web info!");
    }
}

function checkCSV(csv) {
    if (csv == null) {
        throw new Error("Need csv to save csv file!");
    }
}

class TestResult {

    constructor(){
        this.By = null;
        this.driver = null;
        this.csv = null;
    }

    async getName(element) {
        checkBy(this.By);

        let Text = null;
        let length = 0;
        await element.findElement(this.By.xpath("./h2")).getText()
            .then(function(message) {
            length = message.length - 1;
            Text = message;
        });

        let arrayElement = await element.findElements(this.By.xpath("./h2/child::*"));
        for (let j = 1; j <= arrayElement.length; j++) {
            await arrayElement[j - 1].getText()
                .then(function(message) {
                length = length - message.length;
            });
        }

        return Text.slice(0, length);
    }

    async getError(element) {
        checkBy(this.By);

        let Text = await element.findElement(this.By.xpath("./pre[@class='error']")).getText();

        return Text;
    }

    async getCode(element) {
        checkBy(this.By);

        let Text = await element.findElement(this.By.xpath("./pre[last()]")).getText();

        return Text;
    }

    async getInfo(element) {
        checkBy(this.By);
        checkCSV(this.csv);

        let arrayTitles, arrayModule;
        let array = await element.findElements(this.By.xpath("./ul/li[@class='test pass fast' or @class='test pass slow' or @class='test fail']"));

        for (let i = 1; i <= array.length; i++) {
            await this.getName(array[i - 1])
                .then(function(message) {
                csvName = message;
                console.log("       " + i + ") " + message);
            });

            await this.getError(array[i - 1])
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
            await this.csv.WriteData(DataFormat);

            csvName = null;
            csvPass = null;
            csvFail = null;
        }
    }

    async check() {
        checkDriver(this.driver);
        checkBy(this.By);

        console.log("---------------------------------------------------");

        await this.driver.findElement(this.By.xpath("//ul[@id='mocha-stats']/li[@class='passes']//em")).getText()
            .then(function(message) {
            let getPasses = message;
            console.log("    Web passes: " + getPasses);
            console.log("  Check passes: " + countPasses);
        });

        await this.driver.findElement(this.By.xpath("//ul[@id='mocha-stats']/li[@class='failures']//em")).getText()
            .then(function(message) {
            let getFailures = message;
            console.log("  Web failures: " + getFailures);
            console.log("Check failures: " + countFailures);
        });

        await this.driver.findElement(this.By.xpath("//ul[@id='mocha-stats']/li[@class='duration']//em")).getText()
            .then(function(message) {
            let Duration = message;
            console.log("      Duration: " + Duration + " ms");
        });

        console.log("---------------------------------------------------");
    }

    async grasp(driver, By, csv) {
        this.driver = driver;
        this.By = By;
        this.csv = csv;

        checkDriver(this.driver);
        checkBy(this.By);
        checkCSV(this.csv);

        // mocha-report
        let arrayTitles = await this.driver.findElements(this.By.xpath("//ul[@id='mocha-report']/li[@class='suite']"));
        for (let i = 1; i <= arrayTitles.length; i++) {
            await arrayTitles[i - 1].findElement(this.By.xpath("./h1/a")).getText()
                .then(function(message) {
                csvTitle = message;
                csvModule = null;
                console.log(i + ": " + csvTitle);
            });

            let arrayModule = await arrayTitles[i - 1].findElements(this.By.xpath("./ul/li[@class='suite']"));
            for (let j = 1; j <= arrayModule.length; j++) {
                await arrayModule[j - 1].findElement(this.By.xpath("./h1/a")).getText()
                    .then(function(message) {
                    let array = message.split("#");
                    csvModule = array[1];
                    console.log("    #" + j + ": " + csvModule);
                });

                await this.getInfo(arrayModule[j - 1]);
            }

            await this.getInfo(arrayTitles[i - 1]);
        }

        // mocha-stats
        await this.check();
    }

}

// PUBLIC API

exports.TestResult = new TestResult();
