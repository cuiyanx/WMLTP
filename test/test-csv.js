console.log("Test APIs for saving csv file...");

const csv = require("../modules/savingcsvfile").SavingCSVFile;

(async function() {
    await csv.Open("ubuntu")
        .then(function() {
        console.log("Open csv file success!");
    })
        .catch(function() {
        console.log("Open csv file fail!");
    });

    console.log("------------");
    var data = await csv.getDataFormat();
    for (let x in data) {
        console.log(data[x]);
    }

    console.log("------------");
    await csv.setDataFormat("test", "get data", "set data", "write data", "clear data");
    data = await csv.getDataFormat();
    for (let x in data) {
        console.log(data[x]);
    }

    console.log("------------");
    await csv.Write()
        .then(function() {
        console.log("Write csv file success!");
    })
        .catch(function() {
        console.log("Write csv file fail!");
    });

    await csv.clearDataFormat();
    data = await csv.getDataFormat();
    for (let x in data) {
        console.log(data[x]);
    }

    console.log("------------");
    data = [
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
    await csv.WriteData(data)
        .then(function() {
        console.log("Write csv file success!");
    })
        .catch(function() {
        console.log("Write csv file fail!");
    });
    await csv.clearDataFormat();

    data = {
        Feature: "ABC",
        CaseId: "Data-1",
        TestCase: "write data",
        Pass : "1",
        Fail: null,
        ExecutionType: "auto",
        SuiteName: "tests"
    };
    await csv.WriteData(data)
        .then(function() {
        console.log("Write csv file success!");
    })
        .catch(function() {
        console.log("Write csv file fail!");
    });
    await csv.clearDataFormat();
    await csv.Close()
        .then(function() {
        console.log("Close csv file success!");
    })
        .catch(function() {
        console.log("Close csv file fail!");
    });
})().then(_ => console.log("Test complete!"), err => console.log("ERROR: " + err));
