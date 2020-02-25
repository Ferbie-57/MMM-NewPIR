# MMM-NewPIR
MMM-NewPIR is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror) project by [Michael Teeuw](https://github.com/MichMich).

It uses a PIR sensor attached to your raspberry pi's GPIO pins to check for users. After a configurated time without any user interaction the display will turn off and hide all module for economy mode.

If you don't have PIR sensor, it can also be used for automatic turn on / turn off screen.

**[MMM-AssistantAMk2 v3 Ready](https://github.com/eouia/MMM-AssistantMk2/wiki/Prepared-recipes#with-mmm-newpirjs)**

## Screenshoot
![](https://raw.githubusercontent.com/bugsounet/MMM-NewPIR/master/screenshoot.png)

## Installation
Clone the module into your MagicMirror module folder and execute `npm intall` in the module's directory.
```
git clone https://github.com/bugsounet/MMM-NewPIR.git
cd MMM-NewPIR
npm install
```

## Note for RPI4 user
RPI4 firmware not support actually `vcgencmd display_power` command.

So, turn off display should not working

## Configuration
To display the module insert it in the config.js file. Here is an example:

## Minimal configuration
```js
{
  module: 'MMM-NewPIR',
  position: 'top_left',
  config: {
    sensorPin: 21, // replace by your BCM-number of the sensor pin
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
    useSensor: true,
    sensorPin: 21,
    reverseValue: false,
    delay: 2* 60 * 1000,
    turnOffDisplay: true,
    ecoMode: true,
    governor: "",
    text: "Auto Turn Off Screen:",
    counter: true,
    debug: false
  }
},
```

<br>

| Option  | Description | Type | Default |
| ------- | --- | --- | --- |
| useSensor | Use sensor or not | Boolean | true |
| sensorPin | BCM-number of the sensor pin | Integer | 21 |
| reverseValue| Set it to `false` if sensor detect presence on value 1. Set it to `true` if sensor detect presence on value 0 | Bloolean | false |
| delay | Time before the mirror turns off the display if no user activity is detected. (in ms) | Integer | 120000 (2 minutes) |
| turnOffDisplay | Should the display turn off after timeout? | Boolean | true |
| ecoMode | Should the MagicMirror hide all module after timeout ? | Boolean | true |
| governor | Set CPU Governor on start. Available : conservative ondemand userspace powersave performance or set "" for no change | String | "" |
| text | Set the text beside the counter | string | "Auto Turn Off Screen:" |
| counter | Display counter before turn screen off | Boolean | true |

## Developer Notes
- This module broadcasts a `USER_PRESENCE` notification with the payload beeing `true` or `false` you can use it to pause or disable your module.
- This module receive `USER_PRESENCE` notification with the payload `true` to force user presence or `false` to force delay to time out. 

## Change Log

### 2020-25-02
- Refact log for debug
- Add auto turn on screen on exit
- Add new features:
  * counter : display counter or not
  * text: text to display beside the counter

### 2020-19-02
- add reverseValue Feature : 
  * Set it to `false` if sensor detect presence on value 1.
  * Set it to `true` if sensor detect presence on value 0

### 2020-21-01
- Correct possibility fix Gpio issue ?
### 2020-18-01
- correct USER_PRESENCE { false } notification receive
### 2019-12-12
- add useSensor feature
### 2019-12-11
- V2 initial commit
- Rewrite code

