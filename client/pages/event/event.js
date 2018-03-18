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
      showMore: true,
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
    
    var showMore = true

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
      showDate: showDate,
      showMore: showMore
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
    // 页面渲染完成，上报事件；
    // 在此处不再onload里上报是为了加速事件显示
    try {
      var ps = getCurrentPages()
      if (ps.length == 1) {
        //第一页就是显示事件页面，表示从绘话点击分享进入
        wx.reportAnalytics('view_event', {
          event_name: this.data.event.name,
          days_left: this.data.event.days
        })
        // console.log("上报完成。")
      }
    } catch (ex) {
      console.error("上报事件时出错", ex)
    }
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
          }else{
            this.setData({
              showMore: false
            })
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
    if(this.data.event.days > 7){
      title += '还有'
    } else if(this.data.event.days >= 0){
      title += '仅剩'
    } else{
      title += '已经'
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
  drawEventImage: function(){
    wx.showLoading({
      title: '制作中',
    })
    var res = wx.getSystemInfoSync()
    var platform = res.platform
    var sdkversion = res.SDKVersion

    const ctx = wx.createCanvasContext('countdown')
    var left = 0
    
    ctx.setFillStyle('#FFFFFF')
    ctx.fillRect(0, 0, 800, 800)

    ctx.setFontSize(80)
    ctx.setFillStyle('#000000')
    ctx.setTextAlign('center')
    ctx.fillText(this.data.event.name, 400, 120)

    ctx.setFontSize(28)
    ctx.setFillStyle('#666666')
    ctx.setTextAlign('center')
    ctx.fillText('目标日：' + this.data.event.date, 400, 200)
    
    ctx.setFontSize(28)
    ctx.setFillStyle('#999999')
    var dayWidth = 0
    var t = this.data.event.days.toString()
    for (var i = 0; i < t.length; i++){
      if(t.charAt(i) == '1'){
        dayWidth += 100
        if (platform === 'android'){
          dayWidth += 25
        }
      }else{
        dayWidth += 140
      }
    }
    console.log(t + ' width: ' + dayWidth)
    left = 400 - dayWidth / 2
    ctx.setTextAlign('right')
    var dayColor = 'red'
    if(this.data.event.days > 7){
      ctx.fillText('还有', left, 330)
    }else if(this.data.event.days > 0){
      ctx.fillText('仅剩', left, 330)
    } else if (this.data.event.days == 0) {
      ctx.fillText('正在', left, 330)
    }else{
      ctx.fillText('已经', left, 330)
      t = Math.abs(this.data.event.days).toString()
      dayColor = '#006400'
    }
    ctx.setFontSize(240)
    ctx.setFillStyle(dayColor)
    ctx.setTextAlign('right')
    left = 400 + dayWidth / 2
    ctx.fillText(t, left, 480)
    ctx.setFontSize(40)
    ctx.setTextAlign('left')
    ctx.fillText('天', left, 470)


    ctx.setFontSize(28)
    ctx.setFillStyle('#999999')
    ctx.setTextAlign('left')
    var w = this.data.event.wisdom.split('\n')
    var maxlength = 0
    var w2 = new Array();
    for(var i=0; i<w.length; i++){
      var s = w[i]
      while(s.length > 25){
        w2.push(s.substring(0, 25))
        maxlength = 25
        s = s.substring(25)
      }
      w2.push(s)
      if(maxlength < s.length){
        maxlength = s.length
      }
    }
    left = parseInt((800 - maxlength * 28) / 2)
    for(var i=0; i<w2.length; i++){
      ctx.fillText(w2[i], left, 650 + 34 * i)
    }
    if(this.data.event.author && this.data.event.author.length > 0){
      left = left + maxlength * 28
      ctx.setTextAlign('right')
      ctx.fillText('-- ' + this.data.event.author, left, 670 + 34 * w2.length)
    }

    ctx.setFontSize(16)
    ctx.setFillStyle('#CCCCCC')
    ctx.setTextAlign('right')
    ctx.fillText('本图由小程序『大事件倒计时』生成', 785, 785)
    
    if (sdkversion) {
      sdkversion = sdkversion.substring(0, sdkversion.lastIndexOf('.'))
      if (parseFloat(sdkversion) >= 1.7) {
        //1.7以上draw支持完成后的callback
        ctx.draw(false, this.saveEventImage)
        return;
      }
    }

    //因为draw()是直接返回，不知道是否已经画好图，所以等1秒后保存图
    ctx.draw()
    setTimeout(this.saveEventImage, 1000)
  },
  
  saveEventImage: function() {
    wx.canvasToTempFilePath({
      canvasId: 'countdown',
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            wx.hideLoading()
            // wx.showToast({
            //   title: '已保存到相册',
            //   icon: 'success',
            //   duration: 3000
            // })
            wx.showModal({
              title: '温馨提示',
              content: '倒计时图片已经保存到手机相册。',
              showCancel: false,
              confirmText: '我知道了'
            })
            console.log('canvas saved to photosAlbum')
          },
          fail:function(res){
            wx.hideLoading()
            wx.showModal({
              title: '出错了',
              content: '倒计时图片保存到相册失败。\r\n' + res.errMsg,
              showCancel: false
            })
          }
        })
      },
      fail: function(res){
        console.log('ERROR:')
        console.log(res)
        wx.hideLoading()
        wx.showModal({
          title: '出错了',
          content: '倒计时图片保存失败。\r\n' + res.errMsg,
          showCancel: false
        })
      }
    })
  },
  askForWritePhotosAlbum: function(){
    let that = this
    wx.showModal({
      title: '温馨提示',
      content: '保存倒计时天数图片到相册后可在小程序外其他场景使用。\r\n保存图片需要您授权小程序写入手机相册的权限。',
      success: function (res) {
        if (res.confirm) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success(res) {
              that.drawEventImage()
            },
            fail() {
              wx.openSetting({
                success: (res) => {
                  if (res.authSetting['scope.writePhotosAlbum']) {
                    console.log('开启权限成功')
                  }
                }
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  moreActions: function(){
    //TODO: , '修改显示样式', '自定义名言'
    let that = this
    wx.showActionSheet({
      itemList: ['保存图片到相册'],
      success: function (res) {
        if(res.tapIndex == 0){
          //保存图片到相册
          wx.getSetting({
            success: res => {
              if (!res.authSetting['scope.writePhotosAlbum']) {
                // 保存图片未授权，提示获取授权
                that.askForWritePhotosAlbum()
              } else {
                that.drawEventImage()
              }
            }
          })
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
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