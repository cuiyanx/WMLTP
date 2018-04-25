# WMLP

The WMLP is a test tool for [webml-polyfill](https://github.com/intel/webml-polyfill) with Google Chrome.

## Prerequisites
* Running WMLP with Google Chrome, need [chromedriver](http://chromedriver.storage.googleapis.com/index.html).

```sh
chromedriver(2.37)  -->  google-chrome(65.x.xxx)
```

* Add *chromedriver* to systerm path.

```sh
export PATH=<yourPath>:$PATH
```

* If running WMLP on android device(>= 8.0), need adb server.

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
$ npm run download
```

### Install newest package

```sh
$ npm run install
```

### Grasp test result

```sh
$ npm run testresult
```
