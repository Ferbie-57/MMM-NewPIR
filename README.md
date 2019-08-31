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
        }
},
```

<br>

| Option  | Description | Type | Default |
| ------- | --- | --- | --- |
| sensorPin | BCM-number of the pin | Integer | 21 |
| delay | time before the mirror turns off the display if no user activity is detected. (in ms) | Integer | 60000 (60 seconds) |
| turnOffDisplay | Should the display turn off after timeout? | Boolean | true |
| EconomyMode | Should the MagicMirror hide all module after timeout ? | Boolean | true |

# Change Log
## 2019-08-31
- initial commit
