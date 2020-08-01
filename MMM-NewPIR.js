/******************
*  MMM_NewPIR v3  *
*  Bugsounet      *
******************/

Module.register("MMM-NewPIR", {
    defaults: {
      debug: false,
      screen: {
        delay: 2 * 60 * 1000,
        turnOffDisplay: true,
        ecoMode: true,
        displayCounter: true,
        text: "Auto Turn Off Screen:",
        displayBar: true,
        displayStyle: "Text",
        governorSleeping: false,
        rpi4: false
      },
      pir: {
        usePir: true,
        gpio: 21,
        reverseValue: false
      },
      governor: {
        useGovernor: false,
        sleeping: "powersave",
        working: "ondemand"
      }
    },

    start: function () {
      mylog_ = function() {
        var context = "[NewPIR]"
        return Function.prototype.bind.call(console.log, console, context)
      }()

      mylog = function() {
        //do nothing
      }

      this.config = configMerge({}, this.defaults, this.config)
      if (this.config.debug) mylog = mylog_
      this.sendSocketNotification("INIT", this.config)
      mylog("is now started!")
    },

    socketNotificationReceived: function (notification, payload) {
      switch(notification) {
      case "SCREEN_SHOWING":
        this.screenShowing()
        break
      case "SCREEN_HIDING":
        this.screenHiding()
        break
      case "SCREEN_TIMER":
        if (this.config.screen.displayStyle == "Text") {
          let counter = document.getElementById("NEWPIR_SCREEN_COUNTER")
          counter.textContent = payload
        }
        break
      case "SCREEN_BAR":
        if (this.config.screen.displayStyle == "Bar") {
          let bar = document.getElementById("NEWPIR_SCREEN_BAR")
          bar.value= this.config.screen.delay - payload
        }
        else if (this.config.screen.displayStyle != "Text") {
          let value = (100 - ((payload * 100) / this.config.screen.delay))/100
          let timeOut = moment(new Date(this.config.screen.delay-payload)).format("mm:ss")
          this.bar.animate(value, {
            step: (state, bar) => {
              bar.path.setAttribute('stroke', state.color)
              bar.setText(this.config.screen.displayCounter ? timeOut : "")
              bar.text.style.color = state.color
            }
          })
        }
        break
      case "SCREEN_PRESENCE":
        this.sendNotification("USER_PRESENCE", payload ? true : false)
        break
      }
    },

    notificationReceived: function (notification, payload) {
      switch(notification) {
        case "DOM_OBJECTS_CREATED":
          this.prepareBar()
          break
        case "USER_PRESENCE":
          if (payload == true) {
            this.sendSocketNotification("WAKEUP")
          }
          else this.sendSocketNotification("FORCE_END")
          break
        case "SCREEN_END":
          this.sendSocketNotification("FORCE_END")
          break
        case "SCREEN_WAKEUP":
          this.sendSocketNotification("WAKEUP")
          break
        case "SCREEN_LOCK":
          this.sendSocketNotification("LOCK")
          break
        case "SCREEN_UNLOCK":
          this.sendSocketNotification("UNLOCK")
          break
      }
    },

    getDom: function () {
      var dom = document.createElement("div")
      dom.id = "NEWPIR"

      if (this.config.screen.displayCounter || this.config.screen.displayBar) {
        /** Screen TimeOut Text **/
        var screen = document.createElement("div")
        screen.id = "NEWPIR_SCREEN"
        if (this.config.screen.displayStyle != "Text") screen.className = "hidden"
        var screenText = document.createElement("div")
        screenText.id = "NEWPIR_SCREEN_TEXT"
        screenText.textContent = this.config.screen.text
        screen.appendChild(screenText)
        var screenCounter = document.createElement("div")
        screenCounter.id = "NEWPIR_SCREEN_COUNTER"
        screenCounter.classList.add("counter")
        screenCounter.textContent = "--:--"
        screen.appendChild(screenCounter)

        /** Screen TimeOut Bar **/
        var bar = document.createElement("div")
        bar.id = "NEWPIR_BAR"
        if ((this.config.screen.displayStyle == "Text") || !this.config.screen.displayBar) bar.className = "hidden"
        var screenBar = document.createElement(this.config.screen.displayStyle == "Bar" ? "meter" : "div")
        screenBar.id = "NEWPIR_SCREEN_BAR"
        screenBar.classList.add(this.config.screen.displayStyle)
        if (this.config.screen.displayStyle == "Bar") {
          screenBar.value = 0
          screenBar.max= this.config.screen.delay
        }
        bar.appendChild(screenBar)
        dom.appendChild(screen)
        dom.appendChild(bar)
      }
      return dom
    },

    getStyles: function () {
      return ["MMM-NewPIR.css"]
    },

    getScripts: function () {
      return [
        "/modules/MMM-NewPIR/scripts/progressbar.js",
        "/modules/MMM-NewPIR/scripts/configMerge.js"
      ]
    },

    prepareBar: function () {
      /** Prepare TimeOut Bar **/
      if ((this.config.screen.displayStyle == "Text") || (this.config.screen.displayStyle == "Bar") || (!this.config.screen.displayBar)) return
      this.bar = new ProgressBar[this.config.screen.displayStyle](document.getElementById('NEWPIR_SCREEN_BAR'), {
        strokeWidth: this.config.screen.displayStyle == "Line" ? 2 : 5,
        trailColor: '#1B1B1B',
        trailWidth: 1,
        easing: 'easeInOut',
        duration: 500,
        svgStyle: null,
        from: {color: '#FF0000'},
        to: {color: '#00FF00'},
        text: {
          style: {
            position: 'absolute',
            left: '50%',
            top: this.config.screen.displayStyle == "Line" ? "0" : "50%",
            padding: 0,
            margin: 0,
            transform: {
                prefix: true,
                value: 'translate(-50%, -50%)'
            }
          }
        }
      })
    },

    screenShowing: function() {
      MM.getModules().enumerate((module)=> {
        module.show(1000, {lockString: "NEWPIR_LOCK"})
      })
      mylog("Show All modules.")
    },

    screenHiding: function() {
      MM.getModules().enumerate((module)=> {
        module.hide(1000, {lockString: "NEWPIR_LOCK"})
      })
      mylog("Hide All modules.")
    }
});
