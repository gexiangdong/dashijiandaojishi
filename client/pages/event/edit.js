// pages/event/edit.js
var util = require('../../utils/util.js')
Page({
  data:{
    event:{id:null, name:'', date:null},
    startDate: null,
    endDate: null
  },
  formatDate: function(d){
    return d.getFullYear() + '-' + this.formatNum(d.getMonth() + 1) + '-' + this.formatNum(d.getDate())
  },
  formatNum: function(n){
    return (n < 10 ? '0' + n : '' + n);
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    if(options.id){
       wx.setNavigationBarTitle({
        title: '修改大事件'
       })
       var myEvents = util.getMyEvents();
       var n = "NULL", d=null, id=null
       for(var i=0; i<myEvents.length; i++){
         if(options.id == myEvents[i].id){
           n = myEvents[i].name
           d = this.formatDate(new Date(parseInt(myEvents[i].d)))
           id = options.id
           break;
         }
       }
       this.setData({
          event:{id:id, 
              name:n,
              date:d
              }
       })
       console.log("modify event " + this.data.event.id + " vs " + id)
    }else{
      wx.setNavigationBarTitle({
        title: '新增大事件'
       })
    }
    var now = new Date()
    var s = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + (now.getDate() + 1)
    var e = (now.getFullYear() + 10) + '-12-31'
    this.setData({startDate: s, endDate: e})
  },
  bindNameChange: function(e) {
    this.setData({
      event:{
            id:this.data.event.id, 
            name: e.detail.value, 
            date: this.data.event.date
            }
    })
  },
  bindDateChange: function(e) {
    //console.log("EDIT:" + e.detail.value)
    this.setData({
      event:{
            id: this.data.event.id,
            name: this.data.event.name, 
            date: e.detail.value 
            }
    })
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  gotoMyEvents:function(){
    wx.navigateBack({
      delta: 1
    })
  },
  saveEvent:function(e){
    if(this.data.event.name == null || this.data.event.name.length < 1) {
      wx.showModal({
        title: '提示',
        content: '请输入事件名称' + this.data.event.name,
        showCancel: false
      })
      return
    }
    if(this.data.event.date == null) {
      wx.showModal({
        title: '提示',
        content: '请选择事件发生日期',
        showCancel: false
      })
      return
    }
    var ary = this.data.event.date.split('-')
    var theDate = new Date(parseInt(ary[0]), parseInt(ary[1]) - 1, parseInt(ary[2]))
    console.log("date=" + this.data.event.date + "; date=" + theDate)
    var newEvent = {
      id: this.data.event.id,
      name: this.data.event.name,
      d: theDate.getTime()
    }
    console.log("save event " + this.data.event.id)
    util.saveEventToStoreage(newEvent)

    wx.showToast({
      title: '已成功保存',
      icon: 'success',
      duration: 2000,
      complete: function(){
        var url = '/pages/event/event?i=' + newEvent.id + "&d=" + newEvent.d + "&n=" + encodeURI(newEvent.name)
        console.log("redirectTo " + url)
        wx.redirectTo({
          url: url
        })
      }
    })
  }

})