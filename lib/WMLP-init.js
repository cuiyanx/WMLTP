'use strict';

const {Builder, By, Key, Until} = require("../node_modules/selenium-webdriver");
const chrome = require("../node_modules/selenium-webdriver/chrome");
const csv = require("../node_modules/fast-csv");
const childProcess = require("child_process");
const fs = require("fs");

var options, csvStream;
var browserPath = "/usr/bin/chromium-browser-unstable";
var filePath = "./output";

if (typeof(global.REPORT_PATH) == "undefined") {
    global.REPORT_PATH = "./output/report/";
}

if (typeof(global.PACKAGE_PATH) == "undefined") {
    global.PACKAGE_PATH = "./output/package/";
}

if (typeof(global.TEST_PLATFORM) == "undefined") {
    if (typeof(process.argv[2]) == "undefined") {
        global.TEST_PLATFORM = "ubuntu";
    } else {
        if (process.argv[2] == "ubuntu" ||
            process.argv[2] == "android" ||
            process.argv[2] == "mac" ||
            process.argv[2] == "ios" ||
            process.argv[2] == "window") {
            global.TEST_PLATFORM = process.argv[2];
        } else {
            throw new Error("Can not support this platform: " + process.argv[2]);
        }
    }
}

if (typeof(global.WEBML_SWITCH) == "undefined") {
    if (typeof(process.argv[3]) == "undefined") {
        global.WEBML_SWITCH = true;
    } else {
        if (process.argv[3] == "true") {
            global.WEBML_SWITCH = true;
        } else if (process.argv[3] == "false") {
            global.WEBML_SWITCH = false;
        } else {
            throw new Error("Can not support this switch: " + process.argv[3]);
        }
    }
}

if (typeof(global.OPERATE_DRIVER) == "undefined") {
    if (global.TEST_PLATFORM === "ubuntu") {
        options = new chrome.Options().setChromeBinaryPath(browserPath);
    } else if (global.TEST_PLATFORM === "android") {
        options = new chrome.Options().androidChrome();
    } else {
        throw new Error("Can not support this platform: " + global.TEST_PLATFORM);
    }

    if (global.WEBML_SWITCH) {
        options = options.addArguments("--enable-features=WebML");
    } else {
        options = options.addArguments("--disable-features=WebML");
    }

    global.OPERATE_DRIVER = new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();
}

if (typeof(global.OPERATE_BY) == "undefined") {
    global.OPERATE_BY = By;
}

if (typeof(global.OPERATE_KEY) == "undefined") {
    global.OPERATE_KEY = Key;
}

if (typeof(global.OPERATE_UNTIL) == "undefined") {
    global.OPERATE_UNTIL = Until;
}

if (typeof(global.CHROME_CREATE) == "undefined") {
    global.CHROME_CREATE = async function () {
        if (global.TEST_PLATFORM === "ubuntu") {
            options = new chrome.Options().setChromeBinaryPath(browserPath);
        } else if (global.TEST_PLATFORM === "android") {
            options = new chrome.Options().androidChrome();
        } else {
            throw new Error("Can not support this platform: " + global.TEST_PLATFORM);
        }

        if (global.WEBML_SWITCH) {
            options = options.addArguments("--enable-features=WebML");
        } else {
            options = options.addArguments("--disable-features=WebML");
        }

        global.OPERATE_DRIVER = new Builder()
            .forBrowser("chrome")
            .setChromeOptions(options)
            .build();
    }
}

if (typeof(global.CHROME_OPEN) == "undefined") {
    global.CHROME_OPEN = async function (URL) {
        await global.OPERATE_DRIVER.manage().window().maximize();
        await global.OPERATE_DRIVER.get(URL);
    }
}

if (typeof(global.CHROME_WAIT) == "undefined") {
    global.CHROME_WAIT = async function (time) {
        await global.OPERATE_DRIVER.sleep(time);
    }
}

if (typeof(global.CHROME_CLOSE) == "undefined") {
    global.CHROME_CLOSE = async function () {
        await global.OPERATE_DRIVER.close();
    }
}

if (typeof(global.TOOLS_TIME) == "undefined") {
    global.TOOLS_TIME = function () {
        let arrayDate = new Date().toLocaleDateString().split("/");
        if (parseInt(arrayDate[0]) < 10) {
            arrayDate[0] = "0" + arrayDate[0];
        }

        if (parseInt(arrayDate[1]) < 10) {
            arrayDate[1] = "0" + arrayDate[1];
        }

        let TimeString = arrayDate[2] + arrayDate[0] + arrayDate[1];
        return TimeString;
    }
}

if (typeof(global.TOOLS_DOWNLOAD) == "undefined") {
    global.TOOLS_DOWNLOAD = async function (URL) {
        let fileArray = fs.readdirSync(global.PACKAGE_PATH);
        for (let x in fileArray) {
            fs.unlinkSync(global.PACKAGE_PATH + "/" + fileArray[x]);
        }

        let command = "wget --accept=deb -r -l 1 -nd -np -P " + global.PACKAGE_PATH + " " + URL;
        await childProcess.exec(command);
    }
}

if (typeof(global.TOOLS_INSTALL) == "undefined") {
    global.TOOLS_INSTALL = function (path) {
        if (global.TEST_PLATFORM === "ubuntu") {
            let command = "sudo dpkg -i " + path;
            childProcess.execSync(command);
        }
    }
}

if (typeof(global.CSV_HEADER) == "undefined") {
    global.CSV_HEADER = null;
}

if (typeof(global.CSV_FORMAT) == "undefined") {
    global.CSV_FORMAT = null;
}

if (typeof(global.CSV_OPEN) == "undefined") {
    global.CSV_OPEN = async function () {
        if (global.CSV_HEADER == null) {
            csvStream = csv.format({headers: false});
        } else {
            csvStream = csv.format({headers: global.CSV_HEADER});
        }

        let path = global.REPORT_PATH + "/report-" + global.TEST_PLATFORM + "-" + global.TOOLS_TIME() + ".csv";
        let WriteStream = await fs.createWriteStream(path);
        await csvStream.pipe(WriteStream);
        let dataHeader = [];
        await csvStream.write(dataHeader);
    }
}

if (typeof(global.CSV_WRITE) == "undefined") {
    global.CSV_WRITE = async function (data) {
        await csvStream.write(data);
    }
}

if (typeof(global.CSV_CLOSE) == "undefined") {
    global.CSV_CLOSE = async function (data) {
        await csvStream.end();
    }
}

if (typeof(global.LOGGER_HEARD) == "undefined") {
    global.LOGGER_HEARD = global.TOOLS_TIME() + " -- " + global.TEST_PLATFORM + " -- ";
}

if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
}

if (!fs.existsSync(global.REPORT_PATH)) {
    fs.mkdirSync(global.REPORT_PATH);
}

if (!fs.existsSync(global.PACKAGE_PATH)) {
    fs.mkdirSync(global.PACKAGE_PATH);
}
