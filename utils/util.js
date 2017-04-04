function formatDate(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var nowYear = (new Date()).getFullYear();
  var nowMonth = (new Date()).getMonth() + 1;
  if(year == nowYear || (year - nowYear == 1 && nowMonth > month)){
    return month + "月" + day + "日"
  }else {
    return year + "年" + month + "月" + day + "日"
  }
}

function daysLeft(d){
    var now = new Date()
    return Math.ceil((d.getTime() - now.getTime()) / 1000.0 / 3600 / 24)
}

function generateNewId() {
    function S4() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1)
    }
    return (S4()+S4()+""+S4()+""+S4())
}

function deleteEventById(eventId){
    var myEvents = getMyEvents();
    var newEvents = []
    for(var i=0; i<myEvents.length; i++){
      if(myEvents[i].id != eventId){
        newEvents.push(myEvents[i])
      }
    }
    updateMyEvents(newEvents)
}
function saveEventToStoreage(newEvent){
    console.log("saveEventToStoreage() ... " + newEvent.id)
    if(newEvent.id == null){
      newEvent.id = generateNewId()
    }
    var myEvents = getMyEvents();
    var found = false
    for(var i=0; i<myEvents.length; i++){
      if(myEvents[i].id == newEvent.id){
        myEvents[i] = newEvent
        found = true
        break
      }
    }
    if(!found){
      myEvents.push(newEvent)
    }
    updateMyEvents(myEvents)
}
function updateMyEvents(newEvents){
    getApp().globalData.myEvents = newEvents
    wx.setStorageSync('myevents', newEvents)
}
function getMyEvents(){
    var app = getApp()
    if(app.globalData && app.globalData.myEvents){
      return app.globalData.myEvents
    }
    //调用API从本地缓存中获取数据
    var myEvents = wx.getStorageSync('myevents') || []
    var newEvents = []
    var now = new Date().getTime()
    for(var i=0; i<myEvents.length; i++){
      var event = myEvents[i]
      if(event.d > now){
        newEvents.push(event)
      }
    }
    if(newEvents.length < myEvents.length){
      //清除了一部分过期数据
      //wx.setStorageSync("myevents", newEvents)
    }
    app.globalData.myEvents = newEvents
    return newEvents
}




module.exports = {
  formatDate: formatDate,
  daysLeft: daysLeft,
  updateMyEvents: updateMyEvents,
  getMyEvents: getMyEvents,
  saveEventToStoreage: saveEventToStoreage,
  deleteEventById: deleteEventById
}
