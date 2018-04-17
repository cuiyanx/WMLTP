'use strict';

const csv = require("../node_modules/fast-csv");
const fs = require("fs");

class SavingCSVFile {

    constructor(){
        this.Header = [
            "Feature",
            "CaseId",
            "TestCase",
            "Pass",
            "Fail",
            "N/A",
            "Measured",
            "Comment",
            "MeasuredName",
            "Value",
            "Unit",
            "Target",
            "Failure",
            "ExecutionType",
            "SuiteName"
        ];
        this.csvTitle = null;
        this.csvModule = null;
        this.csvName = null;
        this.csvPass = null;
        this.csvFail = null;
        this.DataFormat = {
            Feature: this.csvTitle,
            CaseId: this.csvModule,
            TestCase: this.csvName,
            Pass : this.csvPass,
            Fail: this.csvFail,
            ExecutionType: "auto",
            SuiteName: "tests"
        };
        this.csvStream = csv.format({headers: this.Header});
    }

    async Open(platforms) {
        let arrayDate = new Date().toLocaleDateString().split("/");
        let arrayTime = new Date().toLocaleTimeString().split(":");
        let TimeString = arrayDate[2] + arrayDate[0] + arrayDate[1] + arrayTime[0] + arrayTime[1];

        await fs.mkdirSync("./report", function(err) {return});
        await fs.mkdirSync("./report/" + platforms, function(err) {return});

        let path = "./report/" + platforms + "/report-" + TimeString + ".csv";
        let WriteStream = await fs.createWriteStream(path);
        await this.csvStream.pipe(WriteStream);

        let dataHeader = [];
        await this.csvStream.write(dataHeader);
    }

    async WriteData(Data) {
        await this.csvStream.write(Data);
    }

    async Write() {
        await this.csvStream.write(this.DataFormat);
    }

    async Close() {
        await this.csvStream.end();
    }

    getDataFormat() {
        return this.DataFormat;
    }

    setDataFormat(csvTitle, csvModule, csvName, csvPass, csvFail) {
        this.csvTitle = csvTitle;
        this.csvModule = csvModule;
        this.csvName = csvName;
        this.csvPass = csvPass;
        this.csvFail = csvFail;
        this.DataFormat = {
            Feature: this.csvTitle,
            CaseId: this.csvModule,
            TestCase: this.csvName,
            Pass : this.csvPass,
            Fail: this.csvFail,
            ExecutionType: "auto",
            SuiteName: "tests"
        };
    }

    clearDataFormat() {
        this.DataFormat = {
            Feature: null,
            CaseId: null,
            TestCase: null,
            Pass : null,
            Fail: null,
            ExecutionType: "auto",
            SuiteName: "tests"
        };
    }

}

// PUBLIC API

exports.SavingCSVFile = new SavingCSVFile();
