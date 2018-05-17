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

var useingCommit = null;
var currentNode = null;
var currentCommit = null;
var remoteURL = "http://powerbuilder.sh.intel.com/public/webml/nightly/";
//var remoteURL = "http://10.126.1.201:8080/tmp/";

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

            if (currentCommit != MODULE_JSON.getNewestCommit()) {
                MODULE_JSON.writeNewestCommit(currentCommit);
            }
        });

        console.log("    Newest commit: " + MODULE_JSON.getNewestCommit());
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

        console.log("    package name: " + MODULE_JSON.getPackage());
    }

    console.log(LOGGER_HEARD() + "open URL: " + remoteURL);
    await MODULE_CHROME.setBrowserNewest(false);
    await MODULE_CHROME.create();
    await MODULE_CHROME.open(remoteURL);
    await MODULE_CHROME.wait(10000);

    if (FLAG_DESIGNATED_COMMIT) {
        useingCommit = DESIGNATED_COMMIT;
        console.log(LOGGER_HEARD() + "grasp designated commit: " + DESIGNATED_COMMIT);
    } else {
        await graspCommit();
        useingCommit = MODULE_JSON.getNewestCommit();
        console.log(LOGGER_HEARD() + "grasp newest commit: " + MODULE_JSON.getNewestCommit());
    }

    for (let x in TARGET_PLATFORMS) {
        TEST_PLATFORM = TARGET_PLATFORMS[x];

        let downloadPath = remoteURL + useingCommit + MODULE_JSON.getPath();
        console.log(LOGGER_HEARD() + "open download URL: " + downloadPath);
        await MODULE_CHROME.open(downloadPath);
        await MODULE_CHROME.wait(10000);

        await graspName(MODULE_JSON.getSuffix());
        console.log(LOGGER_HEARD() + "grasp package name: " + MODULE_JSON.getPackage());

        let result = await MODULE_TOOLS.checkCommit(useingCommit);
        console.log(LOGGER_HEARD() + "check commit value: " + result);

        if (result) {
            result = await MODULE_TOOLS.checkPackage(useingCommit);
            console.log(LOGGER_HEARD() + "check package state: " + result);

            if (result) {
                console.log(LOGGER_HEARD() + "no need to download package!");
            } else {
                let downloadPackage = downloadPath + MODULE_JSON.getPackage();
                console.log(LOGGER_HEARD() + "download package: " + downloadPackage);
                await MODULE_TOOLS.download(downloadPackage);
                await MODULE_CHROME.wait(10000);
            }
        } else {
            let downloadPackage = downloadPath + MODULE_JSON.getPackage();
            console.log(LOGGER_HEARD() + "download package: " + downloadPackage);
            await MODULE_TOOLS.download(downloadPackage);
            await MODULE_CHROME.wait(10000);
        }
    }

    await MODULE_CHROME.close();
})().then(function() {
    console.log("Downloading newest package is completed!");
}).catch(function(err) {
    throw err;
});
