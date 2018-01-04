//app.js
App({
  onLaunch: function (options) {
    if (options) {
      try {
        if (options.referrerInfo) {
          var newEvents = options.referrerInfo.extraData
          var myEvents = wx.getStorageSync('myevents') || []
          var exists = false
          for (var i = 0; i < myEvents.length; i++) {
            for (var j = 0; i < newEvents.length; j++) {
              if (newEvents[j].id == myEvents[i].id) {
                exists = true
                break
              }
            }
            if (!exists) {
              newEvents.push(myEvents[i])
            }
          }
          getApp().globalData.myEvents = newEvents
          wx.setStorageSync('myevents', newEvents)
        }
      } catch (ex) {
        console.log(ex)
      }
    }
  }
  globalData:{
    myEvents: null
  }
})
