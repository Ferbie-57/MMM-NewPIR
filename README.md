# MMM-NewPIR
MMM-NewPIR is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror) project by [Michael Teeuw](https://github.com/MichMich).

This module is based on [MMM-PIR](https://github.com/mboskamp/MMM-PIR) project by [Miklas Boskamp](https://github.com/mboskamp)

It uses a PIR sensor attached to your raspberry pi's GPIO pins to check for users. After a configurated time without any user interaction the display will turn off and hide all module for economy mode.

## Installation
Cline the module into your MagicMirror module folder and execute `npm intall` in the module's directory.
```
git clone https://github.com/bugsounet/MMM-NewPIR.git
cd MMM-NewPIR
npm install
```

## Configuration
To display the module insert it in the config.js file. Here is an example:
```
{
	module: 'MMM-NewPIR',
        config: {
		sensorPin: 21, // sensor pin out
                delay: 60 * 1000, // delay for time out
                turnOffDisplay: true, // turn off display
                EconomyMode: true, // hide all modules
		Governor : "" // Set CPU Governor : "conservative"  "ondemand"  "userspace"  "powersave"  "performance" or set "" for no change
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
| Governor | Set CPU Governor on start. Available : conservative ondemand userspace powersave performance or set "" for no change | String | "" |

## Developer Notes
- This module broadcasts a `USER_PRESENCE` notification with the payload beeing `true` or `false` you can use it to pause or disable your module.
- This module broadcasts a `NEWPIR_HIDDING` and `NEWPIR_SHOWING` notification when it hide or show all modules.

## Change Log

### 2019-12-11
- V2 initial commit
- Rewrite code
### 2019-10-12
- Add MMM-Page features
- Add USER_PRESENCE incomming notification
### 2019-09-12
- hdmi power on don't work sometime (solved)
- Add HDMI checkDisplay Function
- Add debug (developper)
### 2019-09-03
- Hotword detection for Assistant
- Show in full screen selectioned modules when hotword detected
- ** Cleaning Code **
- Set CPU Governor on start
### 2019-08-31
- initial commit
- FIX : Loop in timer -- always display off -- cause USER_PRESENCE payload -- Cleaning Code

