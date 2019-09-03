# MMM-NewPIR
MMM-NewPIR is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror) project by [Michael Teeuw](https://github.com/MichMich).

This module is based on [MMM-PIR](https://github.com/mboskamp/MMM-PIR) project by [Miklas Boskamp](https://github.com/mboskamp)

It uses a PIR sensor attached to your raspberry pi's GPIO pins to check for users. After a configurated time without any user interaction the display will turn off and hide all module for economy mode.

## Installation
Cline the module into your MagicMirror module folder and execute `sh installer.sh` in the module's directory.
```
git clone https://github.com/bugsounet/MMM-NewPIR.git
cd MMM-NewPIR
sh installer.sh
```

## Configuration
To display the module insert it in the config.js file. Here is an example:
```
{
	module: 'MMM-NewPIR',
        config: {
		sensorPin: 21,
                delay: 60 * 1000, // delay for time out
                turnOffDisplay: true, // Turn off display
                EconomyMode: true // hide all module
		UseHotword: true, // use Hotword ?
		HotWord : "HOTWORD_PAUSE", //hotword Notification
		HotWordModules : [ "MMM-AssistantMk2" , "MMM-JarvisFace" ] // modules to display when hotword detected
        }
},
```

<br>

| Option  | Description | Type | Default |
| ------- | --- | --- | --- |
| sensorPin | BCM-number of the pin | Integer | 21 |
| delay | time before the mirror turns off the display if no user activity is detected. (in ms) | Integer | 15000 (15 seconds) |
| turnOffDisplay | Should the display turn off after timeout? | Boolean | true |
| EconomyMode | Should the MagicMirror hide all module after timeout ? | Boolean | true |
| UseHotword | Hotword detect when assistant is active. allows to display in full screen the desired modules | Boolean | true |
| Hotword | Notification to detect to active HotWord | String | HOTWORD_PAUSE |
| HotWordModules | Name of the modules to display when a hotword is detected | String |"MMM-AssistantMk2" , "MMM-JarvisFace" |
| Governor | Set CPU Governor on start. Available : conservative ondemand userspace powersave performance or set "" for no change | String | "" |

## Developer Notes
- This module broadcasts a `USER_PRESENCE` notification with the payload beeing `true` or `false` you can use it to pause or disable your module.
- This module broadcasts a `NEWPIR_HIDDING` and `NEWPIR_SHOWING` notification when it hide or show modules.
- This module detect [MMM-HOTWORD](https://github.com/eouia/MMM-Hotword) with `HOTWORD_PAUSE` notification for wakeup screen

## Change Log
### 2019-08-31
- initial commit
- FIX : Loop in timer -- always display off -- cause USER_PRESENCE payload -- Cleaning Code
### 2019-09-03
- Hotword detection for Assistant
- Show in full screen selectioned modules when hotword detected
- ** Cleaning Code **
- Set CPU Governor on start
