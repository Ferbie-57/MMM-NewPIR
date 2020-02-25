/********************************
* node_helper for MMM_NewPIR v2 *
* BuGsounet                     *
********************************/

const NodeHelper = require('node_helper')
const exec = require('child_process').exec
const fs = require('fs')
const Gpio = require('onoff').Gpio
const process = require('process')

var _log = function() {
    var context = "[NewPIR]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

module.exports = NodeHelper.create({

  start: function() {
    console.log('Starting node_helper for module ' + this.name)
    this.running = false
    this.MyGovernor = [ "conservative", "ondemand" , "userspace" , "powersave" , "performance" ]
    this.Governor = {
      "actived" : false,
      "wanted" : "",
      "actual" : ""
    }
  },

  initialize: function() {
    console.log("[NewPIR] Initialize...")
    var debug = (this.conf.debug) ? this.conf.debug : false
    if (debug == true) log = _log
    if (this.conf.display) {
      this.WantedDisplay(true)
      this.sendSocketNotification("PRESENCE", true)
      log("Init Display: Done.")
    }
    else log("Init Display: Desactived.")
    this.setGovernor()
    if (this.conf.sensor) {
      log("Sensor Active: pin " + this.conf.pin)
      if (this.conf.reverse) log("The reverse value read by the sensor is activated")
    }
    else log("Sensor: Desactived.")
    this.running = true

    process.on('beforeExit', (code) => {
      console.log('[NewPIR] Thanks for using this addon')
    });

    process.on('exit', (code) => {
      if (this.conf.display) this.WantedDisplay(true)
      console.log('[NewPIR] ByeBye !')
      console.log('[NewPIR] @bugsounet')
    });
    console.log("[NewPIR] Initialize Complete Version:", require('./package.json').version)
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "INIT":
        this.conf = payload
        this.initialize()
        break
      case "START":
        if (this.conf.sensor) this.pirStatus()
        break
      case "TIMER_EXPIRED":
        this.running = false
        this.sendSocketNotification("PRESENCE", false)
        if (this.conf.display) this.WantedDisplay(false)
        break
      case "WAKEUP":
        this.running = true
        this.sendSocketNotification("PRESENCE", true)
        if (this.conf.display) this.WantedDisplay(true)
        log("Wake Up Detected.")
        break
    }
  },

  pirStatus: function() {
    var self = this
    this.pir = new Gpio(this.conf.pin, 'in', 'both')
    this.pir.watch(function (err, value) {
      log("Sensor read value: " + value)
      if ((value == 1 && !self.conf.reverse) || (value == 0 && self.conf.reverse)) {
        log("Presence detected with value:", value)
        self.sendSocketNotification("RESET_COUNTER")
        self.WantedDisplay(true)
        if (!self.running) {
          self.sendSocketNotification("PRESENCE", true)
          self.running = true
        }
      }
    })
  },

  WantedDisplay: function(wanted) {
    exec("/usr/bin/vcgencmd display_power", (err, stdout, stderr)=> {
      if (err == null) {
        var displaySh = stdout.trim()
        var actual = Boolean(Number(displaySh.substr(displaySh.length -1)))
        log("Display -- Actual: " + actual + " - Wanted: " + wanted)
        if (actual && !wanted) this.setDisplay(false)
        if (!actual && wanted) this.setDisplay(true)
      }
      else console.log("[NewPIR] Display Error: " + err)
    })
  },

  setDisplay: function(set) {
    if (set)  exec("/usr/bin/vcgencmd display_power 1")
    else exec("/usr/bin/vcgencmd display_power 0")
    log("Display " + (set ? "ON." : "OFF."))
  },

  setGovernor: function() {
    if (!this.conf.governor) return log("Init Governor : Desactived.")
    else this.Governor.wanted = this.conf.governor
    exec("cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor", (error, stdout, stderr) => {
      if (error) return log("Init Governor Error: Incompatible with your system.")
      stdout= stdout.replace(/\n|\r|(\n\r)/g,'')
      this.Governor.actual = stdout
      if (this.Governor.actual == this.Governor.wanted) return log("Init Governor: " + this.Governor.actual + " is already set.")
      else {
        for (let [item, value] of Object.entries(this.MyGovernor)) {
          if (value == this.Governor.wanted) {
            exec("echo " + value + " | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor")
            this.Governor.actived = true
            return log("Init Governor : " +  value + ".")
          }
        }
        if (!this.Governor.actived) return log("Init Governor Error : unknow Governor (" + this.conf.governor + ").")
      }
    })
  }

});
