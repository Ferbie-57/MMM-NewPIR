Module.register("MMM-NewPIR", {

    defaults: {
        sensorPin: 21,
        delay: 15 * 1000,
        turnOffDisplay: true,
	EnergyMode: true
    },

    start: function () {
        Log.log("[NewPIR] is started");
	this.sendSocketNotification("CONFIG", this.config);
    },

    socketNotificationReceived: function (notification, payload) {

        if (notification === "USER_PRESENCE") {
		if (payload == true) {
            		this.resetCountdown();
		}
		this.sendNotification('USER_PRESENCE', payload);
        }
	if (notification === "NEWPIR_HIDING") {
		this.Hiding();
	}
	if (notification === "NEWPIR_SHOWING") {
		this.Showing();
	}

    },

    notificationReceived: function (notification, payload) {

        if (notification === 'DOM_OBJECTS_CREATED') {
            //DOM creation complete, let's start the module
            this.resetCountdown();
        }
	if (notification === 'HOTWORD_PAUSE') { // for MMM-HOTWORD
	    this.sendSocketNotification("ASSIST");
	}
    },

    resetDefaults: function () {
        this.counter = this.config.delay;
    },

    resetCountdown: function () {
        var self = this;
        clearInterval(self.interval);
        if (self.customCounter != null) {
            self.counter = this.customCounter;
        } else {
            self.resetDefaults();
        }

        self.interval = setInterval(function () {
            self.counter -= 1000;
            if (self.counter <= 0) {
                self.sendSocketNotification('TIMER_EXPIRED');
		clearInterval(self.interval);
            }
        }, 1000);
    },

    Hiding: function() {
            MM.getModules().exceptModule(this).enumerate(function(module) {
                module.hide(2000, null, {lockString:"NewPIR"})
            });
	    this.sendNotification('NEWPIR_HIDING', true);
            console.log("[NewPIR] Hide All modules");
    },

    Showing: function() {
            MM.getModules().exceptModule(this).enumerate(function(module) {
                module.show(2000, null, {lockString:"NewPIR"})
            });
	    this.sendNotification('NEWPIR_SHOWING', true);
            console.log("[NewPIR] Show All modules");
    },


});
