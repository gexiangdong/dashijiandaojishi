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
    var now = new Date().getTime()
    if(app.globalData && app.globalData.myEvents){
      return app.globalData.myEvents
    }
    //调用API从本地缓存中获取数据
    var myEvents = wx.getStorageSync('myevents') || []
    if(myEvents.length == 0){
      //我的事件为空
      var newUser = wx.getStorageSync('newuser') || true
      if(newUser){
        //增加一些样例事件
        var d = new Date()
        if(d.getDay() < 6){
          console.log('day=' + d.getDay())
          var sample0 = {
            name: '周末',
            d: new Date(d.getFullYear(), d.getMonth(), d.getDate() + (6 - d.getDay())).getTime(),
            id: 'sample-zm-' + d.getTime
          }
          myEvents.push(sample0)
        }
        var sample1 = {
          name: '情人节',
          d: new Date(2018, 1, 14).getTime(),
          id: 'sample-gqj-1'
        }
        myEvents.push(sample1)

        var sample2 = {
          name: '春节放假',
          d: new Date(2018, 1, 15).getTime(),
          id: 'sample-cj-2'
        }
        myEvents.push(sample2)

        var sample3 = {
          name: '五一劳动节',
          d: new Date(2018, 4, 1).getTime(),
          id: 'sample-ldj-3'
        }
        myEvents.push(sample3)

        var sample4 = {
          name: '2018年高考',
          d: new Date(2018, 5, 7).getTime(),
          id: 'sample-gk-4'
        }
        myEvents.push(sample4)

      }
      wx.setStorage({
        key: 'newuser',
        data: false,
      })
    }
    var newEvents = []
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
