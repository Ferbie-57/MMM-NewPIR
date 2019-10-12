const NodeHelper = require('node_helper');
const exec = require('child_process').exec;
const fs = require('fs');
const Gpio = require('onoff').Gpio;

module.exports = NodeHelper.create({

	running: false,

    	socketNotificationReceived: function (notification, payload) {
        	const self = this;
		if (notification === "WAKEUP") {
			self.running = true;
			if (self.config.turnOffDisplay) {
				exec("/usr/bin/vcgencmd display_power 1");
			}
			console.log("[NewPIR] Wake Up Detected")
		}

		if (notification === "ASSIST") { // Be back For Assistant
			self.running = true;
                	self.sendSocketNotification("USER_PRESENCE", true); // Presence Force
                	if (self.config.turnOffDisplay) {
				exec("/usr/bin/vcgencmd display_power 1"); // and Force HDMI power on
                	}
                	console.log("[NewPIR] Wake Up Detected")
        	};

        	if (notification === "START") {
	    		this.config = payload;
            		if (!self.running) { // Init for First Start
           			self.running = true;
        			self.sendSocketNotification("USER_PRESENCE", true); // Presence Force
				exec("/usr/bin/vcgencmd display_power 1"); //force HDMI ON
       	       	 		console.log("[NewPIR] Init Display...")
				// Init Display is ok, Let's Init Governor now !
				// Governor : conservative ondemand userspace powersave performance
				if ((this.config.Governor == "conservative") || (this.config.Governor == "ondemand") || (this.config.Governor == "userspace") || (this.config.Governor == "powersave") || (this.config.Governor == "performance")) {
					exec("echo " + this.config.Governor + " | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor");
					console.log("[NewPIR] Init Governor : " +  this.config.Governor);
				} else {
					if(this.config.Governor == "")
						console.log("[NewPIR] Init Governor : Desactived.");
					else
						console.log("[NewPIR] Init Governor : Error ! Unknow Governor.");
				}
            		};
			if (this.config.useSensor) {
				console.log("[New-Pir] Sensor Active " + this.config.useSensor)
				// Gpio sensor test pin
            			this.pir = new Gpio(this.config.sensorPin, 'in', 'both');
            			this.pir.watch(function (err, value) {
					if (self.config.debug) {
						console.log("[New-Pir] Sensor read value : " + value)
					}
            				if (value == 1) {
						// Check HDMI power state
						self.checkDisplay();
						// send user presence for reset counter
						self.sendSocketNotification("USER_PRESENCE", true);
						setTimeout(()=>{ // timeout For Result display !?!?
							if (self.config.debug) console.log("[NewPIR] DisplayResult : " + this.DisplayResult)
							if (this.DisplayResult == "0" && self.config.turnOffDisplay) {
								exec("/usr/bin/vcgencmd display_power 1");
								console.log("[NewPIR] Display ON")
							}
						}, 600);
                				if (!self.running) {
                        				self.running = true;
							self.sendSocketNotification("NEWPIR_SHOWING");
                    				}
                			}
            			});
			}

        	} else if (notification === "TIMER_EXPIRED") {
        		self.running = false;
			self.sendSocketNotification("USER_PRESENCE", false);
			self.sendSocketNotification("NEWPIR_HIDING");
			if (self.config.turnOffDisplay) {
				exec("/usr/bin/vcgencmd display_power 0");
				console.log("[NewPIR] Display OFF")
			}
		}
   	},


	// checkDisplay : DisplayResult return => 0 when HDMI power Off,  1 when HDMI power On
	checkDisplay: function(power) {
		exec("/usr/bin/vcgencmd display_power", (err, stdout, stderr)=> {
			if (err == null) {
				var displaySh = stdout.trim();
				DisplayResult = displaySh.substr(displaySh.length -1);
				//console.log("[NewPIR] Test -- Fonction checkDisplay: " + DisplayResult);
			}
		})
	}
});
