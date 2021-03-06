# WMLTP

The WMLTP(Web Machine Learning Test Platform) is a nightly automation test framework for [webml-polyfill](https://github.com/intel/webml-polyfill) with Google Chrome.
Now, we support Linux(Ubuntu 16.04), android device, and Mac, and Windows.
Next, we will support IOS.

## Install

```sh
$ npm install
```

## Start

```sh
$ npm start
```

#### Download newest package

```sh
$ npm run downloadpackage
```

#### Install newest package

```sh
$ npm run installpackage
```

#### Grasp test result

```sh
$ npm run testresult
```

## Set WMLTP.config.json file

* `nightlyBuildURL`: nightly chromium build path

* `remoteURL`: general test case URL

* `needCheckRealModelTC`: real model test case flag, support **true** and **false**.

* `localServerURL`: real model test case URL

* `platform`: test platforms(one or more)

    ```
    {"mac"}
    {"linux", "android"}
    ```

* `password`: supper user password for running platform
* `webml.prefer`: support `all` or single prefer, such as `Linux-WebNN-Fast-MKLDNN`.
* `webml.switch`: Mac: `--use-dnnl`, Linux: `--use-inference-engine`, Windows: `--use-dml` and `--use-inference-engine`, support **true** and **false**. If `INFERENCE_ENGINE` is **true**, `BACKEND_LIST` must be set, support **IE-MKLDNN**,  **IE-clDNN**, **IE-MYRIAD** and **IE-GNA**.
* `designated.flag`: flag of designated commit
* `designated.commit`: if `designated.flag` as **true**, set designated commit
* `serialnumber`: android devices serial number
* `path`: level-2 path(if android devices, need serialnumber-to-path match)

    ```
    "android": {
        "serialnumber": ["9bd88b70", "9bd88b71"],
        "path": ["/android_arm_SUCCEED/", "/android_x64_SUCCEED/"]
    }
    ```

* `suffix`: the suffix name of package
* `others`: automatic setting

## Support platform

| Run Platform  | Test Platform |  Result |
|     :---:     |     :---:     |  :---:  |
| Ubuntu 16.04  | Ubuntu 16.04  |   pass  |
| Ubuntu 16.04  |  Android 8.0  |   pass  |
|      Mac      |       Mac     |   pass  |
|      Mac      |       IOS     |   todo  |
|    Windows    |     Windows   |   pass  |

## Output file

* `./output/report/`: grasp test result to save as csv file
* `./output/package/`: download package to install
