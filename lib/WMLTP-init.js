const fs = require("fs");
const os = require("os");

let sys = os.type();

// get current running platform
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

// lock current work path
let array = process.cwd().split("/");

if (array[array.length - 1] != "WMLTP") {
    if (array[array.length - 2] == "WMLTP") {
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

TEST_PLATFORM = null;
SERIAL_NUMBERS = null;
ANDROID_SN = null;

// default: json module
class modules_json {
    constructor() {
        this.json;
        this.open();
    }

    open() {
        this.json = JSON.parse(fs.readFileSync("./WMLTP.config.json"));
    }

    getTargetPlatforms() {
        for (let x in this.json.platform) {
            if (!(this.json.platform[x] == "linux" ||
                this.json.platform[x] == "android" ||
                this.json.platform[x] == "mac" ||
                this.json.platform[x] == "ios" ||
                this.json.platform[x] == "windows")) {
                let string = "Can not support this test platform: " + this.json.platform[x];
                throw new Error(string);
            }
        }

        return this.json.platform;
    }

    getWebmlSwitch() {
        if (typeof(this.json.webml) == "boolean") {
            return this.json.webml;
        } else {
            let string = "Can not support this WebML switch: " + this.json.webml;
            throw new Error(string);
        }
    }

    getPassWord() {
        if (RUN_PLATFORM == "linux") {
            return this.json.password.linux;
        } else if (RUN_PLATFORM == "mac") {
            return this.json.password.mac;
        } else if (RUN_PLATFORM == "windows") {
            return this.json.password.windows;
        } else {
            return null;
        }
    }

    getPackage() {
        if (TEST_PLATFORM == "linux") {
            if (this.json.linux.package == null) {
                throw new Error("Package name on linux is null!");
            } else {
                return this.json.linux.package;
            }
        } else if (TEST_PLATFORM == "mac") {
            if (this.json.mac.package == null) {
                throw new Error("Package name on mac is null!");
            } else {
                return this.json.mac.package;
            }
        } else if (TEST_PLATFORM == "windows") {
            if (this.json.windows.package == null) {
                throw new Error("Package name on windows is null!");
            } else {
                return this.json.windows.package;
            }
        } else if (TEST_PLATFORM == "android") {
            if (this.json.android.package == null) {
                throw new Error("Package name on android is null!");
            } else {
                return this.json.android.package;
            }
        } else if (TEST_PLATFORM == "ios") {
            if (this.json.ios.package == null) {
                throw new Error("Package name on ios is null!");
            } else {
                return this.json.ios.package;
            }
        } else {
            if (TEST_PLATFORM == null) {
                throw new Error("Set test platform first");
            } else {
                throw new Error("Can not get package name!");
            }
        }
    }

    getSerialNumber() {
        return this.json.android.serialnumber;
    }

    getPath() {
        if (TEST_PLATFORM == "linux") {
            if (this.json.linux.path == null) {
                throw new Error("Path on linux is null!");
            } else {
                return this.json.linux.path;
            }
        } else if (TEST_PLATFORM == "mac") {
            if (this.json.mac.path == null) {
                throw new Error("Path on mac is null!");
            } else {
                return this.json.mac.path;
            }
        } else if (TEST_PLATFORM == "windows") {
            if (this.json.windows.path == null) {
                throw new Error("Path on windows is null!");
            } else {
                return this.json.windows.path;
            }
        } else if (TEST_PLATFORM == "android") {
            if (this.json.android.path == null) {
                throw new Error("Path on android is null!");
            } else {
                if (ANDROID_SN == null) {
                    throw new Error("Set android serial number first");
                } else {
                    for (let x in SERIAL_NUMBERS) {
                        if (ANDROID_SN == SERIAL_NUMBERS[x]) {
                            return this.json.android.path[x];
                        }
                    }
                }
            }
        } else if (TEST_PLATFORM == "ios") {
            if (this.json.ios.path == null) {
                throw new Error("Path on ios is null!");
            } else {
                return this.json.ios.path;
            }
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
            if (this.json.linux.suffix == null) {
                throw new Error("Suffix on linux is null!");
            } else {
                return this.json.linux.suffix;
            }
        } else if (TEST_PLATFORM == "mac") {
            if (this.json.mac.suffix == null) {
                throw new Error("Suffix on mac is null!");
            } else {
                return this.json.mac.suffix;
            }
        } else if (TEST_PLATFORM == "windows") {
            if (this.json.windows.suffix == null) {
                throw new Error("Suffix on windows is null!");
            } else {
                return this.json.windows.suffix;
            }
        } else if (TEST_PLATFORM == "android") {
            if (this.json.android.suffix == null) {
                throw new Error("Suffix on android is null!");
            } else {
                return this.json.android.suffix;
            }
        } else if (TEST_PLATFORM == "ios") {
            if (this.json.ios.suffix == null) {
                throw new Error("Suffix on ios is null!");
            } else {
                return this.json.ios.suffix;
            }
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

    getDesignatedCommitFlag() {
        if (typeof(this.json.designated.flag) == "boolean") {
            return this.json.designated.flag;
        } else {
            let string = "Can not support designated commit flag: " + this.json.designated.flag;
            throw new Error(string);
        }
    }

    getDesignatedCommit() {
        if (this.json.designated.commit == null) {
            throw new Error("Specify commit value is null!");
        } else {
            return this.json.designated.commit;
        }
    }

    getNewestCommit() {
        return this.json.newestcommit;
    }

    writeNewestCommit(commit) {
        this.json.newestcommit = commit;
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

    write() {
        fs.writeFileSync("./WMLTP.config.json", JSON.stringify(this.json, null, 4));
    }

    close() {
        fs.closeSync(0);
        fs.closeSync(1);
    }
}

// load json file to initialization
MODULE_JSON = new modules_json();

TARGET_PLATFORMS = MODULE_JSON.getTargetPlatforms();
WEBML_SWITCH = MODULE_JSON.getWebmlSwitch();
PASS_WORD = MODULE_JSON.getPassWord();
DESIGNATED_COMMIT = MODULE_JSON.getDesignatedCommit();
FLAG_DESIGNATED_COMMIT = MODULE_JSON.getDesignatedCommitFlag();
SERIAL_NUMBERS = MODULE_JSON.getSerialNumber();

// global tools
// TODO: support windows
TOOLS_DATE = function() {
    let arrayDate = new Date().toLocaleDateString().split("-");

    if (parseInt(arrayDate[1]) < 10) {
        arrayDate[1] = "0" + arrayDate[1];
    }

    if (parseInt(arrayDate[2]) < 10) {
        arrayDate[2] = "0" + arrayDate[2];
    }

    let DateString = arrayDate[0] + arrayDate[1] + arrayDate[2];

    let arrayTime = new Date().toLocaleTimeString().split(":");

    let TimeString = arrayTime[0] + arrayTime[1];

    return DateString + TimeString;
}

LOGGER_HEARD = function() {
    let testPlatform;
    if (TEST_PLATFORM == null) {
        testPlatform = RUN_PLATFORM;
    } else {
        testPlatform = TEST_PLATFORM;
    }

    let heard = RUN_PLATFORM + "--" + TOOLS_DATE() + "--" + testPlatform + "-- ";
    return heard;
}

GET_PACKAGE_PATH = function() {
    if (FLAG_DESIGNATED_COMMIT) {
        PACKAGE_PATH = "./output/package/" + DESIGNATED_COMMIT;
    } else {
        if (MODULE_JSON.getNewestCommit() == null) {
            throw new Error("Newest commit can not be null!");
        } else {
            PACKAGE_PATH = "./output/package/" + MODULE_JSON.getNewestCommit();
        }
    }

    if (!fs.existsSync(PACKAGE_PATH)) {
        fs.mkdirSync(PACKAGE_PATH);
    }

    return PACKAGE_PATH;
}

GET_REPORT_PATH = function() {
    if (FLAG_DESIGNATED_COMMIT) {
        REPORT_PATH = "./output/report/" + DESIGNATED_COMMIT;
    } else {
        if (MODULE_JSON.getNewestCommit() == null) {
            throw new Error("Newest commit can not be null!");
        } else {
            REPORT_PATH = "./output/report/" + MODULE_JSON.getNewestCommit();
        }
    }

    if (!fs.existsSync(REPORT_PATH)) {
        fs.mkdirSync(REPORT_PATH);
    }

    return REPORT_PATH;
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
                this.options = new this.chrome.Options()
                    .setChromeBinaryPath(this.browserPath);
            } else if (TEST_PLATFORM === "mac") {
                this.browserPath = GET_PACKAGE_PATH() + MODULE_JSON.getPath() +
                    "chromium-mac/Chromium.app/Contents/MacOS/Chromium";
                this.options = new this.chrome.Options()
                    .setChromeBinaryPath(this.browserPath);
            } else if (TEST_PLATFORM === "android") {
                this.options = new this.chrome.Options()
                    .androidPackage("org.chromium.chrome")
                    .androidDeviceSerial(ANDROID_SN);
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

        let name;
        if (TEST_PLATFORM == "android") {
            let cpu = MODULE_JSON.getPath().split("_")[1];
            name = GET_REPORT_PATH() + "/report-" + TEST_PLATFORM + "-" + cpu + "-" + TOOLS_DATE() + ".csv";
        } else {
            name = GET_REPORT_PATH() + "/report-" + TEST_PLATFORM + "-" + TOOLS_DATE() + ".csv";
        }

        let WriteStream = await fs.createWriteStream(name);
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
        let path = GET_PACKAGE_PATH() + MODULE_JSON.getPath();

        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }

        let name = path + MODULE_JSON.getPackage();
        if (fs.existsSync(name)) {
            fs.unlinkSync(name);
        }

        if (RUN_PLATFORM === "linux") {
            let command = "wget -P " + path + " " + URL;
            await this.childProcess.execSync(
                command,
                {stdio: [process.stdin, process.stdout, "pipe"]}
            );
        } else if (RUN_PLATFORM === "mac") {
            let command = "curl -o " + name + " " + URL;
            await this.childProcess.execSync(
                command,
                {stdio: [process.stdin, process.stdout, "pipe"]}
            );
        }
    }

    // TODO: support ios, windows
    install(path) {
        if (!fs.existsSync(path)) {
            throw new Error("No such file for installing package");
        }

        if (RUN_PLATFORM === "linux") {
            if (TEST_PLATFORM === "linux") {
                let command = "echo '" + PASS_WORD + "' | sudo -S dpkg -i " + path;
                this.childProcess.execSync(
                    command,
                    {stdio: [process.stdin, process.stdout, "pipe"]}
                );
            } else if (TEST_PLATFORM === "android") {
                let command = "adb -s " + ANDROID_SN + " install -r -d " + path;
                let subprocess = this.childProcess.execSync(
                    command,
                    {encoding: "UTF-8", stdio: "pipe"}
                );

                if (subprocess != null) {
                    console.log(subprocess);

                    let str = subprocess.split("\n")[1].split(" ")[0];
                    if (str == "Failure") {
                        throw new Error("Install package is failed!");
                    }
                }
            }
        } else if (RUN_PLATFORM === "mac") {
            if (TEST_PLATFORM === "mac") {
                let unzipPath = GET_PACKAGE_PATH() + MODULE_JSON.getPath() + "chromium-mac/";
                if (fs.existsSync(unzipPath)) {
                    this.childProcess.execSync("rm -rf " + unzipPath, {stdio: "inherit"});
                }

                fs.mkdirSync(unzipPath);

                let command = "unzip -o -q -d " + unzipPath + " " + path;
                this.childProcess.execSync(
                    command,
                    {stdio: [process.stdin, process.stdout, "pipe"]}
                );
            }
        }
    }

    checkCommit() {
        let str = GET_PACKAGE_PATH() + "/";
        return fs.existsSync(str);
    }

    checkPackage(path) {
        return fs.existsSync(path);
    }

    // TODO: support ios, windows
    checkInstalled() {
        let chromePath;
        if (TEST_PLATFORM === "linux") {
            chromePath = "/usr/bin/chromium-browser-unstable";
        } else if (TEST_PLATFORM === "mac") {
            chromePath = GET_PACKAGE_PATH() + MODULE_JSON.getPath() + "chromium-mac/Chromium.app/Contents/MacOS/Chromium";
        } else if (TEST_PLATFORM === "android") {
            return false;
        } else {
            let string = "We will support this test platform to install chrome package: " + TEST_PLATFORM;
            throw new Error(string);
        }

        return fs.existsSync(chromePath);
    }

    // TODO: support windows
    checkMD5(path) {
        if (!fs.existsSync(path)) {
            throw new Error("No such file for checking md5 value");
        }

        let valueMD5;
        if (RUN_PLATFORM === "linux") {
            let command = "md5sum " + path;
            let md5Value = this.childProcess.execSync(command, {encoding: "UTF-8"});
            let array = md5Value.split(" ");
            valueMD5 = array[0];
        } else if (RUN_PLATFORM === "mac") {
            let command = "md5 " + path;
            let md5Value = this.childProcess.execSync(command, {encoding: "UTF-8"});
            let array = md5Value.split("=")[1].split(" ");
            valueMD5 = array[1];
        }

        if (valueMD5 == MODULE_JSON.getMd5()) {
            return true;
        } else {
            MODULE_JSON.writeMd5(valueMD5);
            return false;
        }
    }
}

// read require json file
let requireJsonPath = require.main.filename.slice(0, -2) + "json";

if (fs.existsSync(requireJsonPath)) {
    let requireJson = JSON.parse(fs.readFileSync(requireJsonPath)).modules;

    // analyse require json file
    for (let x in requireJson) {
        if (requireJson[x] == "chrome") {
            MODULE_CHROME = new modules_chrome();
        } else if (requireJson[x] == "csv") {
            MODULE_CSV = new modules_csv();
        } else if (requireJson[x] == "tools") {
            MODULE_TOOLS = new modules_tools();
        }
    }
}
