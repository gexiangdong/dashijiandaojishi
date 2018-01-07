var util = require('../../utils/util.js')
var app = getApp()

Page({
  data: {
    eventList:[],
    calendar:{
              year:2017,
              month:0
            },
    canvasHeight: 215,
    showDelRow: -2,
    delRowButtonWidth: 0,
    touchTimer: {handler:null, lastX:null, lastY: null, startX: null, startY: null}
  },
  delRow: function(e){
    var targetId = e.currentTarget.id
    var rowIndex = parseInt(targetId.split("_")[1])
    var event = this.data.eventList[rowIndex]
    console.log(rowIndex + ' ' + event.name)
    let that = this
    wx.showModal({
      title: '',
      content: '确定要删除' + event.name + '吗？',
      success: function (res) {
        if (res.confirm) {
          console.log("will delete " + event.id)
          util.deleteEventById(event.id)
          that.setData({showDelRow: -1})
          that.initEventList()
        } else if (res.cancel) {
          //console.log('用户点击取消')
        }
      }
    })
  },
  rowTouchStart: function (e) {
    // var targetId = e.currentTarget.id
    // var rowIndex = parseInt(targetId.split("_")[1])
    this.setData({ showDelRow: -1, delRowButtonWidth: 0 })

    if (e.changedTouches.length > 0) {
      var x = e.changedTouches[0].clientX
      var y = e.changedTouches[0].clientY
      this.setData({
        touchTimer: { handler: null, startX: x, startY: y, lastX: x, lastY: y }
      })
    }
  },
  rowTouchMove: function(e){
    if (!e.changedTouches[0]){
      // console.log("event changedTouches #0 is undefine")
      return
    }
    var x = e.changedTouches[0].clientX
    var y = e.changedTouches[0].clientY
    if(this.data.touchTimer.startX == null){
      this.setData({
        touchTimer: {handler: null, startX: x, startY: y, lastX: x, lastY: y }
      })
    } else if (Math.abs(this.data.touchTimer.startX - x) > 40){
      var targetId = e.currentTarget.id
      var rowIndex = parseInt(targetId.split("_")[1])
      // var cx = this.data.touchTimer.lastX - x
      // var w = this.data.delRowButtonWidth + cx
      var w = (this.data.touchTimer.startX - x)/2;
      console.log('touchmove ' + w + ' on row #' + rowIndex)
      if(w <= 0){
        w = 0
        rowIndex = -1
      }else if(w > 120){
        w = 120
      }
      this.setData({ showDelRow: rowIndex, delRowButtonWidth: w })
      this.setData({
        touchTimer: {
            handler: null, 
            startX: this.data.touchTimer.startX, 
            startY: this.data.touchTimer.startY,
            lastX: x, 
            lastY: y }
      })
    }
  },
  rowTouchEnd: function(e){
    this.rowTouchCancel()
  },
  rowTouchCancel: function(e){
    if (this.data.delRowButtonWidth < 80){
      this.setData({showDelRow: -1, delRowButtonWidth: 0})
    }else{
      this.setData({delRowButtonWidth: 120 })
    }
    this.setData({
      touchTimer: {handler: null, startX: null, startY: null, lastX: null, lastY: null }
    })
  },
  addEvent: function(){
    wx.navigateTo({
      url: '/pages/event/edit'
    })
  },
  initEventList: function(){
    var myEvents = util.getMyEvents()
    try{
      myEvents.sort(function(e1, e2){
        return e1.d - e2.d
      })
    }catch(ex){
      // never happen if lucky
    }
    var eventList = []
    for(var i=0; i<myEvents.length; i++){
      var event = {}
      var myEvent = myEvents[i]
      event["id"] = myEvent.id
      event["name"] = myEvent.name
      event["d"] = parseInt(myEvent.d)
      event["date"] = util.formatDate(new Date(event.d))
      event["urlParams"] = "i=" + event.id + "&d=" + event.d + "&n=" + encodeURI(event.name)
      eventList.push(event)
    }
    this.setData({eventList: eventList})
  },
  onLoad: function () {
    var now = new Date()
    this.setData({calendar:{year: now.getFullYear(), month: (now.getMonth() < 6 ? 0 : 6)}})
    this.initEventList()
    try{
      // this.drawCalendar(0, 0)
    }catch(ex){}
  },
  onPullDownRefresh: function () {
    this.onLoad()
    wx.stopPullDownRefresh()
  }

})
