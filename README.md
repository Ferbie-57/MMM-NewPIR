# MMM-NewPIR
MMM-NewPIR is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror) project by [Michael Teeuw](https://github.com/MichMich).

It uses a PIR sensor attached to your raspberry pi's GPIO pins to check for users. After a configurated time without any user interaction the display will turn off and hide all module for economy mode.

If you don't have PIR sensor, it can also be used for automatic turn on / turn off screen.

**[MMM-AssistantAMk2 v3 Ready](https://github.com/eouia/MMM-AssistantMk2/wiki/Prepared-recipes#with-mmm-newpirjs)**

## Installation
Clone the module into your MagicMirror module folder and execute `npm intall` in the module's directory.
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
		useSensor: true // set to false if you don't use sensor
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
| useSensor | Use sensor or not | Boolean | true |
| sensorPin | BCM-number of the sensor pin | Integer | 21 |
| delay | Time before the mirror turns off the display if no user activity is detected. (in ms) | Integer | 60000 (1 minutes) |
| turnOffDisplay | Should the display turn off after timeout? | Boolean | true |
| ecoMode | Should the MagicMirror hide all module after timeout ? | Boolean | true |
| governor | Set CPU Governor on start. Available : conservative ondemand userspace powersave performance or set "" for no change | String | "" |

## Developer Notes
- This module broadcasts a `USER_PRESENCE` notification with the payload beeing `true` or `false` you can use it to pause or disable your module.
- This module receive `USER_PRESENCE` notification with the payload `true` to force user presence or `false` to force delay to time out. 

## Change Log

### 2020-18-01
- correct USER_PRESENCE { false } notification receive
### 2019-12-12
- add useSensor feature
### 2019-12-11
- V2 initial commit
- Rewrite code

