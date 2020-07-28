# MMM-NewPIR
MMM-NewPIR is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror) project by [Michael Teeuw](https://github.com/MichMich).

It uses a PIR sensor attached to your raspberry pi's GPIO pins to check for users. After a configurated time without any user interaction the display will turn off and hide all module for economy mode.

If you don't have PIR sensor, it can also be used for automatic turn on / turn off screen.

## Screenshoot
![](https://raw.githubusercontent.com/bugsounet/MMM-NewPIR/master/screenshoot.png)

## Installation
Clone the module into your MagicMirror module folder and execute `npm intall` in the module's directory.
```
cd ~/MagicMirror/modules
git clone https://github.com/bugsounet/MMM-NewPIR.git
cd MMM-NewPIR
npm install
```

## Configuration
To display the module insert it in the config.js file. Here is an example:

## Minimal configuration
```js
{
  module: 'MMM-NewPIR',
  position: 'top_left',
  config: {
      screen: {
        delay: 2 * 60 * 1000
      },
      pir: {
        gpio: 21
      }, 
  }
},
```
## Personalized configuration
this is the default configuration defined if you don't define any value

```js
{
  module: 'MMM-NewPIR',
  position: 'top_left',
  config: {
      debug: false,
      screen: {
        delay: 2 * 60 * 1000,
        turnOffDisplay: true,
        ecoMode: true,
        displayCounter: true,
        text: "Auto Turn Off Screen:",
        displayBar: true,
        displayStyle: "Text",
        governorSleeping: false,
        rpi4: false
      },
      pir: {
        usePir: true,
        gpio: 21,
        reverseValue: false
      },
      governor: {
        useGovernor: false,
        sleeping: "powersave",
        working: "ondemand"
      }
  }
},
```

### Field `screen: {}`

| Option  | Description | Type | Default |
| ------- | --- | --- | --- |
| delay | Time before the mirror turns off the display if no user activity is detected. (in ms) | Number | 120000 |
| turnOffDisplay | Should the display turn off after timeout? | Boolean | true |
| ecoMode | Should the MagicMirror hide all module after timeout ? | Boolean | true |
| displayCounter | Should display Count-down in screen ? | Boolean | true |
| text | Display a text near the counter | String | "Auto Turn Off Screen:" |
| displayBar| Should display Count-up bar in screen ? | Boolean | true |
| displayStyle| Style of the Count-down. Available: "Text", "Line", "SemiCircle", "Circle", "Bar" | String | Text |
| governorSleeping| Activate sleeping governor when screen is off | Boolean | false |
| rpi4| rpi4 support or activate DPMS support | Boolean | false |

### Field `pir: {}`
| Option  | Description | Type | Default |
| ------- | --- | --- | --- |
| usePir | activation of Pir sensor module | Boolean | true |
| gpio | BCM-number of the sensor pin | Number | 21 |
| reverseValue | presence detector value | Boolean | false |

### Field `governor: {}`
| Option  | Description | Type | Default |
| ------- | --- | --- | --- |
| useGovernor | When you set to true, you enable governor management | Boolean | true |
| sleeping | name of the governor when screen is in sleeping state | String | powersave |
| working | name of the governor when screen is actived | String | ondemand |

Available governor:
 * conservative
 * ondemand
 * userspace
 * powersave
 * performance
 
Notes: On boot of your RPI, your governor is reset automaticaly to ondemand

## Developer Notes

- This module broadcasts:
  * `USER_PRESENCE` notification with the payload beeing `true` or `false` you can use it to pause or disable another module.
- This module receive:
  * `USER_PRESENCE` notification with the payload `true` to force user presence or `false` to force delay to time out. 
  * `SCREEN_END` notification to force the end of the count down
  * `SCREEN_WAKEUP` notification to wake up the screen and reset count down
  * `SCREEN_LOCK` notification keep the screen on and lock it (freeze counter and stop pir detection) 
  * `SCREEN_UNLOCK` notification unlock the screen and restart counter and pir detection

## Update
```
cd ~/MagicMirror/modules/MMM-NewPIR
git pull
npm install
```

## Notes:
 *rpi4 feature*: Now it's not needed, and work properly with lasted RPI firmware but if you want `DPMS` support you can use it

## Change Log

### 2020-07-28
- V3 initial commit
- Rewrite code
