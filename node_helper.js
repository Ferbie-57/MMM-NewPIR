/********************************
* node_helper for MMM_NewPIR v3 *
* BuGsounet                     *
********************************/

const NodeHelper = require('node_helper')
const Screen = require("@bugsounet/screen")
const Pir = require("@bugsounet/pir")
const Governor = require("@bugsounet/governor")

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
  },

  initialize: function() {
    console.log("[NewPIR] Initialize...")
    var debug = (this.config.debug) ? this.config.debug : false
    if (debug == true) log = _log

    this.NewPIR()
    console.log("[NewPIR] Initialize Complete Version:", require('./package.json').version)
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "INIT":
        this.config = payload
        this.initialize()
        break
      case "WAKEUP":
        this.screen.wakeup()
        break
      case "FORCE_END":
        this.screen.forceEnd()
        break
      case "LOCK":
        this.screen.lock()
        break
      case "UNLOCK":
        this.screen.unlock()
        break
    }
  },

  NewPIR: function () {
    var callbacks= {
      "sendSocketNotification": (noti, params) => {
        this.sendSocketNotification(noti, params)
        log("Callback Notification:", noti,params)
      },
      "screen": (param) => {
        if (this.screen && param == "WAKEUP") this.screen.wakeup()
      },
      "pir": (param) => {
        if (this.screen && this.pir && param == "PIR_DETECTED") this.screen.wakeup()
      },
      "governor": (param) => {
        if (this.governor && param == "GOVERNOR_SLEEPING") this.governor.sleeping()
        if (this.governor && param == "GOVERNOR_WORKING") this.governor.working()
      },
    }
    this.screen = new Screen(this.config.screen, callbacks.sendSocketNotification, this.config.debug, callbacks.sendSocketNotification, callbacks.governor)
    this.screen.activate()

    if (this.config.pir.usePir) {
      this.pir = new Pir(this.config.pir, callbacks.pir, this.config.debug)
      this.pir.start()
    }
    if (this.config.governor.useGovernor) {
      this.governor = new Governor(this.config.governor, null, this.config.debug)
      this.governor.start()
    }
  }
});
