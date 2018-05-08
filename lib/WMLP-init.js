const fs = require("fs");
const os = require("os");

let sys = os.type();

if (sys == "Linux") {
    RUN_PLATFORM = "linux";
} else if (sys == "Darwin") {
    RUN_PLATFORM = "mac";
} else if (sys == "Windows_NT") {
    RUN_PLATFORM = "windows";
} else {
    let string = "We do not support " + sys + " as run platform";
    throw new Error(string);
}

// locking current work path
let array = process.cwd().split("/");

if (array[array.length - 1] != "WMLP") {
    if (array[array.length - 2] == "WMLP") {
        process.chdir("../");
    } else {
        throw new Error("The current work path is not the inside path of the project");
    }
}

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

// load json file to initialization
var WMLPjson = JSON.parse(fs.readFileSync("./lib/WMLP-init.json"));

TARGET_PLATFORMS = WMLPjson.platform;
for (let x in TARGET_PLATFORMS) {
    if (!(TARGET_PLATFORMS[x] == "linux" ||
        TARGET_PLATFORMS[x] == "android" ||
        TARGET_PLATFORMS[x] == "mac" ||
        TARGET_PLATFORMS[x] == "ios" ||
        TARGET_PLATFORMS[x] == "windows")) {
        let string = "Can not support this test platform: " + TARGET_PLATFORMS[x];
        throw new Error(string);
    }
}

if (TARGET_PLATFORMS.length >= 1) {
    WMLPjson.currentplatform = TARGET_PLATFORMS[0];
    TEST_PLATFORM = TARGET_PLATFORMS[0];
}

if (typeof(WMLPjson.webmlpolyfill) == "boolean") {
    WEBML_SWITCH = WMLPjson.webmlpolyfill;
} else {
    let string = "Can not support this WebML switch: " + WMLPjson.webmlpolyfill;
    throw new Error(string);
}

if (RUN_PLATFORM == "linux") {
    PASS_WORD = WMLPjson.password.linux;
} else if (RUN_PLATFORM == "mac") {
    PASS_WORD = WMLPjson.password.mac;
} else if (RUN_PLATFORM == "windows") {
    PASS_WORD = WMLPjson.password.windows;
}

fs.writeFileSync("./lib/WMLP-init.json", JSON.stringify(WMLPjson, null, 4));

// global tools
// TODO: support windows
TOOLS_TIME = function () {
    let arrayDate = new Date().toLocaleDateString().split("-");

    if (parseInt(arrayDate[1]) < 10) {
        arrayDate[1] = "0" + arrayDate[1];
    }

    if (parseInt(arrayDate[2]) < 10) {
        arrayDate[2] = "0" + arrayDate[2];
    }

    let TimeString = arrayDate[0] + arrayDate[1] + arrayDate[2];

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
        this.json = null;
    }

    open() {
        this.json = JSON.parse(fs.readFileSync("./lib/WMLP-init.json"));
    }

    getPackage() {
        if (TEST_PLATFORM == "linux") {
            return this.json.linux.package;
        } else if (TEST_PLATFORM == "mac") {
            return this.json.mac.package;
        } else if (TEST_PLATFORM == "windows") {
            return this.json.windows.package;
        } else if (TEST_PLATFORM == "android") {
            return this.json.android.package;
        } else if (TEST_PLATFORM == "ios") {
            return this.json.ios.package;
        } else {
            if (TEST_PLATFORM == null) {
                throw new Error("Set test platform first");
            } else {
                throw new Error("Can not get package name!");
            }
        }
    }

    getPath() {
        if (TEST_PLATFORM == "linux") {
            return this.json.linux.path;
        } else if (TEST_PLATFORM == "mac") {
            return this.json.mac.path;
        } else if (TEST_PLATFORM == "windows") {
            return this.json.windows.path;
        } else if (TEST_PLATFORM == "android") {
            return this.json.android.path;
        } else if (TEST_PLATFORM == "ios") {
            return this.json.ios.path;
        } else {
            if (TEST_PLATFORM == null) {
                throw new Error("Set test platform first");
            } else {
                throw new Error("Can not get path!");
            }
        }
    }

    getSuffix() {
        if (TEST_PLATFORM == "linux") {
            return this.json.linux.suffix;
        } else if (TEST_PLATFORM == "mac") {
            return this.json.mac.suffix;
        } else if (TEST_PLATFORM == "windows") {
            return this.json.windows.suffix;
        } else if (TEST_PLATFORM == "android") {
            return this.json.android.suffix;
        } else if (TEST_PLATFORM == "ios") {
            return this.json.ios.suffix;
        } else {
            if (TEST_PLATFORM == null) {
                throw new Error("Set test platform first");
            } else {
                throw new Error("Can not get suffix!");
            }
        }
    }

    getMd5() {
        if (TEST_PLATFORM == "linux") {
            return this.json.linux.md5;
        } else if (TEST_PLATFORM == "mac") {
            return this.json.mac.md5;
        } else if (TEST_PLATFORM == "windows") {
            return this.json.windows.md5;
        } else if (TEST_PLATFORM == "android") {
            return this.json.android.md5;
        } else if (TEST_PLATFORM == "ios") {
            return this.json.ios.md5;
        } else {
            if (TEST_PLATFORM == null) {
                throw new Error("Set test platform first");
            } else {
                throw new Error("Can not get md5 value!");
            }
        }
    }

    getCommit() {
        return this.json.commit;
    }

    getFlag() {
        return this.json.downloadflag;
    }

    writeCommit(commit) {
        this.json.commit = commit;
        this.write();
    }

    writePackage(name) {
        if (TEST_PLATFORM == "linux") {
            this.json.linux.package = name;
        } else if (TEST_PLATFORM == "mac") {
            this.json.mac.package = name;
        } else if (TEST_PLATFORM == "windows") {
            this.json.windows.package = name;
        } else if (TEST_PLATFORM == "android") {
            this.json.android.package = name;
        } else if (TEST_PLATFORM == "ios") {
            this.json.ios.package = name;
        } else {
            if (TEST_PLATFORM == null) {
                throw new Error("Set test platform first");
            } else {
                throw new Error("Can not write package name!");
            }
        }

        this.write();
    }

    writeMd5(value) {
        if (TEST_PLATFORM == "linux") {
            this.json.linux.md5 = value;
        } else if (TEST_PLATFORM == "mac") {
            this.json.mac.md5 = value;
        } else if (TEST_PLATFORM == "windows") {
            this.json.windows.md5 = value;
        } else if (TEST_PLATFORM == "android") {
            this.json.android.md5 = value;
        } else if (TEST_PLATFORM == "ios") {
            this.json.ios.md5 = value;
        } else {
            if (TEST_PLATFORM == null) {
                throw new Error("Set test platform first");
            } else {
                throw new Error("Can not write md5 value!");
            }
        }

        this.write();
    }

    writeFlag(flag) {
        this.json.downloadflag = flag;
        this.write();
    }

    write() {
        fs.writeFileSync("./lib/WMLP-init.json", JSON.stringify(this.json, null, 4));
    }

    close() {
        fs.closeSync(0);
        fs.closeSync(1);
        this.json = null;
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
        this.browserPath;
        this.browserNewest = false;
    }

    async setBrowserNewest(value) {
        if (typeof(value) != "boolean") {
            throw new Error("Is not boolean value: " + value);
        }

        this.browserNewest = value;
    }

    // TODO: support ios, windows
    async create() {
        if (this.browserNewest) {
            if (TEST_PLATFORM === "linux") {
                this.browserPath = "/usr/bin/chromium-browser-unstable";
                this.options = new this.chrome.Options().setChromeBinaryPath(this.browserPath);
            } else if (TEST_PLATFORM === "mac") {
                this.browserPath = PACKAGE_PATH + MODULE_JSON.getPath() + "chromium-mac/Chromium.app/Contents/MacOS/Chromium";
                this.options = new this.chrome.Options().setChromeBinaryPath(this.browserPath);
            } else if (TEST_PLATFORM === "android") {
                this.options = new this.chrome.Options().androidChrome();
            }
        } else {
            this.options = new this.chrome.Options();
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

    // TODO: support windows
    async download(URL) {
        let path = PACKAGE_PATH + MODULE_JSON.getPath();
        let name = path + MODULE_JSON.getPackage();

        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }

        if (fs.existsSync(name)) {
            fs.unlinkSync(name);
        }

        if (RUN_PLATFORM === "linux") {
            let command = "wget -P " + path + " " + URL;
            await this.childProcess.execSync(command, {stdio: "inherit"});
        } else if (RUN_PLATFORM === "mac") {
            let command = "curl -o " + name + " " + URL;
            await this.childProcess.execSync(command, {stdio: "inherit"});
        }
    }

    // TODO: support android, ios, windows
    install(path) {
        if (!fs.existsSync(path)) {
            throw new Error("No such file for installing package");
        }

        if (RUN_PLATFORM === "linux") {
            if (TEST_PLATFORM === "linux") {
                let command = "echo '" + PASS_WORD + "' | sudo -S dpkg -i " + path;
                this.childProcess.execSync(command, {stdio: "inherit"});
            }
        } else if (RUN_PLATFORM === "mac") {
            if (TEST_PLATFORM === "mac") {
                let unzipPath = PACKAGE_PATH + MODULE_JSON.getPath() + "chromium-mac/";
                if (fs.existsSync(unzipPath)) {
                    this.childProcess.execSync("rm -rf " + unzipPath, {stdio: "inherit"});
                }

                fs.mkdirSync(unzipPath);

                let command = "unzip -o -q -d " + unzipPath + " " + path;
                this.childProcess.execSync(command, {stdio: "inherit"});
            }
        }
    }

    check(path) {
        if (!fs.existsSync(path)) {
            throw new Error("No such file for checking md5 value");
        }

        if (RUN_PLATFORM === "linux") {
            let command = "md5sum " + path;
            let md5Value = this.childProcess.execSync(command, {encoding: "UTF-8"});
            let array = md5Value.split(" ");
            return array[0];
        } else if (RUN_PLATFORM === "mac") {
            let command = "md5 " + path;
            let md5Value = this.childProcess.execSync(command, {encoding: "UTF-8"});
            let array = md5Value.split("=")[1].split(" ");
            return array[1];
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
