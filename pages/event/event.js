var util = require('../../utils/util.js')
var wisdomJS = require('wisdoms.js')

Page({
  data:{
      event:{
        id: null,
        name: '',
        d: 0,
        date: '',
        days: 43,
        wisdom: '',
        author: null
      },
      editable: false,
      watchable: false,
      deleteable: false,
      showDate: false,
      shareit: true,
      backButtonType: "default",
      hint: '点右上角可把此页转发到群对话内'
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    console.log(options.d)
    var d = new Date(parseInt(options.d))
    console.log(decodeURI(options.n))
    var wisdom = null
    var author = null;
    var rnd = parseInt((Math.random() * wisdomJS.wisdoms.length))
    wisdom = wisdomJS.wisdoms[rnd]['w']
    author = wisdomJS.wisdoms[rnd]['a']

    var eventDate = util.formatDate(d)
    var eventName = decodeURI(options.n)
    var showDate = (eventName.length > 6 || eventDate.length > 6)
    this.setData({
      event:{
            id: options.i,
            name: eventName,
            d: d.getTime(),
            date: eventDate,
            days: util.daysLeft(d),
            wisdom: wisdom,
            author: author
          },
      showDate: showDate
      })
     console.log("showDate=" + showDate)
     if(!wx.reLaunch){
       //底层框架1.0
       this.setData({hint: '可把此页分享到群对话内'})
     }
     wx.setNavigationBarTitle({
        title: (showDate ? eventName : eventDate + '' + eventName)
    })
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    var myEvents = util.getMyEvents();
    var found = false
    for(var i=0; i<myEvents.length; i++){
      if(myEvents[i].id == this.data.event.id){
        found = true
        break
      }
    }
    if(found){
      var canShare = false
      try{
        var res = wx.getSystemInfoSync()
        var sdkversion = res.SDKVersion
        if (sdkversion) {
          sdkversion = sdkversion.substring(0, sdkversion.lastIndexOf('.'))
          console.log("SDKVersion=" + sdkversion)
          if(parseFloat(sdkversion) >= 1.2){
            canShare = true
          }
        }
      }catch(e){
        console.log("ERROR while get SDKVersion: " + e)
      }

      this.setData({
        editable: true,
        deleteable: true,
        watchable: false,
        shareit: canShare,
        backButtonType: canShare ? "default" : "primary"
      })
    }else{
      this.setData({
        editable: false,
        deleteable: false,
        watchable: true,
        shareit: false,
        backButtonType: "default"
      })
    }
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  onShareAppMessage: function () {
    var title
    if(this.data.showDate){
      title = '距' + this.data.event.name
    }else{
      title = '距' + this.data.event.date + '' + this.data.event.name
    }
    if(this.data.event.days < 10){
      title += '仅剩'
    }else{
      title += '还有'
    }
    return {
      title: title,
      path: '/pages/event/event?i=' + this.data.event.id + '&d=' + this.data.event.d + "&n=" + encodeURI(this.data.event.name)
    }
  },
  watchThisEvent: function(){
    var newEvent = {
      name: this.data.event.name,
      d: this.data.event.d,
      id: this.data.event.id
    }
    util.saveEventToStoreage(newEvent)
    let that  = this
    wx.showToast({
      title: '已保存',
      icon: 'success',
      duration: 2000,
      complete: function(){
        that.gotoMyEvents()
      }
    })
  },
  gotoMyEvents: function(e){
    if(wx.reLaunch){
      wx.reLaunch({
          url: '/pages/index/index'
      })
    }else{
      //兼容低版本
      //wx.navigateBack({delta: 10})
      wx.redirectTo({
        url: '/pages/index/index'
      })
    }
  },
  deleteEvent: function(e){
    let that = this
    wx.showModal({
      title: '',
      content: '要删除这个事件吗？',
      success: function(res) {
        if (res.confirm) {
          console.log("will delete " + that.data.event.id)
          util.deleteEventById(that.data.event.id)
          that.gotoMyEvents()
        } else if (res.cancel) {
          //console.log('用户点击取消')
        }
      }
    })
  },
  editEvent: function(e){
    var editUrl = '/pages/event/edit?id=' + this.data.event.id
    var ps = getCurrentPages()
    //console.log("currentPages length " + ps.length)
    //for(var i=0; i<ps.length; i++){
     // console.log("#" + i)
     // console.log(ps[i].data)
    //}
    if(ps.length >= 3){
      //为了避免超过5级
      if(ps[1].data.event){
        //第2个页面是展示页
        wx.redirectTo({
           url: editUrl
        })
        return
      }
     }
    wx.navigateTo({
        url: editUrl
    })
  },
  onPullDownRefresh: function () {
    var wisdom = null
    var author = null;
    var rnd = parseInt((Math.random() * wisdomJS.wisdoms.length))
    wisdom = wisdomJS.wisdoms[rnd]['w']
    author = wisdomJS.wisdoms[rnd]['a']
    this.setData({
      event:{
        id: this.data.event.id,
        name: this.data.event.name,
        d: this.data.event.d,
        date: this.data.event.date,
        days: this.data.event.days,
        wisdom: wisdom,
        author: author
      }})
    wx.stopPullDownRefresh()
  }
})