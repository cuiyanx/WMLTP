'use strict';

const {Builder, By, Key, Until} = require("../node_modules/selenium-webdriver");
const chrome = require("../node_modules/selenium-webdriver/chrome");

function checkDriver(driver) {
    if (driver == null) {
        throw new Error("Chrome driver is not created!");
    }
}

class ChromeDriver {

    constructor(){
        this.Driver = null;
        this.Options = null;
        this.Path = null;
        this.WebMLSwitch = null;
        this.platform = null;
    }

    setPlatform(platform) {
        this.platform = platform;
    }

    setWebMLSwitch(switchs) {
        if (switchs) {
            this.WebMLSwitch = "--enable-features=WebML";
        } else {
            this.WebMLSwitch = "--disable-features=WebML";
        }
    }

    setChromePath(path) {
        this.Path = path;
    }

    getDriver() {
        checkDriver(this.Driver);

        return this.Driver;
    }

    getBy() {
        return By;
    }

    getKey() {
        return Key;
    }

    getUntil() {
        return Until;
    }

    async create() {
        if (this.platform === "ubuntu") {
            this.Options = new chrome.Options();
        } else if (this.platform === "android") {
            this.Options = new chrome.Options().androidChrome();
        } else {
            if (this.platform == null)
                throw new Error("Need platform to init!");
            else
                throw new Error("Can not support this platform!");
        }

        if (this.WebMLSwitch != null) {
            this.Options = this.Options.addArguments(this.WebMLSwitch);
        }

        if (this.Path != null) {
            this.Options = this.Options.setChromeBinaryPath(this.Path);
        }

        this.Driver = new Builder()
            .forBrowser("chrome")
            .setChromeOptions(this.Options)
            .build();
    }

    async createDriver(platform, path, switchs) {
        await this.setplatform(platform);
        await this.setChromePath(path);
        await this.setWebMLSwitch(switchs);
        await this.create();
    }

    async open(RemoteURL) {
        checkDriver(this.Driver);

        await this.Driver.manage().window().maximize();
        await this.Driver.get(RemoteURL);
    }

    async wait(time) {
        checkDriver(this.Driver);

        await this.Driver.sleep(time);
    }

    async close() {
        checkDriver(this.Driver);

        this.Driver.close();
    }

}

// PUBLIC API

exports.ChromeDriver = new ChromeDriver();
