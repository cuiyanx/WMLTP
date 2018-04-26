'use strict';

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

var currentNode = null;
var currentCommit = null;
var remoteURL = "http://powerbuilder.sh.intel.com/public/webml/nightly/";
//var remoteURL = "http://127.0.0.1:8080/tmp/";

(async function() {
    var graspCommit = async function() {
        let arrayCommit = await MODULE_CHROME.driver.findElements(MODULE_CHROME.by.xpath("//table/tbody/tr/td[@valign='top']"));
        for (let i = 1; i <= arrayCommit.length; i++) {
            await arrayCommit[i - 1].findElement(MODULE_CHROME.by.xpath("../td[2]")).getText()
                .then(function(message) {
                console.log("   " + i + ": " + message.split("/")[0]);
            });

            await arrayCommit[i - 1].findElement(MODULE_CHROME.by.xpath("../td[3]")).getText()
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

        await currentNode.findElement(MODULE_CHROME.by.xpath("../td[2]")).getText()
            .then(function(message) {
            currentCommit = message.split("/")[0];

            if (currentCommit != MODULE_JSON.commit) {
                MODULE_JSON.writeCommit(currentCommit);
                MODULE_JSON.writeFlag(true);
            } else {
                MODULE_JSON.writeFlag(false);
            }
        });

        console.log("----Newest commit: " + MODULE_JSON.commit);
    }

    var graspName = async function(suffix) {
        let arrayCommit = await MODULE_CHROME.driver.findElements(MODULE_CHROME.by.xpath("//table/tbody/tr/td[@valign='top']"));
        for (let i = 1; i <= arrayCommit.length; i++) {
            await arrayCommit[i - 1].findElement(MODULE_CHROME.by.xpath("../td[2]")).getText()
                .then(function(message) {
                let array = message.split(".");
                for (let x in array) {
                    if (array[x] == suffix) {
                        MODULE_JSON.writePackage(message);
                        break;
                    }
                }
                console.log("   " + i + ": " + message);
            });
        }

        console.log("----Newest package name: " + MODULE_JSON.package);
    }

    console.log(LOGGER_HEARD + "open URL: " + remoteURL);
    await MODULE_CHROME.create();
    await MODULE_CHROME.open(remoteURL);
    await MODULE_CHROME.wait(10000);

    await MODULE_JSON.open();
    await graspCommit();
    console.log(LOGGER_HEARD + "grasp newest commit: " + MODULE_JSON.commit);
    console.log(LOGGER_HEARD + "is newest package: " + MODULE_JSON.flag);

    if (MODULE_JSON.flag) {
        let platform, suffix;
        if (TEST_PLATFORM == "ubuntu") {
            platform = "/linux_x64_SUCCEED/";
            suffix = "deb";
        }
        remoteURL = remoteURL + MODULE_JSON.commit + platform;
        console.log(LOGGER_HEARD + "open download URL: " + remoteURL);
        await MODULE_CHROME.open(remoteURL);
        await MODULE_CHROME.wait(10000);

        await graspName(suffix);
        console.log(LOGGER_HEARD + "grasp newest package: " + MODULE_JSON.package);

        remoteURL = remoteURL + MODULE_JSON.package;
        console.log(LOGGER_HEARD + "download newest package: " + remoteURL);
        await MODULE_TOOLS.download(remoteURL);
        await MODULE_CHROME.wait(10000);
    }

    await MODULE_CHROME.close();
    await MODULE_JSON.close();
})().then(function() {
    console.log("Downloading newest package is completed!");
}).catch(function(err) {
    console.log("Error" + err);
});
