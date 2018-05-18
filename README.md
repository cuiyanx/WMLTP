# WMLP

The WMLP(Web Machine Learning test Platform) is a nightly automation test framework for [webml-polyfill](https://github.com/intel/webml-polyfill) with Google Chrome.
Now, we support Linux(Ubuntu 16.04), android device, and Mac.
Next, we will support IOS and Windows.

## Prerequisites
* Installing Google Chrome Browser(65.x.xxx).
* Running WMLP with Google Chrome, need [chromedriver](http://chromedriver.storage.googleapis.com/index.html).

   ```sh
   chromedriver(2.37)  -->  google-chrome(65.x.xxx)
   ```

* Add *chromedriver* to systerm path.
   + For linux:

      ```sh
      export PATH=<yourPath>:$PATH
      ```

   + For mac: copy *chromedriver* to `/usr/local/bin/`

* If running WMLP on android device(>= 8.0), need *adb server*.

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

## Set WMLP.config.json file

* `platform`: test platforms(one or more)
* `password`: supper user password for running platform
* `webml`: test web page using [webml-polyfill](https://github.com/intel/webml-polyfill)
* `designated.flag`: flag of designated commit
* `designated.commit`: designated commit
* `path`: level-2 path
* `suffix`: the suffix name of package
* `others`: automatic setting

## Support platform

| Run Platform  | Test Platform |  Result |
|     :---:     |     :---:     |  :---:  |
| Ubuntu 16.04  | Ubuntu 16.04  |   pass  |
| Ubuntu 16.04  |  Android 8.0  |   pass  |
|      Mac      |       Mac     |   pass  |
|      Mac      |       IOS     |   todo  |
|    Windows    |     Windows   |   todo  |

## Output file

* `/output/report/`: grasp test result to save as csv file
* `/output/package/`: download package to install
