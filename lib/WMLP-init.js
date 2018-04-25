'use strict';

const {Builder, By, Key, Until} = require("../node_modules/selenium-webdriver");
const chrome = require("../node_modules/selenium-webdriver/chrome");
const csv = require("../node_modules/fast-csv");
const childProcess = require("child_process");
const fs = require("fs");

var options, csvStream;
var browserPath = "/usr/bin/chromium-browser-unstable";
var filePath = "./output";

var WMLPjson = JSON.parse(fs.readFileSync("./WMLP.json"));

if (typeof(global.REPORT_PATH) == "undefined") {
    global.REPORT_PATH = "./output/report/";
}

if (typeof(global.PACKAGE_PATH) == "undefined") {
    global.PACKAGE_PATH = "./output/package/";
}

if (typeof(global.TEST_PLATFORM) == "undefined") {
    if (WMLPjson.platform == "ubuntu" ||
        WMLPjson.platform == "android" ||
        WMLPjson.platform == "mac" ||
        WMLPjson.platform == "ios" ||
        WMLPjson.platform == "window") {
        global.TEST_PLATFORM = WMLPjson.platform;
    } else {
        throw new Error("Can not support this platform: " + WMLPjson.platform);
    }
}

if (typeof(global.WEBML_SWITCH) == "undefined") {
    if (typeof(WMLPjson.webml) == "boolean") {
        global.WEBML_SWITCH = WMLPjson.webml;
    } else {
        throw new Error("Can not support this switch: " + WMLPjson.webml);
    }
}

if (typeof(global.PASS_WORD) == "undefined") {
    if (WMLPjson.platform == "ubuntu") {
        global.PASS_WORD = WMLPjson.password.ubuntu;
    } else if (WMLPjson.platform == "android") {
        global.PASS_WORD = WMLPjson.password.android;
    } else if (WMLPjson.platform == "mac") {
        global.PASS_WORD = WMLPjson.password.mac;
    } else if (WMLPjson.platform == "ios") {
        global.PASS_WORD = WMLPjson.password.ios;
    } else if (WMLPjson.platform == "window") {
        global.PASS_WORD = WMLPjson.password.window;
    }
}

if (typeof(global.NEWEST_COMMIT) == "undefined") {
    global.NEWEST_COMMIT = WMLPjson.commit;
}

if (typeof(global.WRITE_COMMIT) == "undefined") {
    global.WRITE_COMMIT = function(commit) {
        global.NEWEST_COMMIT = commit;
        WMLPjson.commit = commit;
    }
}

if (typeof(global.NEWEST_PACKAGE) == "undefined") {
    global.NEWEST_PACKAGE = WMLPjson.package;
}

if (typeof(global.WRITE_PACKAGE) == "undefined") {
    global.WRITE_PACKAGE = function(name) {
        global.NEWEST_PACKAGE = name;
        WMLPjson.package = name;
    }
}

if (typeof(global.JSON_CLOSE) == "undefined") {
    global.JSON_CLOSE = function() {
        fs.writeFileSync("./WMLP.json", JSON.stringify(WMLPjson, null, 4));
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

        let command = "wget -P " + global.PACKAGE_PATH + " " + URL;
        await childProcess.execSync(command, {stdio: "inherit"});
    }
}

if (typeof(global.TOOLS_INSTALL) == "undefined") {
    global.TOOLS_INSTALL = function (path) {
        if (global.TEST_PLATFORM === "ubuntu") {
            let command = "echo '" + global.PASS_WORD + "' | sudo -S dpkg -i " + path;
            childProcess.execSync(command, {stdio: "inherit"});
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
    global.CSV_CLOSE = async function () {
        await csvStream.end();
    }
}

if (typeof(global.LOGGER_HEARD) == "undefined") {
    global.LOGGER_HEARD = global.TEST_PLATFORM + " -- " + global.TOOLS_TIME() + " -- ";
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

process.on("exit", function() {
    global.JSON_CLOSE();
});
