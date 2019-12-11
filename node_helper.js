/********************************
* node_helper for MMM_NewPir v2 *
* BuGsounet                     *
********************************/

const NodeHelper = require('node_helper')
const exec = require('child_process').exec
const fs = require('fs')
const Gpio = require('onoff').Gpio

module.exports = NodeHelper.create({

  start: function() {
    console.log('Starting node_helper for module ' + this.name)
    this.running = false
    this.MyGovernor = [ "conservative", "ondemand" , "userspace" , "powersave" , "performance" ]
    this.Governor = {
      "actived" : false,
      "governor" : ""
    }
  },

  initialize: function() {
    console.log("[NewPIR] Initialize...")
    this.WantedDisplay(true)
    this.sendSocketNotification("USER_PRESENCE", true)
    console.log("[NewPIR] Init Display...")
    this.setGovernor()
    console.log("[NewPIR] Sensor Active: pin " + this.config.sensorPin)
    this.running = true
    console.log("[NewPIR] Initialize Complete")
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "INIT":
        this.config = payload
        this.initialize()
        break
      case "START":
        this.pirStatus()
        break
      case "TIMER_EXPIRED":
        this.running = false
        this.sendSocketNotification("USER_PRESENCE", false)
        if (this.config.turnOffDisplay) this.WantedDisplay(false)
        break
      case "WAKEUP":
        this.running = true
        this.sendSocketNotification("USER_PRESENCE", true)
        if (this.config.turnOffDisplay) this.WantedDisplay(true)
        if (this.config.debug) console.log("[NewPIR] Wake Up Detected")
        break
    }
  },

  pirStatus: function() {
    var self = this
    this.pir = new Gpio(this.config.sensorPin, 'in', 'both')
    this.pir.watch(function (err, value) {
      if (self.config.debug) console.log("[NewPIR] Sensor read value : " + value)
      if (value == 1) {
        self.sendSocketNotification("RESET_COUNTER")
        self.WantedDisplay(true)
        if (!self.running) {
          self.sendSocketNotification("USER_PRESENCE", true)
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
        if (this.config.debug) console.log("[NewPIR] Display -- Actual : " + actual + " - Wanted : " + wanted)
        if (actual && !wanted) this.setDisplay(false)
        if (!actual && wanted) this.setDisplay(true)
      }
      else console.log("[NewPIR] Display Error")
    })
  },

  setDisplay: function(set) {
    if (set)  exec("/usr/bin/vcgencmd display_power 1")
    else exec("/usr/bin/vcgencmd display_power 0")
    if (this.config.debug) console.log("[NewPIR] Display " + (set ? "ON" : "OFF"))
  },

  setGovernor: function() {
    for (let [item, value] of Object.entries(this.MyGovernor)) {
      if (value == this.config.Governor) {
         this.Governor.actived = true
         this.Governor.governor = value
         exec("echo " + value + " | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor")
         console.log("[NewPIR] Init Governor : " +  value)
      }
    }
    if (this.config.Governor == "") {
      this.Governor.actived = false
      this.Governor.governor = "desactived"
      console.log("[NewPIR] Init Governor : Desactived")
    }
    if (!this.Governor.actived && !(this.Governor.governor == "desactived")) console.log("[NewPIR] Init Governor Error : unknow Governor (" + this.config.Governor + ")")
  },

});
