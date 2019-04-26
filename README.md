# WMLTP

The WMLTP(Web Machine Learning Test Platform) is a nightly automation test framework for [webml-polyfill](https://github.com/intel/webml-polyfill) with Google Chrome.
Now, we support Linux(Ubuntu 16.04), android device, and Mac, and Windows.
Next, we will support IOS.

## Prerequisites
* Running WMLP with Google Chromium, need [chromedriver](http://chromedriver.storage.googleapis.com/index.html).

* Add *chromedriver* to systerm path.
   + For linux:

      ```sh
      export PATH=<yourPath>:$PATH
      ```

   + For mac: copy *chromedriver* to `/usr/local/bin/`

   + For Window: download corresponding *chromedriver.exe* and export to system path.

* If running WMLTP on android device(>= 8.0), need *adb server*.

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

* `testCaseURL`: test case URL

* `platform`: test platforms(one or more)

    ```
    {"mac"}
    {"linux", "android"}
    ```

* `password`: supper user password for running platform
* `webml.supportSwitch`: Mac: `--use-mkldnn`, Linux: `--use-inference-engine`, Windows: `--use-dml`, support `true` and `false`.
* `webml.prefer`: support `all` or single prefer, such as `Linux-WebNN-Fast-MKLDNN`.
* `designated.flag`: flag of designated commit
* `designated.commit`: if `designated.flag` as *true*, set designated commit
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
