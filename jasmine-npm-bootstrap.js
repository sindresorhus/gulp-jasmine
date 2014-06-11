#!/usr/bin/env node
var jasmineRequire = require('jasmine-core');
var jasmine = jasmineRequire.boot(jasmineRequire);
var program = require("commander");
var fs = require('fs'),
  path = require('path'),
  util = require('util');

var Command = require('./node_modules/jasmine/lib/command');
var command = new Command(path.resolve(), process.argv);

exports = module.exports = JasmineNpmBootstrap;

//modified jasmine-npm runner
function JasmineNpmBootstrap(doBootWConfig) {
  if(doBootWConfig === undefined){//default to true
    doBootWConfig = true;
  }
  this.doBootWConfig = doBootWConfig;
  self = this;
  var jasmineRequire = require('jasmine-core');
  var jasmine = jasmineRequire.boot(jasmineRequire);
  var jasmineEnv = jasmine.getEnv()
  var argv = process.argv
  var specFiles = []
  var done = function(passed) {
    if (passed) {
      // process.exit(0);
    } else {
      // process.exit(1);
    }
  };

  program
    .option('--no-color', 'turns off color in output')
    .parse(argv);

  this.addSpecs = function(path){
    if(path){
      specFiles.push(path);
    }
  };

  this.addReporters = function(reporters){
    reporters.forEach(function(r){
        var consoleReporter = new jasmine.ConsoleReporter({
          print: r,//defaulted to util.print in jasmine.js npm binary
          onComplete: done,
          showColors: program.color,
          timer: new jasmine.Timer()
        });
        jasmineEnv.addReporter(consoleReporter);
    });
    util.log("-------Jasmine Reporter Added-------")
  };

  this.run = function() {
    self.loadConfigOrSpecFiles()
    util.log("-------Jasmine Start Execution-------")
    jasmineEnv.execute();
    util.log("-------Jasmine Executed-------")
  };

  this.loadConfigOrSpecFiles = function() {
    jasmineEnv.defaultTimeoutInterval = 5000;
    if(command.execJasmine && self.doBootWConfig) {
      util.log("-------Loading Configs via Jasmine Config-------")
      var Config = require('./node_modules/jasmine/lib/config.js');
      var config = new Config(path.resolve());

      config.specFiles().forEach(function(file) {
        require(file);
      });
    }
    else{
      util.log("-------Loading Specs From Stream Files Names-------")
      specFiles.forEach(function(filename){
        try {
          util.log("-------Attempting to load file: " + filename + "-------")
          require(path.resolve(process.cwd(), filename));
        } catch (e) {
          // Generate a synthetic suite with a failure spec, so that the failure is
          // reported with other results.
          jasmineEnv.describe('Exception loading: ' + filename, function() {
            jasmineEnv.it('Error', function() { throw e; });
          });
        }
      });
    }
  };
  return this;
};
