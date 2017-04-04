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
    touchTimer: {handler:null, lastX:null, lastY: null, startX: null, startY: null}
  },
  touchStart: function(e){
    if(e.changedTouches.length > 0){
      var x = e.changedTouches[0].clientX
      var y = e.changedTouches[0].clientY
      this.setData({
        touchTimer: {handler: null, startX: x, startY: y, lastX: x, lastY: y }
      })
    }
  },
  touchMove: function(e){
    var x = e.changedTouches[0].clientX
    var y = e.changedTouches[0].clientY
    if(this.data.touchTimer.startX == null && e.changedTouches.length > 0){
      this.setData({
        touchTimer: {handler: null, startX: x, startY: y, lastX: x, lastY: y }
      })
    }else if (Math.abs( y - this.data.touchTimer.lastY) > 5){
      var paddingY = y - this.data.touchTimer.startY
      this.drawCalendar(0, paddingY)
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
  touchEnd: function(e){
    if(e.changedTouches.length > 0){
      var x = e.changedTouches[0].clientX
      var y = e.changedTouches[0].clientY
      if(this.data.touchTimer.startX != null){
        var disX = this.data.touchTimer.startX - x
        var disY = this.data.touchTimer.startY - y
        console.log('touchend: ' + disX + ' ' + disY)
        if(Math.abs(disY) >= 90){
          if(disY > 0){
            var m = this.data.calendar.month + 6
            var y = this.data.calendar.year
            if( m >= 12){
              y ++
              m = m % 12
            }
          }else{
            var m = this.data.calendar.month - 6
            var y = this.data.calendar.year
            if(m < 0){
              m += 12
              y --
              m = m % 12
            }
          }
          this.setData({calendar:{year: y, month: m}})
          console.log("drawCalendar with " + y + "-" + m)
        }
      }
    }
    this.touchCancel()
  },
  touchCancel: function(e){
    this.setData({
      touchTimer: {handler: null, startX: null, startY: null, lastX: null, lastY: null }
    })
    this.drawCalendar(0, 0)
  },
  drawCalendar: function(paddingX, paddingY){
    var year = this.data.calendar.year, month=this.data.calendar.month
    var d = new Date(year, month, 1)
    var m = d.getMonth() + 6
    var endDate = (m >= 12 ? new Date(year + 1, m % 12, 1) : new Date(year, m, 1))
    console.log('drawCalendar ' + year + ', ' + month + ' end date is ' + endDate)
    if(paddingX == null) {paddingX = 0}
    if(paddingY == null) {paddingY = 0}
    const ctx = wx.createCanvasContext('calendar')
    if(ctx.setTextAlign){
      ctx.setTextAlign('center')
    }
    ctx.setFontSize(8)
    //ctx.arc(20, 20, 10, 0, 2 * Math.PI)
    //ctx.setFillStyle('#FF0000')
    //ctx.fill()
    
    try {
      var res = wx.getSystemInfoSync()
      var r = res.windowWidth / 375
      this.setData({canvasHeight: Math.ceil(215 * r)})
      ctx.scale(r, r)
    } catch (e) {
      // Do something when catch error
    }
    var monthIndex = 0
    while(d < endDate){
      var line = -1
      var thisMonth = d.getMonth()
      var posX = (monthIndex % 3) * 120 + 20 + paddingX
      var posY = Math.floor(monthIndex / 3) * 105 + 10 + paddingY
      ctx.setFontSize(12)
      ctx.setFillStyle('#336699')
      ctx.fillText((thisMonth + 1) + '月', posX + 3, posY + 7)

      ctx.setFontSize(8)
      ctx.setFillStyle('#333333')
      while(d.getMonth() == thisMonth){
        var wd = d.getDay()
        if(line == -1){
          line = 1
        }else if(wd == 0){
          line ++
        }
        var x = posX + wd * 15
        var y = posY + line * 15 

        var hasEvent = false;
        for(var i=0; i<this.data.eventList.length; i++){
          var ed = new Date(parseInt(this.data.eventList[i].d))
          if(ed.getFullYear() == d.getFullYear() && ed.getMonth() == d.getMonth() && ed.getDate() == d.getDate()){
            hasEvent = true
            break;
          }
        }
        
        if(hasEvent){
          ctx.beginPath()
          ctx.setFillStyle('#FF0000')
          ctx.arc(x, y + 2, 6, 0, 2 * Math.PI)
          ctx.setFillStyle('#FF0000')
          ctx.closePath()
          ctx.fill()
        }


        //console.log('draw ' + d.getDate() + '/' + wd + ' at(' + x + "," + y + ")")
        
        ctx.beginPath()
        if(hasEvent){
          ctx.setFillStyle('#FFFFFF')
        }else{
          ctx.setFillStyle('#333333')
        }
        if(ctx.setTextAlign){
          ctx.fillText('' + d.getDate(), x, y+5)
        }else{
          ctx.fillText('' + d.getDate(), x-1, y+5)
        }
        ctx.closePath()
        ctx.fill()

        d = new Date(d.getTime() + 24 * 3600 * 1000)
      }
      monthIndex ++
    }

    ctx.draw()
  },
  addEvent: function(){
    wx.navigateTo({
      url: '/pages/event/edit'
    })
  },
  initEventList: function(){
    var myEvents = util.getMyEvents()
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
      this.drawCalendar(0, 0)
    }catch(ex){}
  },
  onPullDownRefresh: function () {
    this.onLoad()
    wx.stopPullDownRefresh()
  }

})
