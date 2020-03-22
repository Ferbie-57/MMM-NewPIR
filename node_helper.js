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
    if (this.conf.display && this.conf.rpi4) this.setDisplay(true) // force use DPMS
    if (this.conf.display) {
      this.wantedDisplay(true)
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
      if (this.conf.display) this.wantedDisplay(true)
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
        if (this.conf.display) this.wantedDisplay(false)
        break
      case "WAKEUP":
        this.running = true
        this.sendSocketNotification("PRESENCE", true)
        if (this.conf.display) this.wantedDisplay(true)
        log("Wake Up Detected.")
        break
      case "WARNING":
        console.log("[NewPIR] --------------------------------------------------------------")
        console.log("[NewPIR] !! MMM-NewPIR is now deprecied with MMM-ASSISTANTMk2        !!")
        console.log("[NewPIR] !! for better compatibility                                 !!")
        console.log("[NewPIR] !! please use screen/pir and other addons                   !!")
        console.log("[NewPIR] !! for installing, more informations:                       !!")
        console.log("[NewPIR] !! https://github.com/bugsounet/addons                      !!")
        console.log("[NewPIR] !! if you have read this warning                            !!")
        console.log("[NewPIR] !! and if you want to continue using this module            !!")
        console.log("[NewPIR] !! You can add `force: true` in your NewPIR config          !!")
        console.log("[NewPIR] !! @bugsounet                                               !!")
        console.log("[NewPIR] --------------------------------------------------------------")
        console.log("[NewPIR] !!              NewPIR IS ACTUALLY DESACTIVED               !!")
        console.log("[NewPIR] --------------------------------------------------------------")
        break
    }
  },

  pirStatus: function() {
    var self = this
    this.pir = new Gpio(this.conf.pin, 'in', 'both')
    this.pir.watch( (err, value)=> {
      log("Sensor read value: " + value)
      if ((value == 1 && !this.conf.reverse) || (value == 0 && this.conf.reverse)) {
        log("Presence detected with value:", value)
        this.sendSocketNotification("RESET_COUNTER")
        this.wantedDisplay(true)
        if (!this.running) {
          this.sendSocketNotification("PRESENCE", true)
          this.running = true
        }
      }
    })
  },

  wantedDisplay: function(wanted) {
    if (this.conf.rpi4) {
      var actual = false
      exec("DISPLAY=:0 xset q | grep Monitor", (err, stdout, stderr)=> {
        if (err == null) {
          let responseSh = stdout.trim()
          var displaySh = responseSh.split(" ")[2]
          if (displaySh == "On") actual = true
          this.resultDisplay(actual,wanted)
        }
        else console.log("[NewPIR] RPI4 Display: " + err)
      })
    } else {
      exec("/usr/bin/vcgencmd display_power", (err, stdout, stderr)=> {
        if (err == null) {
          var displaySh = stdout.trim()
          var actual = Boolean(Number(displaySh.substr(displaySh.length -1)))
          this.resultDisplay(actual,wanted)
        }
        else console.log("[NewPIR] Display: " + err)
      })
    }
  },

  resultDisplay: function(actual,wanted) {
    log("Display -- Actual: " + actual + " - Wanted: " + wanted)
    if (actual && !wanted) this.setDisplay(false)
    if (!actual && wanted) this.setDisplay(true)
  },

  setDisplay: function(set) {
    if (this.conf.rpi4) {
      if (set) exec("DISPLAY=:0 xset dpms force on")
      else exec("DISPLAY=:0 xset dpms force off")
    } else {
      if (set)  exec("/usr/bin/vcgencmd display_power 1")
      else exec("/usr/bin/vcgencmd display_power 0")
    }
    log((this.conf.rpi4 ? "RPI 4 " : "") + "Display " + (set ? "ON." : "OFF."))
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
