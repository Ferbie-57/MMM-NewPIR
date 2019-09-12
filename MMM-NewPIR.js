Module.register("MMM-NewPIR", {

    defaults: {
        sensorPin: 21,
        delay: 15 * 1000,
        turnOffDisplay: true,
	EconomyMode: true,
	UseHotword: true,
	HotWord: "HOTWORD_PAUSE",
	HotWordModules: [ "MMM-AssistantMk2" , "MMM-JarvisFace" ],
	Governor : "",
	debug: false
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

    resetCountdown: function () {
        var self = this;
        clearInterval(self.interval);
	self.counter = this.config.delay;
	//for debug
        //self.updateDom();

        self.interval = setInterval(function () {
            self.counter -= 1000;
            if (self.counter <= 0) {
                self.sendSocketNotification('TIMER_EXPIRED');
		clearInterval(self.interval);
            }
	    //for debug
	    //self.updateDom();
        }, 1000);
    },

    Hiding: function() {
            MM.getModules().exceptModule(this).enumerate(function(module) {
                module.hide(1000, null, {lockString:"NewPIR"})
            });
	    this.sendNotification('NEWPIR_HIDING', true);
            console.log("[NewPIR] Hide All modules");
    },

    Showing: function(payload) {
            MM.getModules().exceptModule(this).enumerate(function(module) {
               	module.show(1000, null, {force: true})
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


// For debug
/*

    getDom: function () {
        var self = this;

        var html = document.createElement("div");
        html.className = "wrapper";

        if (typeof self.counter !== "undefined") {
        	var time = document.createElement("div");
                time.className = "time";
		if (this.config.debug) {
                	time.innerText = new Date(this.counter).toUTCString().match(/\d{2}:\d{2}:\d{2}/)[0];
		}
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
*/

});
