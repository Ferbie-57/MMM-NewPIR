const NodeHelper = require('node_helper');
const exec = require('child_process').exec;
const fs = require('fs');
const Gpio = require('onoff').Gpio;

module.exports = NodeHelper.create({

	running: false,

    	socketNotificationReceived: function (notification, payload) {
        	const self = this;
		if (notification === "ASSIST") { // Be back for Assistant
			self.running = true;
                	self.sendSocketNotification("USER_PRESENCE", true); // Presence Force
                	self.sendSocketNotification("NEWPIR_SHOWING"); // Module diplay Force
                	if (self.config.turnOffDisplay) {
				exec("/usr/bin/vcgencmd display_power 1");
                	}
                	console.log("[NewPIR] Assistant Detected")
        	};

        	if (notification === "CONFIG") {
	    		this.config = payload;
            		if (!self.running) { // Init for First Start
           			self.running = true;
        			self.sendSocketNotification("USER_PRESENCE", true); // Presence Force
				if (self.config.turnOffDisplay) {
					exec("/usr/bin/vcgencmd display_power 1"); //force HDMI ON
				}
       	       	 		console.log("[NewPIR] Init Display")
            		};

            		this.pir = new Gpio(this.config.sensorPin, 'in', 'both');

            		this.pir.watch(function (err, value) {
            			if (value == 1) {
                    			//self.sendSocketNotification("USER_PRESENCE", true);
                			if (!self.running) {
                        			self.running = true;
                        			if (self.config.turnOffDisplay) {
                            				exec("/usr/bin/vcgencmd display_power 1");
			    				console.log("[NewPIR] Display ON")
                        			}
						if (self.config.EnergyMode) {
							self.sendSocketNotification("NEWPIR_SHOWING");
							console.log("[NewPIR] Show ALL Modules")
						}
						self.sendSocketNotification("USER_PRESENCE", true);
                    			}
                		}
            		});

        	} else if (notification === "TIMER_EXPIRED") {
        		self.running = false;
			self.sendSocketNotification("USER_PRESENCE", false);
			if (self.config.EnergyMode) {
       				self.sendSocketNotification("NEWPIR_HIDING");
       				console.log("[NewPIR] Hide ALL Modules")
			}

			if (self.config.turnOffDisplay) {
				setTimeout(()=>{ // timer for display off after hiding
					exec("/usr/bin/vcgencmd display_power 0")
				},2000);
				console.log("[NewPIR] Display OFF")
			}
		}
   	},
});


