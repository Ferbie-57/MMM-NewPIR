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
        moment.locale(config.language);
    },

    socketNotificationReceived: function (notification, payload) {

        if (notification === "USER_PRESENCE") {
		if (
            	this.resetCountdown();
		this.sendNotification('USER_PRESENCE', true);
        }
	if (notification === "NEWPIR_HIDING") {
		this.Hiding();
		this.sendNotification('NEWPIR_HIDING', true);
	}
	if (notification === "NEWPIR_SHOWING") {
		this.Showing();
		this.sendNotification('NEWPIR_SHOWING', true);
	}

    },

    notificationReceived: function (notification, payload) {

        if (notification === 'DOM_OBJECTS_CREATED') {
            //DOM creation complete, let's start the module
            this.resetCountdown();
        }
	if (notification === 'HOTWORD_PAUSE') {
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
            var self = this;
            MM.getModules().exceptModule(this).enumerate(function(module) {
                module.hide(2000, null, {lockString:"NewPIR"})
            });
            console.log("[NewPIR] Hide All modules");
    },

      Showing: function() {
            var self = this;
            MM.getModules().exceptModule(this).enumerate(function(module) {
                module.show(2000, null, {lockString:"NewPIR"})
            });
            console.log("[NewPIR] Show All modules");
    },


});
