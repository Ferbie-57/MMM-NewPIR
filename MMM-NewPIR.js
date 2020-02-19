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
      debug: false
    },

    start: function () {
      this.counter = 0
      this.interval = null
      console.log("[NewPIR] is now started")
      this.config = this.configAssignment({}, this.defaults, this.config)
      this.helperConfig = {
          "sensor" : this.config.useSensor,
          "pin": this.config.sensorPin,
          "reverse": this.config.reverseValue,
          "display": this.config.turnOffDisplay,
          "governor": this.config.governor,
          "debug": this.config.debug
      }
      this.sendSocketNotification("INIT", this.helperConfig)
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
          this.resetCountdown()
          this.sendSocketNotification("START")
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
        var counter = document.querySelector("#NEWPIR.counter")
        counter.textContent = new Date(self.counter).toUTCString().match(/\d{2}:\d{2}:\d{2}/)[0]

        if (self.counter <= 0) {
          self.sendSocketNotification("TIMER_EXPIRED")
          clearInterval(self.interval)
        }
      }, 1000)
    },

    ForceExpire: function(){
      clearInterval(this.interval)
      var counter = document.querySelector("#NEWPIR.counter")
      counter.textContent = "00:00:00"
      this.counter = 0
      this.sendSocketNotification("TIMER_EXPIRED")
    },

    Hiding: function() {
      var self = this
      MM.getModules().enumerate(function(module) {
        module.hide(1000, {lockString: self.identifier})
      })
      console.log("[NewPIR] Hide All modules.")
    },

    Showing: function(payload) {
      var self = this
      MM.getModules().enumerate(function(module) {
        module.show(1000, {lockString: self.identifier})
      })
      console.log("[NewPIR] Show All modules.")
    },

    getDom: function () {
      var wrapper = document.createElement("div")
      wrapper.id = "NEWPIR"
      if (!this.config.debug) wrapper.className = "hidden"
      wrapper.classList.add("counter")
      wrapper.textContent = "--:--:--"
      return wrapper
    },

    getStyles: function () {
      return ["MMM-NewPIR.css"]
    },

    getScripts: function () {
      return ["moment.js"]
    },

    configAssignment : function (result) {
    var stack = Array.prototype.slice.call(arguments, 1)
    var item
    var key
    while (stack.length) {
      item = stack.shift()
      for (key in item) {
        if (item.hasOwnProperty(key)) {
          if (typeof result[key] === "object" && result[key] && Object.prototype.toString.call(result[key]) !== "[object Array]" ) {
              if (typeof item[key] === "object" && item[key] !== null) {
                  result[key] = this.configAssignment({}, result[key], item[key])
              } else {
                result[key] = item[key]
              }
          } else {
            result[key] = item[key]
          }
        }
      }
    }
    return result
  },

});
