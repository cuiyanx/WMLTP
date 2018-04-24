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
var remoteURL = "http://127.0.0.1:8080/tmp/";
var packageName = null;

(async function() {
    var graspCommit = async function() {
        let arrayCommit = await global.OPERATE_DRIVER.findElements(global.OPERATE_BY.xpath("//table/tbody/tr/td[@valign='top']"));
        for (let i = 1; i <= arrayCommit.length; i++) {
            await arrayCommit[i - 1].findElement(global.OPERATE_BY.xpath("../td[2]")).getText()
                .then(function(message) {
                console.log(i + ": " + message.split("/")[0]);
            });

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

        console.log("Newest commit: " + currentCommit);
    }

    var graspName = async function() {
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
                console.log(i + ": " + message);
            });
        }

        console.log("Newest package name: " + packageName);
    }

    console.log(global.LOGGER_HEARD + "open URL: " + remoteURL);
    await global.CHROME_OPEN(remoteURL);
    await global.CHROME_WAIT(10000);

    await graspCommit();
    console.log(global.LOGGER_HEARD + "grasp newest commit: " + currentCommit);

    remoteURL = remoteURL + currentCommit + "/linux_x64_SUCCEED/";
    console.log(global.LOGGER_HEARD + "open URL: " + remoteURL);
    await global.CHROME_OPEN(remoteURL);
    await global.CHROME_WAIT(10000);

    await graspName();
    console.log(global.LOGGER_HEARD + "grasp newest package: " + packageName);

    remoteURL = remoteURL + packageName;
    console.log(global.LOGGER_HEARD + "download newest package: " + remoteURL);
    await global.TOOLS_DOWNLOAD(remoteURL);
    await global.CHROME_WAIT(10000);

    await global.CHROME_CLOSE();
})().then(function() {
    console.log("Grasping newest commit is completed!")
}).catch(function(err) {
    console.log(err)
});
