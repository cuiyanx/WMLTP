const fs = require("fs");
const os = require("os");
const http = require("http");
const path = require("path");
const crypto = require("crypto");
const url = require("url");
const unzip = require("unzip");
const moment = require("moment");
const execSync = require("child_process").execSync;

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
let array = process.cwd().split(path.sep);

if (array[array.length - 1] != "WMLTP") {
    if (array[array.length - 2] == "WMLTP") {
        process.chdir("../");
    } else {
        throw new Error("The current work path is not the inside path of the project");
    }
}

// creat output directory
function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

// delete folder
function deleteFolder(dirname) {
    let files = [];
    if(fs.existsSync(dirname)) {
        files = fs.readdirSync(dirname);
        files.forEach(function(files, index) {
            let curPath = dirname + path.sep + files;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolder(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });

        fs.rmdirSync(dirname);
    }
}

const PREFER_MODELS = [
    "macOS-Polyfill-Fast-WASM",
    "macOS-Polyfill-Sustained-WebGL",
    "macOS-WebNN-Fast-BNNS",
    "macOS-WebNN-Fast-DNNL",
    "macOS-WebNN-Sustained-MPS",
    "Android-Polyfill-Fast-WASM",
    "Android-Polyfill-Sustained-WebGL",
//    "Android-WebNN-Fast-NNAPI",
    "Android-WebNN-Sustained-NNAPI",
//    "Android-WebNN-Low-NNAPI",
    "Win-Polyfill-Fast-WASM",
    "Win-Polyfill-Sustained-WebGL",
    "Win-WebNN-Fast-DNNL",
    "Win-WebNN-Sustained-DML",
    "Win-WebNN-Sustained-clDNN",
    "Win-WebNN-Low-DML",
    "Linux-Polyfill-Fast-WASM",
    "Linux-Polyfill-Sustained-WebGL",
    "Linux-WebNN-Fast-DNNL",
    "Linux-WebNN-Sustained-clDNN",
    "Linux-WebNN-Fast-IE-MKLDNN",
    "Linux-WebNN-Sustained-IE-clDNN",
    "Linux-WebNN-Low-IE-MYRIAD"
];

REPORT_PATH = null;
CHROMIUM_PATH = null;
TEST_PLATFORM = null;
CURRENT_URL = null;

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

    getWebmlIEMYRIAD() {
        if (typeof(this.json.webml.IEMYRIAD) == "boolean") {
            return this.json.webml.IEMYRIAD;
        } else {
            let string = "Can not support this WebML IEMYRIAD: " + this.json.webml.IEMYRIAD;
            throw new Error(string);
        }
    }

    getWebmlSwitch() {
        if (typeof(this.json.webml.supportSwitch) == "boolean") {
            return this.json.webml.supportSwitch;
        } else {
            let string = "Can not support this WebML switch: " + this.json.webml.supportSwitch;
            throw new Error(string);
        }
    }

    getWebmlPrefer() {
        let flag = false;
        for (let prefer of PREFER_MODELS) {
            if (prefer == this.json.webml.prefer) flag = true;
        }

        // all prefer
        if (this.json.webml.prefer == "all") {
            return this.json.webml.prefer;
        } else if (flag) { // single prefer
            return this.json.webml.prefer;
        } else {
            let str = "please make sure prefer is correct";
            throw new Error(str);
        }
    }

    getPassword() {
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
            if (this.json.linux.chromiumBuild == null) {
                throw new Error("Package name on linux is null!");
            } else {
                return this.json.linux.chromiumBuild;
            }
        } else if (TEST_PLATFORM == "mac") {
            if (this.json.mac.chromiumBuild == null) {
                throw new Error("Package name on mac is null!");
            } else {
                return this.json.mac.chromiumBuild;
            }
        } else if (TEST_PLATFORM == "windows") {
            if (this.json.windows.chromiumBuild == null) {
                throw new Error("Package name on windows is null!");
            } else {
                return this.json.windows.chromiumBuild;
            }
        } else if (TEST_PLATFORM == "android") {
            if (this.json.android.chromiumBuild == null) {
                throw new Error("Package name on android is null!");
            } else {
                return this.json.android.chromiumBuild;
            }
        } else if (TEST_PLATFORM == "ios") {
            if (this.json.ios.chromiumBuild == null) {
                throw new Error("Package name on ios is null!");
            } else {
                return this.json.ios.chromiumBuild;
            }
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
                return this.json.android.path;
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

    checkURL(url) {
        let reg = (/(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/g);
        if (!reg.test(url)) {
            return false;
        } else {
            return true;
        }
    }

    getNightBuildURL() {
        if (this.json.nightlyBuildURL !== null) {
            if (MODULE_JSON.checkURL(this.json.nightlyBuildURL)) {
                return this.json.nightlyBuildURL;
            } else {
                console.log("Incorrect network addr, will launch default addr, \n Please check config.json");
                return "http://powerbuilder.sh.intel.com/public/webml/nightly/";
            }
        } else {
            return "http://powerbuilder.sh.intel.com/public/webml/nightly/";
        }
    }

    getGeneralTestCaseURL() {
        if (this.json.remoteURL !== null) {
            return this.json.remoteURL;
        } else {
            console.log("Incorrect network addr, will launch default addr, \n Please check config.json");
            return "https://brucedai.github.io/webnnt/test/index-local.html";
        }
    }

    getRealModelFlag() {
        if (this.json.needCheckRealModelTC !== null) {
            return this.json.needCheckRealModelTC;
        } else {
            return false;
        }
    }

    getRealModelTestCaseURL() {
        if (this.json.localServerURL !== null) {
            return this.json.localServerURL;
        } else {
            console.log("Incorrect network addr, will launch default addr, \n Please check config.json");
            return "http://localhost:8080/test/squeezenet1.1.html";
        }
    }

    getMd5Online(url) {
        let md5Value = "";
        http.get(url, (res) => {
            const {statusCode} = res;

            let error;
            if (statusCode == 404) {
                throw new Error("Please make sure md5 file exist!");
            }

            if (statusCode !== 200) {
                error = new Error("Request Failed.\n" + `Status Code: ${statusCode}`);
            }

            if (error) {
                console.log(error.message);
                res.resume();
                return;
            }

            res.on("data", (chunk) => {
                md5Value += chunk;
            });

            res.on("end", () => {
                md5Value = md5Value.split(" ")[0];
                MODULE_JSON.writeMd5(md5Value);
            });
        }).on("error", (e) => {
            console.log(`getMd5Online func got error: ${e.message}`);
        });
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
            this.json.linux.chromiumBuild = name;
        } else if (TEST_PLATFORM == "mac") {
            this.json.mac.chromiumBuild = name;
        } else if (TEST_PLATFORM == "windows") {
            this.json.windows.chromiumBuild = name;
        } else if (TEST_PLATFORM == "android") {
            this.json.android.chromiumBuild = name;
        } else if (TEST_PLATFORM == "ios") {
            this.json.ios.chromiumBuild = name;
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
WEBML_IEMYRIAD = MODULE_JSON.getWebmlIEMYRIAD();
WEBML_SWITCH = MODULE_JSON.getWebmlSwitch();
WEBML_PREFER = MODULE_JSON.getWebmlPrefer();
PASS_WORD = MODULE_JSON.getPassword();
DESIGNATED_COMMIT = MODULE_JSON.getDesignatedCommit();
FLAG_DESIGNATED_COMMIT = MODULE_JSON.getDesignatedCommitFlag();
REMOTE_TEST_URL = MODULE_JSON.getGeneralTestCaseURL();
REAL_MODEL_FLAG = MODULE_JSON.getRealModelFlag();
REAL_MODEL_URL = MODULE_JSON.getRealModelTestCaseURL();

// global tools
// TODO: support windows
TOOLS_DATE = function() {
    let DateString = moment().format("YYYYMMDDHHmmsss")
    return DateString;
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

GET_CHROMIUM_PATH = function() {
    if (FLAG_DESIGNATED_COMMIT) {
        CHROMIUM_PATH = path.join(process.cwd(), "output", "chromiumBuild", DESIGNATED_COMMIT);
    } else {
        if (MODULE_JSON.getNewestCommit() == null) {
            throw new Error("Newest commit can not be null!");
        } else {
            CHROMIUM_PATH = path.join(process.cwd(), "output", "chromiumBuild", MODULE_JSON.getNewestCommit());
        }
    }

    mkdirsSync(CHROMIUM_PATH);
    return CHROMIUM_PATH;
}

GET_REPORT_PATH = function() {
    if (FLAG_DESIGNATED_COMMIT) {
        REPORT_PATH = path.join(process.cwd(), "output", "report", DESIGNATED_COMMIT)
    } else {
        if (MODULE_JSON.getNewestCommit() == null) {
            throw new Error("Newest commit can not be null!");
        } else {
            REPORT_PATH = path.join(process.cwd(), "output", "report", MODULE_JSON.getNewestCommit())
        }
    }

    mkdirsSync(REPORT_PATH);
    return REPORT_PATH;
}

function getLDLibraryPath() {
    let basePath = path.join(GET_CHROMIUM_PATH(), MODULE_JSON.getPath(),
        "chromium-mac/Chromium.app/Contents/Versions/");
    let fileNames = fs.readdirSync(basePath);

    for (let fileName of fileNames) {
        if (fs.statSync(basePath + fileName).isDirectory()) {
            basePath = basePath + fileName + "/Chromium Framework.framework/Libraries/";
            break;
        }
    }

    return basePath;
}

// please check array.length == 0
GET_PREFER_MODELS = function() {
    let preferArray = new Array();
    if (WEBML_PREFER == "all") {
        if (TEST_PLATFORM == "linux") {
            if (WEBML_IEMYRIAD) {
                preferArray.push("Linux-WebNN-Low-IE-MYRIAD");
            } else {
                preferArray.push("Linux-Polyfill-Fast-WASM");
                preferArray.push("Linux-Polyfill-Sustained-WebGL");
                preferArray.push("Linux-WebNN-Fast-DNNL");
                preferArray.push("Linux-WebNN-Sustained-clDNN");

                if (WEBML_SWITCH) {
                    preferArray.push("Linux-WebNN-Fast-IE-MKLDNN");
                    preferArray.push("Linux-WebNN-Sustained-IE-clDNN");
                }
            }
        } else if (TEST_PLATFORM == "android") {
            preferArray.push("Android-Polyfill-Fast-WASM");
            preferArray.push("Android-Polyfill-Sustained-WebGL");
            preferArray.push("Android-WebNN-Sustained-NNAPI");
        } else if (TEST_PLATFORM == "mac") {
            preferArray.push("macOS-Polyfill-Fast-WASM");
            preferArray.push("macOS-Polyfill-Sustained-WebGL");
            preferArray.push("macOS-WebNN-Fast-BNNS");
            preferArray.push("macOS-WebNN-Sustained-MPS");

            if (WEBML_SWITCH) {
                // Add process ENV: no need
                // process.env.LD_LIBRARY_PATH = getLDLibraryPath();
                preferArray.push("macOS-WebNN-Fast-DNNL");
            }
        } else if (TEST_PLATFORM == "windows") {
            preferArray.push("Win-Polyfill-Fast-WASM");
            preferArray.push("Win-Polyfill-Sustained-WebGL");
            preferArray.push("Win-WebNN-Fast-DNNL");
            preferArray.push("Win-WebNN-Sustained-clDNN");

            if (WEBML_SWITCH) {
                preferArray.push("Win-WebNN-Sustained-DML");
                preferArray.push("Win-WebNN-Low-DML");
            }
        }
    } else {
        if (TEST_PLATFORM == "linux") {
            if (WEBML_IEMYRIAD) {
                if (WEBML_PREFER == "Linux-WebNN-Low-IE-MYRIAD") {
                    preferArray.push(WEBML_PREFER);
                } else {
                    let str = WEBML_PREFER + " is incorrect because IEMYRIAD is true";
                    throw new Error(str);
                }
            } else {
                if (WEBML_PREFER == "Linux-Polyfill-Fast-WASM" ||
                WEBML_PREFER == "Linux-Polyfill-Sustained-WebGL" ||
                WEBML_PREFER == "Linux-WebNN-Fast-DNNL" ||
                WEBML_PREFER == "Linux-WebNN-Sustained-clDNN") {
                    preferArray.push(WEBML_PREFER);
                } else if (WEBML_PREFER == "Linux-WebNN-Fast-IE-MKLDNN" ||
                WEBML_PREFER == "Linux-WebNN-Sustained-IE-clDNN") {
                    if (WEBML_SWITCH) {
                        preferArray.push(WEBML_PREFER);
                    } else {
                        let str = WEBML_PREFER + " is incorrect because supportSwitch is false";
                        throw new Error(str);
                    }
                } else {
                    if (WEBML_PREFER == "Linux-WebNN-Low-IE-MYRIAD") {
                        let str = WEBML_PREFER + " is incorrect because IEMYRIAD is false";
                        throw new Error(str);
                    } else {
                        let str = WEBML_PREFER + " is incorrect because test platform is " + TEST_PLATFORM;
                        throw new Error(str);
                    }
                }
            }
        } else if (TEST_PLATFORM == "android") {
            if (WEBML_PREFER == "Android-Polyfill-Fast-WASM" ||
            WEBML_PREFER == "Android-Polyfill-Sustained-WebGL" ||
            WEBML_PREFER == "Android-WebNN-Sustained-NNAPI") {
                preferArray.push(WEBML_PREFER);
            } else {
                let str = WEBML_PREFER + " is incorrect because test platform is " + TEST_PLATFORM;
                throw new Error(str);
            }
        } else if (TEST_PLATFORM == "mac") {
            if (WEBML_PREFER == "macOS-Polyfill-Fast-WASM" ||
            WEBML_PREFER == "macOS-Polyfill-Sustained-WebGL" ||
            WEBML_PREFER == "macOS-WebNN-Fast-BNNS" ||
            WEBML_PREFER == "macOS-WebNN-Sustained-MPS") {
                preferArray.push(WEBML_PREFER);
            } else if (WEBML_PREFER == "macOS-WebNN-Fast-DNNL") {
                if (WEBML_SWITCH) {
                    // Add process ENV: no need
                    // process.env.LD_LIBRARY_PATH = getLDLibraryPath();
                    preferArray.push(WEBML_PREFER);
                } else {
                    let str = WEBML_PREFER + " is incorrect because supportSwitch is false";
                    throw new Error(str);
                }
            } else {
                let str = WEBML_PREFER + " is incorrect because test platform is " + TEST_PLATFORM;
                throw new Error(str);
            }
        } else if (TEST_PLATFORM == "windows") {
            if (WEBML_PREFER == "Win-Polyfill-Fast-WASM" ||
            WEBML_PREFER == "Win-Polyfill-Sustained-WebGL" ||
            WEBML_PREFER == "Win-WebNN-Fast-DNNL" ||
            WEBML_PREFER == "Win-WebNN-Sustained-clDNN") {
                preferArray.push(WEBML_PREFER);
            } else if (WEBML_PREFER == "Win-WebNN-Sustained-DML" ||
            WEBML_PREFER == "Win-WebNN-Low-DML") {
                if (WEBML_SWITCH) {
                    preferArray.push(WEBML_PREFER);
                } else {
                    let str = WEBML_PREFER + " is incorrect because supportSwitch is false";
                    throw new Error(str);
                }
            } else {
                let str = WEBML_PREFER + " is incorrect because test platform is " + TEST_PLATFORM;
                throw new Error(str);
            }
        }
    }

    return preferArray;
}

GET_TEST_URLS = function() {
    let testURLs = new Map();
    testURLs.set("general", REMOTE_TEST_URL);

    if (REAL_MODEL_FLAG) testURLs.set("realModel", REAL_MODEL_URL);

    return testURLs;
}

CHECK_RUN_ENV = function() {
    let command, androidSN, adbPath;
    if (TEST_PLATFORM == "android") {
        if (RUN_PLATFORM == "linux") {
            adbPath = "./lib/adb-tool/Linux/adb";

            try {
                command = "killall adb";
                execSync(command, {encoding: "UTF-8", stdio: "pipe"});
            } catch(e) {
                if (e.message.search("no process found") == -1) {
                    throw e;
                }
            }
        } else if (RUN_PLATFORM == "mac") {
            adbPath = "./lib/adb-tool/Mac/adb";

            try {
                command = "killall adb";
                execSync(command, {encoding: "UTF-8", stdio: "pipe"});
            } catch(e) {
                if (e.message.search("No matching processes") == -1) {
                    throw e;
                }
            }
        } else if (RUN_PLATFORM == "windows") {
            adbPath = ".\\lib\\adb-tool\\Windows\\adb";

            try {
                command = "taskkill /im adb.exe /f";
                execSync(command, {encoding: "UTF-8", stdio: "pipe"});
            } catch(e) {
                if (e.message.search("not found") == -1) {
                    throw e;
                }
            }
        }

        command = adbPath + " start-server";
        execSync(command, {encoding: "UTF-8", stdio: "pipe"});

        try {
            command = adbPath + " devices";
            let log = execSync(command, {encoding: "UTF-8", stdio: "pipe"}).split(/\s+/);

            let array = new Array();
            for (let i = 0; i < log.length; i++) {
                if (log[i] == "device") array.push(log[i - 1]);
            }

            if (array.length == 0) {
                throw new Error("no android device");
            } else if (array.length > 1) {
                androidSN = array[0];
                console.log(LOGGER_HEARD() + "more android devices, using the first one: " + array[0]);
            } else {
                androidSN = array[0];
                console.log(LOGGER_HEARD() + "android device: " + array[0]);
            }
        } catch(e) {
            throw e;
        }

        try {
            command = adbPath + " -s " + androidSN + " shell pm list packages | grep org.chromium.chrome";
            execSync(command, {encoding: "UTF-8", stdio: "pipe"});
            console.log(LOGGER_HEARD() + "chromium to be tested is installed correctly");
        } catch(e) {
            throw new Error("chromium to be tested is not installed correctly");
        }

        command = adbPath + " -s " + androidSN + " shell am force-stop org.chromium.chrome";
        execSync(command, {encoding: "UTF-8", stdio: "pipe"});
    } else if (TEST_PLATFORM == "linux") {
        console.log(LOGGER_HEARD() + "runtime environment: Linux");

        let chromiumPath = "/usr/bin/chromium-browser-unstable";

        if (fs.existsSync(chromiumPath)) {
            console.log(LOGGER_HEARD() + "chromium to be tested is installed correctly");
        } else {
            throw new Error("chromium to be tested is not installed correctly");
        }

        try {
            command = "ps aux | grep chrome";
            let Lines = execSync(command, {encoding: "UTF-8", stdio: "pipe"}).trim().split("\n");
            for (let line of Lines) {
                let infos = line.trim().split(/\s+/);
                if (infos[10] == "/opt/chromium.org/chromium-unstable/chrome") {
                    command = "kill " + infos[1];
                    execSync(command, {encoding: "UTF-8", stdio: "pipe"});
                }
            }
        } catch(e) {
            if (e.message.search("No such process") == -1) {
                throw e;
            }
        }
    } else if (TEST_PLATFORM == "mac") {
        console.log(LOGGER_HEARD() + "runtime environment: Mac");

        let chromiumPath = path.join(GET_CHROMIUM_PATH(), MODULE_JSON.getPath(),
        "chromium-mac/Chromium.app/Contents/MacOS/Chromium");

        if (fs.existsSync(chromiumPath)) {
            console.log(LOGGER_HEARD() + "chromium to be tested is installed correctly");
        } else {
            throw new Error("chromium to be tested is not installed correctly");
        }

        try {
            command = "killall Chromium";
            execSync(command, {encoding: "UTF-8", stdio: "pipe"});
        } catch(e) {
            if (e.message.search("No matching processes") == -1) {
                throw e;
            }
        }
    } else if (TEST_PLATFORM == "windows") {
        console.log(LOGGER_HEARD() + "runtime environment: Windows");

        let chromiumPath = path.join(GET_CHROMIUM_PATH(), MODULE_JSON.getPath(), "Chrome-bin", "chrome.exe");

        if (fs.existsSync(chromiumPath)) {
            console.log(LOGGER_HEARD() + "chromium to be tested is installed correctly");
        } else {
            throw new Error("chromium to be tested is not installed correctly");
        }

        try {
            command = "wmic process where name='chrome.exe' get processid";
            let idLines = execSync(command, {encoding: "UTF-8", stdio: "pipe"}).trim().split("\n");
            for (let idLine of idLines) {
                idLine = idLine.trim();
                if (idLine !== "ProcessId") {
                    command = "wmic process where processid='" + idLine + "' get executablepath";
                    let pathLine = execSync(command, {encoding: "UTF-8", stdio: "pipe"}).trim().split("\n");
                    if (pathLine[1] == chromiumPath) {
                        command = "wmic process where processid='" + idLine + "' delete";
                        execSync(command, {encoding: "UTF-8", stdio: "pipe"});
                    }
                }
            }
        } catch(e) {
            if (e.message.search("not found") == -1) {
                throw e;
            }
        }
    }
}

// chrome module
class modules_chrome {
    constructor() {
        require("chromedriver");
        this.builder = require("../node_modules/selenium-webdriver").Builder;
        this.by = require("../node_modules/selenium-webdriver").By;
        this.key = require("../node_modules/selenium-webdriver").Key;
        this.until = require("../node_modules/selenium-webdriver").until;
        this.chrome = require("../node_modules/selenium-webdriver/chrome");
        this.driver;
        this.options;
        this.browserPath;
        this.remoteTestURL = null;
        this.browserNewest = false;
    }

    async setBrowserNewest(value) {
        if (typeof(value) != "boolean") {
            throw new Error("Is not boolean value: " + value);
        }

        this.browserNewest = value;
    }

    async create(prefer) {
        this.options = new this.chrome.Options();

        if (this.browserNewest) {
            if (TEST_PLATFORM === "linux") {
                this.browserPath = "/usr/bin/chromium-browser-unstable";
            } else if (TEST_PLATFORM === "mac") {
                this.browserPath = path.join(GET_CHROMIUM_PATH(), MODULE_JSON.getPath(),
                    "chromium-mac/Chromium.app/Contents/MacOS/Chromium");
            } else if (TEST_PLATFORM === "windows") {
                this.browserPath = path.join(GET_CHROMIUM_PATH(), MODULE_JSON.getPath(),
                    "Chrome-bin", "chrome.exe");
            }

            if (prefer === "macOS-Polyfill-Fast-WASM") {
                this.remoteTestURL = CURRENT_URL + "?prefer=fast";
                this.options = this.options
                    .setChromeBinaryPath(this.browserPath)
                    .addArguments("--disable-features=WebML");
            } else if (prefer === "macOS-Polyfill-Sustained-WebGL") {
                this.remoteTestURL = CURRENT_URL + "?prefer=sustained";
                this.options = this.options
                    .setChromeBinaryPath(this.browserPath)
                    .addArguments("--disable-features=WebML");
            } else if (prefer === "macOS-WebNN-Fast-BNNS") {
                this.remoteTestURL = CURRENT_URL + "?prefer=fast";
                this.options = this.options
                    .setChromeBinaryPath(this.browserPath)
                    .addArguments("--enable-features=WebML");
            } else if (prefer === "macOS-WebNN-Fast-DNNL") {
                this.remoteTestURL = CURRENT_URL + "?prefer=fast";
                this.options = this.options
                    .setChromeBinaryPath(this.browserPath)
                    .addArguments("--use-dnnl")
                    .addArguments("--no-sandbox")
                    .addArguments("--enable-features=WebML");
            } else if (prefer === "macOS-WebNN-Sustained-MPS") {
                this.remoteTestURL = CURRENT_URL + "?prefer=sustained";
                this.options = this.options
                    .setChromeBinaryPath(this.browserPath)
                    .addArguments("--enable-features=WebML");
            } else if (prefer === "Android-Polyfill-Fast-WASM") {
                this.remoteTestURL = CURRENT_URL + "?prefer=fast";
                this.options = this.options
                    .androidPackage("org.chromium.chrome")
                    .addArguments("--disable-features=WebML");
            } else if (prefer === "Android-Polyfill-Sustained-WebGL") {
                this.remoteTestURL = CURRENT_URL + "?prefer=sustained";
                this.options = this.options
                    .androidPackage("org.chromium.chrome")
                    .addArguments("--disable-features=WebML");
            } else if (prefer === "Android-WebNN-Sustained-NNAPI") {
                this.remoteTestURL = CURRENT_URL + "?prefer=sustained";
                this.options = this.options
                    .androidPackage("org.chromium.chrome")
                    .addArguments("--enable-features=WebML");
            } else if (prefer === "Win-Polyfill-Fast-WASM") {
                this.remoteTestURL = CURRENT_URL + "?prefer=fast";
                this.options = this.options
                    .setChromeBinaryPath(this.browserPath)
                    .addArguments("--no-sandbox")
                    .addArguments("--disable-features=WebML")
            } else if (prefer === "Win-Polyfill-Sustained-WebGL") {
                this.remoteTestURL = CURRENT_URL + "?prefer=sustained";
                this.options = this.options
                    .setChromeBinaryPath(this.browserPath)
                    .addArguments("--no-sandbox")
                    .addArguments("--disable-features=WebML")
            } else if (prefer === "Win-WebNN-Fast-DNNL") {
                this.remoteTestURL = CURRENT_URL + "?prefer=fast";
                this.options = this.options
                    .setChromeBinaryPath(this.browserPath)
                    .addArguments("--no-sandbox")
                    .addArguments("--enable-features=WebML");
            } else if (prefer === "Win-WebNN-Sustained-DML") {
                this.remoteTestURL = CURRENT_URL + "?prefer=sustained";
                this.options = this.options
                    .setChromeBinaryPath(this.browserPath)
                    .addArguments("--no-sandbox")
                    .addArguments("--use-dml")
                    .addArguments("--enable-features=WebML");
            } else if (prefer === "Win-WebNN-Sustained-clDNN") {
                this.remoteTestURL = CURRENT_URL + "?prefer=sustained";
                this.options = this.options
                    .setChromeBinaryPath(this.browserPath)
                    .addArguments("--no-sandbox")
                    .addArguments("--enable-features=WebML");
            } else if (prefer === "Win-WebNN-Low-DML") {
                this.remoteTestURL = CURRENT_URL + "?prefer=low";
                this.options = this.options
                    .setChromeBinaryPath(this.browserPath)
                    .addArguments("--no-sandbox")
                    .addArguments("--use-dml")
                    .addArguments("--enable-features=WebML");
            } else if (prefer === "Linux-Polyfill-Fast-WASM") {
                this.remoteTestURL = CURRENT_URL + "?prefer=fast";
                this.options = this.options
                    .setChromeBinaryPath(this.browserPath)
                    .addArguments("--disable-features=WebML");
            } else if (prefer === "Linux-Polyfill-Sustained-WebGL") {
                this.remoteTestURL = CURRENT_URL + "?prefer=sustained";
                this.options = this.options
                    .setChromeBinaryPath(this.browserPath)
                    .addArguments("--disable-features=WebML");
            } else if (prefer === "Linux-WebNN-Fast-DNNL") {
                this.remoteTestURL = CURRENT_URL + "?prefer=fast";
                this.options = this.options
                    .setChromeBinaryPath(this.browserPath)
                    .addArguments("--enable-features=WebML")
                    .addArguments("--no-sandbox");
            } else if (prefer === "Linux-WebNN-Sustained-clDNN") {
                this.remoteTestURL = CURRENT_URL + "?prefer=sustained";
                this.options = this.options
                    .setChromeBinaryPath(this.browserPath)
                    .addArguments("--enable-features=WebML")
                    .addArguments("--no-sandbox");
            } else if (prefer === "Linux-WebNN-Fast-IE-MKLDNN") {
                this.remoteTestURL = CURRENT_URL + "?prefer=fast";
                this.options = this.options
                    .setChromeBinaryPath(this.browserPath)
                    .addArguments("--enable-features=WebML")
                    .addArguments("--use-inference-engine")
                    .addArguments("--no-sandbox");
            } else if (prefer === "Linux-WebNN-Sustained-IE-clDNN") {
                this.remoteTestURL = CURRENT_URL + "?prefer=sustained";
                this.options = this.options
                    .setChromeBinaryPath(this.browserPath)
                    .addArguments("--enable-features=WebML")
                    .addArguments("--use-inference-engine")
                    .addArguments("--no-sandbox");
            } else if (prefer === "Linux-WebNN-Low-IE-MYRIAD") {
                this.remoteTestURL = CURRENT_URL + "?prefer=low";
                this.options = this.options
                    .setChromeBinaryPath(this.browserPath)
                    .addArguments("--enable-features=WebML")
                    .addArguments("--use-inference-engine")
                    .addArguments("--no-sandbox");
            }
        }

        this.driver = new this.builder()
            .forBrowser("chrome")
            .setChromeOptions(this.options)
            .build();
    }

    getRemoteTestURL() {
        return this.remoteTestURL;
    }

    async open(URL) {
        await this.driver.get(URL);
    }

    async wait(time) {
        await this.driver.sleep(time);
    }

    async check(fn, time) {
        await this.driver.wait(fn, time);
    }

    script(code) {
        return this.driver.executeScript(code);
    }

    async close() {
        this.remoteTestURL = null

        await this.driver.close();

        if (TEST_PLATFORM === "android") {
            this.options = new this.chrome.Options()
                .androidPackage("org.chromium.chrome");
                //.androidDeviceSerial(ANDROID_SN);

            this.driver = new this.builder()
                .forBrowser("chrome")
                .setChromeOptions(this.options)
                .build();

            await this.driver.sleep(3000);
            await this.driver.close();
            await this.driver.sleep(3000);
        }
    }
}

// csv module
class modules_csv {
    constructor() {
        this.csv = require("../node_modules/fast-csv");
        this.csvStream;
    }

    async open(prefer, keyWord="general") {
        this.csvStream = await this.csv.createWriteStream({headers: true})
            .transform(function(row) {return {
                "Feature": row.Feature,
                "Case Id": row.CaseId,
                "Test Case": row.TestCase,
                "Pass": row.Pass,
                "Fail": row.Fail,
                "N/A": row.NA,
                "Measured": row.Measured,
                "Comment": row.Comment,
                "Measured Name": row.MeasuredName,
                "Value": row.Value,
                "Unit": row.Unit,
                "Target": row.Target,
                "Failure": row.Failure,
                "Execution Type": row.ExecutionType,
                "Suite Name": row.SuiteName
            }});

        let name;
        if (TEST_PLATFORM == "android") {
            let CPUType = MODULE_JSON.getPath().split("_")[1];
            name = GET_REPORT_PATH() + path.sep + "report-" + keyWord + "-" + prefer + "-" + CPUType + "-" + TOOLS_DATE() + ".csv";
        } else {
            name = GET_REPORT_PATH() + path.sep + "report-" + keyWord + "-" + prefer + "-" + TOOLS_DATE() + ".csv";
        }

        let WriteStream = await fs.createWriteStream(name);
        await this.csvStream.pipe(WriteStream);

        return name;
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
        let savepath = path.join(GET_CHROMIUM_PATH(), MODULE_JSON.getPath());
        mkdirsSync(savepath);

        let name = path.join(savepath, MODULE_JSON.getPackage());
        let options = {
            host: url.parse(URL).host,
            path: url.parse(URL).pathname,
            port: 80
        }
        let files = fs.createWriteStream(name);

        http.get(options, (res) => {
            res.on("data", (data) => {
                files.write(data);
            });
            res.on("end", () => {
                files.end();
            });
        }).on("error", (err) => {
            console.log(`download func got error: ${err.message}`);
        })
    }

    install(installPath) {
        if (!fs.existsSync(installPath)) {
            throw new Error("No such file for installing package");
        }

        if (RUN_PLATFORM === "linux") {
            if (TEST_PLATFORM === "linux") {
                let command = "echo '" + PASS_WORD + "' | sudo -S dpkg -i " + installPath;
                this.childProcess.execSync(
                    command,
                    {stdio: [process.stdin, process.stdout, "pipe"], timeout: 300000}
                );
            } else if (TEST_PLATFORM === "android") {
                let command = "adb install -r " + installPath;
                let subprocess = this.childProcess.execSync(
                    command,
                    {encoding: "UTF-8", stdio: "pipe", timeout: 300000}
                );

                if (subprocess != null) {
                    let str = subprocess.split("\n")[1].split(" ")[0];
                    if (str == "Failure") {
                        throw new Error("Install package is failed!");
                    }
                }
            }
        } else if (RUN_PLATFORM === "mac") {
            if (TEST_PLATFORM === "mac") {
                let unzipPath = path.join(GET_CHROMIUM_PATH(), MODULE_JSON.getPath(), "chromium-mac");
                if (fs.existsSync(unzipPath)) {
                    this.childProcess.execSync("rm -rf " + unzipPath, {stdio: "inherit"});
                }

                mkdirsSync(unzipPath);

                let command = "unzip -o -q -d " + unzipPath + " " + installPath;
                this.childProcess.execSync(
                    command,
                    {stdio: [process.stdin, process.stdout, "pipe"], timeout: 300000}
                );
            }
        } else if (RUN_PLATFORM === "windows") {
            if (TEST_PLATFORM === "windows") {
                let unzipPath = path.join(GET_CHROMIUM_PATH(), MODULE_JSON.getPath());
                fs.createReadStream(installPath).pipe(unzip.Extract({path: unzipPath}));
            }
        }
    }

    checkCommit() {
        let str = GET_CHROMIUM_PATH();
        return fs.existsSync(str);
    }

    checkPackage(path) {
        return fs.existsSync(path);
    }

    uninstallChromium() {
        console.log("Now will uninstall chromium package.");
        if (TEST_PLATFORM === "linux") {
            let command = "echo '" + PASS_WORD + "' | sudo -S dpkg -r chromium-browser-unstable";
            let subprocess = this.childProcess.execSync(
                command, {timeout: 300000, encoding: "UTF-8", stdio: [process.stdin, process.stdout, "pipe"]}
                );
        } else if (TEST_PLATFORM === "android") {
            let command = "adb uninstall org.chromium.chrome";
            let subprocess = this.childProcess.execSync(
                command, {timeout: 300000, encoding: "UTF-8", stdio: [process.stdin, process.stdout, "pipe"]}
                );
        } else if (TEST_PLATFORM === "mac") {
            let command = path.join(GET_CHROMIUM_PATH(), MODULE_JSON.getPath(), "chromium-mac");
            deleteFolder(command);
        }
    }

    // TODO: support ios, windows
    checkInstalled() {
        let chromePath;
        if (TEST_PLATFORM === "linux") {
            chromePath = "/usr/bin/chromium-browser-unstable";
        } else if (TEST_PLATFORM === "mac") {
            chromePath = path.join(GET_CHROMIUM_PATH(), MODULE_JSON.getPath(), "chromium-mac/Chromium.app/Contents/MacOS/Chromium");
        } else if (TEST_PLATFORM === "android") {
            return false;
        } else if (TEST_PLATFORM === "windows") {
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
        valueMD5 = crypto.createHash("md5").update(fs.readFileSync(path)).digest("hex");

        if (valueMD5 == MODULE_JSON.getMd5()) {
            return true;
        } else {
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
