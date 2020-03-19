/******************
*  MMM_NewPIR v2  *
*  Bugsounet      *
******************/

Module.register("MMM-NewPIR", {
    defaults: {
      useSensor: true,
      sensorPin: 21,
      reverseValue: false,
      delay: 2* 60 * 1000,
      turnOffDisplay: true,
      ecoMode: true,
      governor: "",
      text: "Auto Turn Off Screen:",
      counter: true,
      debug: false,
      force: false
    },

    start: function () {
      mylog_ = function() {
        var context = "[NewPIR]"
        return Function.prototype.bind.call(console.log, console, context)
      }()

      mylog = function() {
        //do nothing
      }
      this.AMk2 = false
      this.counter = 0
      this.interval = null
      this.config = Object.assign({}, this.default, this.config)
      this.helperConfig = {
          "sensor" : this.config.useSensor,
          "pin": this.config.sensorPin,
          "reverse": this.config.reverseValue,
          "display": this.config.turnOffDisplay,
          "governor": this.config.governor,
          "debug": this.config.debug
      }
      if (this.config.debug) mylog = mylog_
      if (!this.checkThis()) {
        this.sendSocketNotification("INIT", this.helperConfig)
        mylog("is now started!")
      }
      else {
        mylog("desactived")
        this.sendSocketNotification("WARNING")
      }
    },

    socketNotificationReceived: function (notification, payload) {
      switch(notification) {
        case "RESET_COUNTER":
          this.resetCountdown()
          break
        case "PRESENCE":
          if (this.config.ecoMode) {
            if (payload) this.Showing()
            else this.Hiding()
          }
          this.sendNotification("USER_PRESENCE", payload)
          break
      }
    },

    notificationReceived: function (notification, payload) {
      switch(notification) {
        case "DOM_OBJECTS_CREATED":
          if (!this.AMk2) {
            this.resetCountdown()
            this.sendSocketNotification("START")
          }
          break
        case "USER_PRESENCE":
          if (payload == true) {
            this.resetCountdown()
            this.sendSocketNotification("WAKEUP")
          } else this.ForceExpire()
          break
        default :
          break
      }
    },

    resetCountdown: function () {
      var self = this
      clearInterval(this.interval)
      this.counter = this.config.delay

      this.interval = setInterval(function () {
        self.counter -= 1000
        var counter = document.getElementById("NEWPIR_COUNTER")
        counter.textContent = new Date(self.counter).toUTCString().match(/\d{2}:\d{2}:\d{2}/)[0]

        if (self.counter <= 0) {
          self.sendSocketNotification("TIMER_EXPIRED")
          clearInterval(self.interval)
        }
      }, 1000)
    },

    ForceExpire: function(){
      clearInterval(this.interval)
      var counter = document.getElementById("NEWPIR_COUNTER")
      counter.textContent = "00:00:00"
      this.counter = 0
      this.sendSocketNotification("TIMER_EXPIRED")
    },

    Hiding: function() {
      var self = this
      MM.getModules().enumerate(function(module) {
        module.hide(1000, {lockString: self.identifier})
      })
      mylog("Hide All modules.")
    },

    Showing: function(payload) {
      var self = this
      MM.getModules().enumerate(function(module) {
        module.show(1000, {lockString: self.identifier})
      })
      mylog("Show All modules.")
    },

    getDom: function () {
      var dom = document.createElement("div")
      dom.id = "NEWPIR"
      if (!this.config.counter) dom.className = "hidden"

      var t = document.createElement("div")
      t.id = "NEWPIR_TEXT"
      t.textContent = this.config.text
      dom.appendChild(t)

      var c = document.createElement("div")
      c.id = "NEWPIR_COUNTER"
      c.classList.add("counter")
      c.textContent = "--:--:--"
      dom.appendChild(c)

      return dom
    },

    getStyles: function () {
      return ["MMM-NewPIR.css"]
    },

    getScripts: function () {
      return ["moment.js"]
    },

    checkThis: function() {
      for (let [item, value] of Object.entries(config.modules)) {
        if (value.module == "MMM-AssistantMk2") {
          if (this.config.force) {
            this.AMk2 = false
            return false
          } else this.AMk2 = true
          return true
        }
      }
    }
});
