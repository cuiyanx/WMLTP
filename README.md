# WMLP

The WMLP(Web Machine Learning test Platform) is a nightly automation test framework for [webml-polyfill](https://github.com/intel/webml-polyfill) with Google Chrome.
Now, we support Linux platform (Ubuntu 16.04), we will support android device, Mac, IOS and Windows.

## Prerequisites
* Running WMLP with Google Chrome, need [chromedriver](http://chromedriver.storage.googleapis.com/index.html).

```sh
chromedriver(2.37)  -->  google-chrome(65.x.xxx)
```

* Add *chromedriver* to systerm path.

```sh
export PATH=<yourPath>:$PATH
```

* If running WMLP on android device(>= 8.0), need *adb server*.

## Install

```sh
$ npm install
```

## Start

```sh
$ npm start
```

### Download newest package

```sh
$ npm run downloadpackage
```

### Install newest package

```sh
$ npm run installpackage
```

### Grasp test result

```sh
$ npm run testresult
```
