Module.register("MMM-NewPIR", {

    defaults: {
	useSensor: true,
        sensorPin: 21,
        delay: 15 * 1000,
        turnOffDisplay: true,
	EconomyMode: true,
	UseHotword: true,
	Use_HotWordModules: false,
	HotWordModules: [ "MMM-AssistantMk2" , "MMM-JarvisFace" ],
	Governor: "",
	Use_Page: true,
	Page_Jarvis: 4,
	Page_Showing: 0,
	Page_Hiding: 5,
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
	if ((this.config.EconomyMode) && (notification === "NEWPIR_HIDING") && (!this.config.Use_Page)) {
		this.Hiding();
	}
	if ((this.config.EconomyMode) && (notification === "NEWPIR_HIDING") && (this.config.Use_Page)) {
		this.sendNotification("PAGE_CHANGED", this.config.Page_Hiding);
	}
	if ((this.config.EconomyMode) && (notification === "NEWPIR_SHOWING") && (!this.config.Use_Page)) {
		this.Showing();
	}
	if ((this.config.EconomyMode) && (notification === "NEWPIR_SHOWING") && (this.config.Use_Page)) {
		this.sendNotification("PAGE_CHANGED", this.config.Page_Showing);
	}

    },

    notificationReceived: function (notification, payload) {

        if (notification === 'DOM_OBJECTS_CREATED') {
            //DOM creation complete, let's start the module
            	this.resetCountdown();
        }
	if (notification === "USER_PRESENCE") {
                if (payload == true) {
                        this.resetCountdown();
			this.sendSocketNotification("WAKEUP");
		} else {
			this.sendSocketNotification("TIMER_EXPIRED");
		}
	}
	if ((this.config.UseHotword) && (notification === 'HOTWORD_PAUSE')) {
	    	this.sendSocketNotification("ASSIST");
	    	console.log("[NewPIR] HotWord Detected !");
		if ((this.config.Use_HotWordModules) && (!this.config.Use_Page)) {
			this.Mini_module();
		}
		if ((!this.config.Use_HotWordModules) && (this.config.Use_Page)) {
			 this.sendNotification("PAGE_CHANGED", this.config.Page_Jarvis);
		}
	}
	if ((this.config.UseHotword) && (notification === 'HOTWORD_RESUME') && (this.config.Use_HotWordModules) && (!this.config.Use_Page)) {
	    	this.Showing();
	}
        if ((this.config.UseHotword) && (notification === 'HOTWORD_RESUME') && (!this.config.Use_HotWordModules) && (this.config.Use_Page)) {
		this.sendNotification("PAGE_CHANGED", this.config.Page_Showing);
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
	    this.sendNotification('NEWPIR_HIDING', true);
            console.log("[NewPIR] Hide All modules");
    },

    Showing: function(payload) {
	    var self = this;
            MM.getModules().exceptModule(this).enumerate(function(module) {
               	module.show(1000, null, {lockString: self.identifier})
            });
	    this.sendNotification('NEWPIR_SHOWING', true);
            console.log("[NewPIR] Show All modules");
    },

    Mini_module: function() {
		var self = this;
		var mod = this.config.HotWordModules
		MM.getModules().exceptModule(this).enumerate(function(module) {
               		module.hide(15, null, {lockString: self.identifier})
            	});

		for (var i = 0; i < mod.length; i++) {
			MM.getModules().enumerate((m) => {
				if ( mod[i] == m.name ) {
					m.show(15, {lockString: self.identifier});
					console.log("[NewPIR] Display Mini_module for ASSISTANT : " + mod[i]);
				}
			});
		}
    },


// For debug


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


});
