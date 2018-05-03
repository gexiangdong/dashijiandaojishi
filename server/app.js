const config = require('./config')
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var rp = require('request-promise');

var app = express();
app.use(bodyParser.json());
// app.use(bodyParser.json({ limit: '1mb' }));  //body-parser 解析json格式数据
// app.use(bodyParser.urlencoded({            //此项必须在 bodyParser.json 下面,为参数编码
//   extended: true
// }));

app.get('/', function (req, res) {
  var data;
  rp('https://dev.clschina.com/')
    .then(function (respBody) {
      data = respBody;
      console.log(respBody) // 打印google首页
      console.log('get / .... data' + data)
      res.end('hello ' + data);

    }).catch(function (err) {
      console.log('error,', err)
    })
})

app.post('/token', function (req, res) {
  var code = req.body.code
  console.log('/token....code=' + code)
  rp('https://api.weixin.qq.com/sns/jscode2session?appid=' + config.appId + '&secret=' + config.appSecret + '&js_code=' + code + '&grant_type=authorization_code')
    .then(function (body) {
      console.log('response from weixin: ' + body)
      var result = JSON.parse(body);
      if (result['openid']) {
        var openId = result['openid']
        var sessionKey = result['session_key']
        res.end(openId)
      } else {
        res.end('error:' + result['errcode'])
      }
    }).catch(function (err) {
      console.log('error while get openid', err)
      res.end('error ' + err);
    })
  
})

var server = app.listen(config.port, function () {
    console.log("listening on port: %s", config.port)
})

