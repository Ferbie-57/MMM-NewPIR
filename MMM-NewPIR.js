Module.register("MMM-NewPIR", {

    defaults: {
        sensorPin: 21,
        delay: 15 * 1000,
        turnOffDisplay: true,
	EconomyMode: true,
	UseHotword: true,
	HotWord: "HOTWORD_PAUSE",
	HotWordModules: [ "MMM-AssistantMk2" , "MMM-JarvisFace" ]
    },

    start: function () {
        Log.log("[NewPIR] is started");
	this.sendSocketNotification("START", this.config);
    },

    socketNotificationReceived: function (notification, payload) {

        if (notification === "USER_PRESENCE") {
		if (payload == true) {
            		this.resetCountdown();
		}
		this.sendNotification('USER_PRESENCE', payload);
        }
	if ((this.config.EconomyMode) && (notification === "NEWPIR_HIDING")) {
		this.Hiding();
	}
	if ((this.config.EconomyMode) && (notification === "NEWPIR_SHOWING")) {
		this.Showing();
	}

    },

    notificationReceived: function (notification, payload) {

        if (notification === 'DOM_OBJECTS_CREATED') {
            //DOM creation complete, let's start the module
            	this.resetCountdown();
        }
	if ((this.config.UseHotword) && (notification === this.config.HotWord)) {
	    	this.sendSocketNotification("ASSIST");
	    	console.log("[NewPIR] HotWord Detected !");
	    	this.Mini_module();
	}
	if ((this.config.UseHotword) && (notification === 'HOTWORD_RESUME')) {
	    	this.Showing();
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

    Showing: function(payload) {
            MM.getModules().exceptModule(this).enumerate(function(module) {
               	module.show(2000, null, {force: true})
            });
	    this.sendNotification('NEWPIR_SHOWING', true);
            console.log("[NewPIR] Show All modules");
    },

    Mini_module: function() {
		var mod = this.config.HotWordModules
		MM.getModules().exceptModule(this).enumerate(function(module) {
               		module.hide(15, null, {lockString:"NewPIR"})
            	});

		for (var i = 0; i < mod.length; i++) {
			MM.getModules().enumerate((m) => {
				if ( mod[i] == m.name ) {
					m.show(15, {force :  true});
					console.log("[NewPIR] Display Mini_module for ASSISTANT : " + mod[i]);
				}
			});
		}
  },

});
