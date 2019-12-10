Module.register("MMM-NewPIR", {

    defaults: {
	useSensor: true,
        sensorPin: 21,
        delay: 15 * 1000,
        turnOffDisplay: true,
	EconomyMode: true,
	Governor: "",
	debug: false
    },

    start: function () {
        Log.log("[NewPIR] is started");
	this.sendSocketNotification("START", this.config);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "USER_PRESENCE") {
		if (payload) this.resetCountdown();
		this.sendNotification('USER_PRESENCE', payload);
        }
	if ((this.config.EconomyMode) && (notification === "NEWPIR_HIDING") {
		this.Hiding();
	}
	if ((this.config.EconomyMode) && (notification === "NEWPIR_SHOWING") {
		this.Showing();
	}
    },

    notificationReceived: function (notification, payload) {

        if (notification === 'DOM_OBJECTS_CREATED') {
            //DOM creation complete, let's start the module
            	this.resetCountdown();
        }
	if (notification === "USER_PRESENCE") {
                if (payload) {
                        this.resetCountdown();
			this.sendSocketNotification("WAKEUP");
		} else {
			this.sendSocketNotification("TIMER_EXPIRED");
		}
	}
    },

    resetCountdown: function () {
        var self = this;
        clearInterval(self.interval);
	self.counter = this.config.delay;
	//for debug
        self.updateDom();

        self.interval = setInterval(function () {
            self.counter -= 1000;
            if (self.counter <= 0) {
                self.sendSocketNotification('TIMER_EXPIRED');
		clearInterval(self.interval);
            }
	    //for debug
	    self.updateDom();
        }, 1000);
    },

    Hiding: function() {
	    var self = this;
            MM.getModules().exceptModule(this).enumerate(function(module) {
                module.hide(1000, null, {lockString: self.identifier})
            });
            console.log("[NewPIR] Hide All modules");
    },

    Showing: function(payload) {
	    var self = this;
            MM.getModules().exceptModule(this).enumerate(function(module) {
               	module.show(1000, null, {lockString: self.identifier})
            });
            console.log("[NewPIR] Show All modules");
    },

// For debug


    getDom: function () {
        var self = this;

        var html = document.createElement("div");
	html.id = "#NEWPIR";
	if (this.config.debug) m.classList.remove("inactive")
	else m.classList.add("inactive")
        //html.className = "wrapper";

        if (typeof self.counter !== "undefined") {
        	var time = document.createElement("div");
                time.className = "time";
		time.innerText = new Date(this.counter).toUTCString().match(/\d{2}:\d{2}:\d{2}/)[0];
                html.appendChild(time);
        }

        return html;
    },

    getStyles: function () {
        return ["mmm-newpir.css"];
    },

    getScripts: function () {
        return ["moment.js"];
    },

});
