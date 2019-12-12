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
      "wanted" : "",
      "actual" : ""
    }
  },

  initialize: function() {
    console.log("[NewPIR] Initialize...")
    if (this.conf.display) {
      this.WantedDisplay(true)
      this.sendSocketNotification("PRESENCE", true)
      console.log("[NewPIR] Init Display: Done.")
    }
    else console.log("[NewPIR] Init Display: Desactived.")
    this.setGovernor()
    if (this.conf.sensor) console.log("[NewPIR] Sensor Active: pin " + this.conf.pin)
    else console.log("[NewPIR] Sensor: Desactived.")
    this.running = true
    console.log("[NewPIR] Initialize Complete.")
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
        if (this.conf.debug) console.log("[NewPIR] Wake Up Detected.")
        break
    }
  },

  pirStatus: function() {
    var self = this
    this.pir = new Gpio(this.conf.pin, 'in', 'both')
    this.pir.watch(function (err, value) {
      if (self.conf.debug) console.log("[NewPIR] Sensor read value: " + value)
      if (value == 1) {
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
        if (this.conf.debug) console.log("[NewPIR] Display -- Actual: " + actual + " - Wanted: " + wanted)
        if (actual && !wanted) this.setDisplay(false)
        if (!actual && wanted) this.setDisplay(true)
      }
      else console.log("[NewPIR] Display Error.")
    })
  },

  setDisplay: function(set) {
    if (set)  exec("/usr/bin/vcgencmd display_power 1")
    else exec("/usr/bin/vcgencmd display_power 0")
    if (this.conf.debug) console.log("[NewPIR] Display " + (set ? "ON." : "OFF."))
  },

  setGovernor: function() {
    if (!this.conf.governor) return console.log("[NewPIR] Init Governor : Desactived.")
    else this.Governor.wanted = this.conf.governor
    exec("cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor", (error, stdout, stderr) => {
      if (error) return console.log("[NewPIR] Init Governor Error: Incompatible with your system.")
      stdout= stdout.replace(/\n|\r|(\n\r)/g,'')
      this.Governor.actual = stdout
      if (this.Governor.actual == this.Governor.wanted) return console.log("[NewPIR] Init Governor: " + this.Governor.actual + " is already set.")
      else {
        for (let [item, value] of Object.entries(this.MyGovernor)) {
          if (value == this.Governor.wanted) {
            exec("echo " + value + " | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor")
            this.Governor.actived = true
            return console.log("[NewPIR] Init Governor : " +  value + ".")
          }
        }
        if (!this.Governor.actived) return console.log("[NewPIR] Init Governor Error : unknow Governor (" + this.conf.governor + ").")
      }
    })
  }

});
