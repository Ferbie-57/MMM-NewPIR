/******************
*  MMM_NewPIR v2  *
*  Bugsounet      *
******************/

Module.register("MMM-NewPIR", {
    defaults: {
      sensorPin: 21,
      delay: 60 * 1000,
      turnOffDisplay: true,
      EconomyMode: true,
      Governor: "",
      debug: false
    },

    start: function () {
      this.counter = 0
      this.interval = null
      console.log("[NewPIR] is now started")
      this.config = this.configAssignment({}, this.defaults, this.config)
      this.sendSocketNotification("INIT", this.config)
    },

    socketNotificationReceived: function (notification, payload) {
      switch(notification) {
        case "RESET_COUNTER":
          this.resetCountdown()
          break
        case "USER_PRESENCE":
          this.sendNotification("USER_PRESENCE", payload)
          if (this.config.EconomyMode) {
            if (payload) this.Showing()
            else this.Hiding()
          }
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
          } else {
	    clearInterval(this.interval)
            var counter = document.querySelector("#NEWPIR.counter")
            counter.textContent = "00:00:00"
            this.counter = 0
            this.sendSocketNotification("TIMER_EXPIRED")
          }
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

    Hiding: function() {
      var self = this
      MM.getModules().enumerate(function(module) {
        module.hide(1000, {lockString: self.identifier})
      })
      this.sendNotification("NEWPIR_HIDING")
      console.log("[NewPIR] Hide All modules")
    },

    Showing: function(payload) {
      var self = this
      MM.getModules().enumerate(function(module) {
        module.show(1000, {lockString: self.identifier})
      })
      this.sendNotification("NEWPIR_SHOWING")
      console.log("[NewPIR] Show All modules")
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
