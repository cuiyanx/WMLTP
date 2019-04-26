require("../lib/WMLTP-init.js");
const fs = require("fs");
const path = require("path");
const http = require("http");
const url = require("url");
const cheerio = require("cheerio");

let htmlElement;
let downloadCommit;
let remoteURL = MODULE_JSON.getNightBuildURL();
let specifyBuild = MODULE_JSON.getDesignatedCommitFlag() ? MODULE_JSON.getDesignatedCommit() : MODULE_JSON.getDesignatedCommitFlag();
(async function() {
    // getHtmlELE will return html element by cheerio;
    async function getHtmlELE (URL) {
        URL = URL + "/?C=M;O=A";
        return new Promise ((resolve, reject) => {
            let html;
            let options = {
                host: url.parse(URL).host,
                path: url.parse(URL).path,
                port: 80
            }
            htmlElement = [];
            http.get(options, (res) => {
                res.on("data", (data) => {
                    html += data;
                });
                res.on("end", () => {
                    let allHtmlELE = cheerio.load(html);
                    resolve(allHtmlELE);
                });
            }).on("error", (err) => {
                console.log(`getHtmlELE func got error: ${err.message}`);
            });
        });
    }

    async function getCommit(remoteURL) {
        if (typeof(specifyBuild) == "string") {
            await getHtmlELE(remoteURL).then((ele) => {
                ele('a').each((i, e) => {
                    htmlElement.push(ele(e).attr("href").split("/")[0]);
                });
            });
            if (htmlElement.indexOf(specifyBuild) !== -1) {
                downloadCommit = specifyBuild;
            } else {
                console.log("Please check config.json commit, it was invalid");
            }
        } else if (typeof(specifyBuild) == "boolean") {
            await getHtmlELE(remoteURL).then((ele) => {
                // get latest commit id;
                downloadCommit = ele("a")[ele("a").length-1]["attribs"]["href"];
            });
        }
        await MODULE_JSON.writeNewestCommit(downloadCommit);
        return downloadCommit;
    }

    downloadCommit = await getCommit(remoteURL);

    async function getChromiumName(suffix) {
        let downloadPath = remoteURL + "/" + downloadCommit + "/" + MODULE_JSON.getPath() + "/";
        let chromiumPackageName;
        await MODULE_JSON.getMd5Online(downloadPath + MODULE_JSON.getPackage() + ".md5");
        await getHtmlELE(downloadPath).then((ele) => {
            ele('a').each((i,e) => {
                htmlElement.push(ele(e).attr("href").split("/")[0]);
            });
            String.prototype.endWith = function (endStr) {
                let d = this.length - endStr.length;
                return (d >= 0 && this.lastIndexOf(endStr) == d);
            }
            htmlElement.forEach((data) => {
                if (data.endWith(suffix)) {
                    MODULE_JSON.writePackage(data);
                    chromiumPackageName = data;
                }
            });
        });
        return chromiumPackageName;
    }

    async function downloadPackage() {
        let downloadChromiumPath = remoteURL + "/" + downloadCommit + "/" + MODULE_JSON.getPath() + "/";
        let downloadPackageName = await getChromiumName(MODULE_JSON.getSuffix());
        let storeFileLocation = path.join(GET_CHROMIUM_PATH(), MODULE_JSON.getPath(), downloadPackageName);
        if (fs.existsSync(storeFileLocation)) {
            if (await MODULE_TOOLS.checkMD5(storeFileLocation)) {
                console.log(downloadPackageName + " has been download, check MD5 has been pass, no need download again!");
            } else {
                fs.unlinkSync(storeFileLocation);
                console.log("Local package check MD5 fail, will remove it, will download again");

                await MODULE_TOOLS.download(downloadChromiumPath + downloadPackageName);
                console.log(`Begin download ${downloadPackageName}`);
            }
        } else {
            await MODULE_TOOLS.download(downloadChromiumPath + downloadPackageName);
            console.log(`Begin download ${downloadPackageName}`);
        }
    }

    for (let x in TARGET_PLATFORMS) {
        TEST_PLATFORM = TARGET_PLATFORMS[x];
        console.log(LOGGER_HEARD() + "begin download package !");
        console.log("Downloading commit ID : " + downloadCommit);
        await downloadPackage();
    }

})().then(() => {
    console.log("Downloading package is completed!");
}).catch((err) => {
    throw err;
});
