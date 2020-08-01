/** Merging MagicMirror (or other) default/config script **/
/** merge 2 objects **/
/** using: **/
/** ------- **/
/** this.config = configMerge({}, this.defaults, this.config) **/
/** ------- **/
/** arg1: initial objet **/
/** arg2: config model **/
/** arg3: config to merge **/
/** ------- **/
/** why using it ? **/
/** Object.assign() function don't to all job **/
/** it don't merge all thing in depth **/
/** -> object in object and array is not merging **/
/** ------- **/

"use strict"

var configMerge= function (result) {
  var stack = Array.prototype.slice.call(arguments, 1)
  var item
  var key
  while (stack.length) {
    item = stack.shift()
    for (key in item) {
      if (item.hasOwnProperty(key)) {
        if (typeof result[key] === "object" && result[key] && Object.prototype.toString.call(result[key]) !== "[object Array]") {
          if (typeof item[key] === "object" && item[key] !== null) {
            result[key] = configMerge({}, result[key], item[key])
          } else {
            result[key] = item[key]
          }
        } else {
          result[key] = item[key]
        }
      }
    }
  }
  return result
}

console.log("[@bugsounet] configMerge v1.0.0 Loaded !")
