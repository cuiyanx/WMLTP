const fs = require("fs");

// creat output directory
var filePath = "./output";
REPORT_PATH = "./output/report/";
PACKAGE_PATH = "./output/package/";
if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
}

if (!fs.existsSync(REPORT_PATH)) {
    fs.mkdirSync(REPORT_PATH);
}

if (!fs.existsSync(PACKAGE_PATH)) {
    fs.mkdirSync(PACKAGE_PATH);
}

// load WMLP-init.json for initialization
var WMLPjson = JSON.parse(fs.readFileSync("./lib/WMLP-init.json"));

if (WMLPjson.platform.test == "ubuntu" ||
    WMLPjson.platform.test == "android" ||
    WMLPjson.platform.test == "mac" ||
    WMLPjson.platform.test == "ios" ||
    WMLPjson.platform.test == "window") {
    TEST_PLATFORM = WMLPjson.platform.test;
} else {
    throw new Error("Can not support this test platform: " + WMLPjson.platform.test);
}

if (WMLPjson.platform.run == "ubuntu" ||
    WMLPjson.platform.run == "mac" ||
    WMLPjson.platform.run == "window") {
    RUN_PLATFORM = WMLPjson.platform.run;
} else {
    throw new Error("Can not support this run platform: " + WMLPjson.platform.run);
}

if (typeof(WMLPjson.webmlpolyfill) == "boolean") {
    WEBML_SWITCH = WMLPjson.webmlpolyfill;
} else {
    throw new Error("Can not support this switch: " + WMLPjson.webmlpolyfill);
}

if (RUN_PLATFORM == "ubuntu") {
    PASS_WORD = WMLPjson.password.ubuntu;
} else if (RUN_PLATFORM == "mac") {
    PASS_WORD = WMLPjson.password.mac;
} else if (RUN_PLATFORM == "window") {
    PASS_WORD = WMLPjson.password.window;
}

fs.writeFileSync("./lib/WMLP-init.json", JSON.stringify(WMLPjson, null, 4));

// global tools
TOOLS_TIME = function () {
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

LOGGER_HEARD = TEST_PLATFORM + " -- " + TOOLS_TIME() + " -- ";

// read require json file
let requireJsonPath = require.main.filename.slice(0, -2) + "json";

var requireJson;
if (fs.existsSync(requireJsonPath)) {
    requireJson = JSON.parse(fs.readFileSync(requireJsonPath)).modules;
} else {
    requireJson = ["json", "chrome", "csv", "tools"];
}

// json module
class modules_json {
    constructor() {
        this.json;
        this.open();
        this.commit = this.json.commit;
        this.flag = this.json.downloadflag;
        if (TEST_PLATFORM == "ubuntu") {
            this.package = this.json.package.ubuntu;
        } else if (TEST_PLATFORM == "mac") {
            this.package = this.json.package.mac;
        } else if (TEST_PLATFORM == "window") {
            this.package = this.json.package.window;
        } else if (TEST_PLATFORM == "android") {
            this.package = this.json.package.android;
        } else if (TEST_PLATFORM == "ios") {
            this.package = this.json.package.ios;
        }
    }

    open() {
        this.json = JSON.parse(fs.readFileSync("./lib/WMLP-init.json"));
    }

    writeCommit(commit) {
        this.commit = commit;
        this.json.commit = commit;
    }

    writePackage(name) {
        this.package = name;

        if (TEST_PLATFORM == "ubuntu") {
            this.json.package.ubuntu = name;
        } else if (TEST_PLATFORM == "mac") {
            this.json.package.mac = name;
        } else if (TEST_PLATFORM == "window") {
            this.json.package.window = name;
        } else if (TEST_PLATFORM == "android") {
            this.json.package.android = name;
        } else if (TEST_PLATFORM == "ios") {
            this.json.package.ios = name;
        }
    }

    writeFlag(flag) {
        this.flag = flag;
        this.json.downloadflag = flag;
    }

    close() {
        fs.writeFileSync("./lib/WMLP-init.json", JSON.stringify(this.json, null, 4));
    }
}

// chrome module
class modules_chrome {
    constructor() {
        this.builder = require("../node_modules/selenium-webdriver").Builder;
        this.by = require("../node_modules/selenium-webdriver").By;
        this.key = require("../node_modules/selenium-webdriver").Key;
        this.until = require("../node_modules/selenium-webdriver").Until;
        this.chrome = require("../node_modules/selenium-webdriver/chrome");
        this.driver;
        this.options;
        this.browserPath = "/usr/bin/chromium-browser-unstable";
    }

    async create() {
        if (TEST_PLATFORM === "ubuntu") {
            this.options = new this.chrome.Options().setChromeBinaryPath(this.browserPath);
        } else if (TEST_PLATFORM === "android") {
            this.options = new this.chrome.Options().androidChrome();
        }

        if (WEBML_SWITCH) {
            this.options = this.options.addArguments("--enable-features=WebML");
        } else {
            this.options = this.options.addArguments("--disable-features=WebML");
        }

        this.driver = new this.builder()
            .forBrowser("chrome")
            .setChromeOptions(this.options)
            .build();
    }

    async open(URL) {
        await this.driver.manage().window().maximize();
        await this.driver.get(URL);
    }

    async wait(time) {
        await this.driver.sleep(time);
    }

    async close() {
        await this.driver.close();
    }
}

// csv module
class modules_csv {
    constructor() {
        this.csv = require("../node_modules/fast-csv");
        this.header = null;
        this.csvStream;
    }

    async open() {
        if (this.header == null) {
            this.csvStream = this.csv.format({headers: false});
        } else {
            this.csvStream = this.csv.format({headers: this.header});
        }

        let path = REPORT_PATH + "/report-" + TEST_PLATFORM + "-" + TOOLS_TIME() + ".csv";
        let WriteStream = await fs.createWriteStream(path);
        await this.csvStream.pipe(WriteStream);
        let dataHeader = [];
        await this.csvStream.write(dataHeader);
    }

    async write(data) {
        await this.csvStream.write(data);
    }

    async close() {
        await this.csvStream.end();
    }
}

// tools module
class modules_tools {
    constructor() {
        this.childProcess = require("child_process");
    }

    async download(URL) {
        if (fs.existsSync(PACKAGE_PATH + MODULE_JSON.package)) {
            fs.unlinkSync(PACKAGE_PATH + MODULE_JSON.package);
        }

        if (RUN_PLATFORM === "ubuntu") {
            let command = "wget -P " + PACKAGE_PATH + " " + URL;
            await this.childProcess.execSync(command, {stdio: "inherit"});
        }
    }

    install(path) {
        if (MODULE_JSON.package == null) {
            throw new Error("Need package name for installing package");
        }

        if (!fs.existsSync(PACKAGE_PATH + MODULE_JSON.package)) {
            throw new Error("No such file for installing package");
        }

        if (RUN_PLATFORM === "ubuntu") {
            let command = "echo '" + PASS_WORD + "' | sudo -S dpkg -i " + path;
            this.childProcess.execSync(command, {stdio: "inherit"});
        }
    }
}

// analyse require json file
for (let x in requireJson) {
    if (requireJson[x] == "json") {
        MODULE_JSON = new modules_json();
    } else if (requireJson[x] == "chrome") {
        MODULE_CHROME = new modules_chrome();
    } else if (requireJson[x] == "csv") {
        MODULE_CSV = new modules_csv();
    } else if (requireJson[x] == "tools") {
        MODULE_TOOLS = new modules_tools();
    }
}
