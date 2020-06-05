/******************
*  MMM_NewPIR v3  *
*  Bugsounet      *
******************/

Module.register("MMM-NewPIR", {
    defaults: {
      sensorPin: 21,
      delay: 2* 60 * 1000,
      turnOffDisplay: true,
      ecoMode: true,
      text: "Auto Turn Off Screen:",
      counter: true,
      debug: false,
    },

    start: function () {
      mylog_ = function() {
        var context = "[NewPIR]"
        return Function.prototype.bind.call(console.log, console, context)
      }()

      mylog = function() {
        //do nothing
      }
      this.counter = 0
      this.interval = null
      this.config = Object.assign({}, this.defaults, this.config)
      this.helperConfig = {
          "pin": this.config.sensorPin,
          "display": this.config.turnOffDisplay,
          "debug": this.config.debug
      }
      if (this.config.debug) mylog = mylog_
      this.sendSocketNotification("INIT", this.helperConfig)
      mylog("is now started!")
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
      clearInterval(this.interval)
      this.interval = null
      this.counter = this.config.delay

      this.interval = setInterval( ()=> {
        this.counter -= 1000
        var counter = document.getElementById("NEWPIR_COUNTER")
        counter.textContent = moment(new Date(this.counter)).format("mm:ss")

        if (this.counter <= 0) {
          this.sendSocketNotification("TIMER_EXPIRED")
          clearInterval(this.interval)
          this.interval = null
        }
      }, 1000)
    },

    ForceExpire: function(){
      clearInterval(this.interval)
      var counter = document.getElementById("NEWPIR_COUNTER")
      counter.textContent = "00:00"
      this.counter = 0
      this.sendSocketNotification("TIMER_EXPIRED")
    },

    Hiding: function() {
      MM.getModules().enumerate( (module)=> {
        module.hide(1000, {lockString: this.identifier})
      })
      mylog("Hide All modules.")
    },

    Showing: function(payload) {
      MM.getModules().enumerate( (module)=> {
        module.show(1000, {lockString: this.identifier})
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
      c.textContent = "--:--"
      dom.appendChild(c)

      return dom
    },

    getStyles: function () {
      return ["MMM-NewPIR.css"]
    },

    getScripts: function () {
      return ["moment.js"]
    },
});
