//app.js
App({
  onLaunch: function (options) {
    try {
      if (options) {
        // console.log("onLaunch ")
        // console.log(options)
        if (options.referrerInfo) {
          var newEvents = options.referrerInfo.extraData
          // console.log("has extraData")
          // console.log(newEvents)
          var myEvents = wx.getStorageSync('myevents') || []
          // console.log(myEvents)
          for (var i = 0; i < newEvents.length; i++) {
            // console.log("checking #" + i + " " + newEvents[i].name + " exists.")
            var exists = false
            // console.log(newEvents[i])
            for (var j = 0; j < myEvents.length; j++) {
              // console.log(myEvents[j])
              if (newEvents[i]['id'] == myEvents[j]['id']) {
                exists = true
                // console.log(newEvents[i].name + ' exists.')
                break
              }
            }
            if (!exists) {
              myEvents.push(newEvents[i])
              // console.log("push new event " + newEvents[i].name)
            }
          }
          wx.setStorageSync('myevents', myEvents)
        }
      }
    } catch (ex) {
      console.log("ERROR OCURE")
      console.error(ex)
    }
  },
  globalData:{
    myEvents: null
  }
})
