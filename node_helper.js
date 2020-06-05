/********************************
* node_helper for MMM_NewPIR v3 *
* BuGsounet                     *
********************************/

const NodeHelper = require('node_helper')
const exec = require('child_process').exec
const process = require('process')
const Pir = require("@bugsounet/pir")

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
    this.pirConf = {
      "gpio": 21
    }
  },

  initialize: function() {
    console.log("[NewPIR] Initialize...")
    var debug = (this.conf.debug) ? this.conf.debug : false
    if (debug == true) log = _log
    if (this.conf.display) {
      this.wantedDisplay(true)
      this.sendSocketNotification("PRESENCE", true)
    }
    log("Sensor Active: pin " + this.conf.pin)
    this.pirConf.gpio = this.conf.pin
    this.running = true

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
        this.pirDetect()
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
    }
  },

  pirDetect: function() {
    this.pir = new Pir(this.pirConf, this.pirCallback, this.conf.debug)
    this.pir.start()
  },

  pirCallback: function (status, err) {
    if (status == "PIR_DETECTED") {
      log("Presence detected !")
      this.sendSocketNotification("RESET_COUNTER")
      this.wantedDisplay(true)
      if (!this.running) {
        this.sendSocketNotification("PRESENCE", true)
        this.running = true
      }
    }
    if (err) console.log("[NewPIR] " + err)
  },

  wantedDisplay: function(wanted) {
    exec("/usr/bin/vcgencmd display_power", (err, stdout, stderr)=> {
      if (err == null) {
        var displaySh = stdout.trim()
        var actual = Boolean(Number(displaySh.substr(displaySh.length -1)))
        this.resultDisplay(actual,wanted)
      }
      else console.log("[NewPIR] Display: " + err)
    })
  },

  resultDisplay: function(actual,wanted) {
    log("Display -- Actual: " + actual + " - Wanted: " + wanted)
    if (actual && !wanted) this.setDisplay(false)
    if (!actual && wanted) this.setDisplay(true)
  },

  setDisplay: function(set) {
    if (set)  exec("/usr/bin/vcgencmd display_power 1")
    else exec("/usr/bin/vcgencmd display_power 0")
    log("Display " + (set ? "ON." : "OFF."))
  }
});
