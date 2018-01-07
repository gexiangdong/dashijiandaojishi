const { mysql } = require('../qcloud')
const fs = require('fs');


/**
 * 查询某个大事件
 */
function getEvent(ctx, next){

  console.log('getEvent function called. ' + ctx.params.id)
  // console.log(mysql.table('bigevent'))
  var sql = mysql('bigevent').insert({ id: 'ttttt-ttt-aaaa', userId: 99, occurDate: '2018-5-1', name: '51 holiday' })
  // console.log(sql.toString())
  mysql.raw(sql).then(function (resp){
    console.log('executed by raw...' + resp)
  })
  // mysql('db_name').select('*').where({ id: 1 }) // => { id:1, name: 'leo', age: 20 }
  ctx.state.data = { msg: 'Hello getEvent ' + ctx.params.id}
}

/**
 * 列出所有当前用户的大事件
 */
function listMyEvents(ctx, next){
  console.log('showMyEvents')
}

/**
 * 显示某个大事件的图片
 */
function getEventImage(ctx, next) {
  console.log('getEventImage.......' + ctx.params.id)
  ctx.res.setHeader('Content-Type', 'image/png');
  ctx.status = 200

  //生成事件图片
  var Canvas = require('canvas')
  var Image = Canvas.Image
  var canvas = new Canvas(500, 500)
  // Canvas.font('/Users/gexiangdong/temp/msyh.ttf')
  var cc = canvas.getContext('2d');
  
  // Write "Awesome!"
  cc.font = '30px arial'
  cc.rotate(0.1)
  cc.fillStyle = '#FF0000'
  cc.fillText('It\'s Awesome! 惊奇 great', 50, 100)

  // Draw line under text
  var text = cc.measureText('It\'s Awesome!')
  cc.strokeStyle = 'rgba(255,0,0,0.5)'
  cc.beginPath()
  cc.lineTo(50, 102)
  cc.lineTo(50 + text.width, 102)
  cc.stroke()

  ctx.body = canvas.toBuffer(undefined, 3, canvas.PNG_FILTER_NONE);
  
}

/**
 * 创建一个大事件
 */
function postEvent(ctx, next) {
  ctx.state.data = { msg: 'Hello postEvent' }
}

/**
 * 修改大事件
 */
function modifyEvent(ctx, next){
  ctx.state.data = { msg: 'Hello modifyEvent' }
}


module.exports =  {
  get: getEvent,
  list: listMyEvents,
  post: postEvent,
  image: {
    get: getEventImage
  },
  put: modifyEvent
  
}