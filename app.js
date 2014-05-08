
/**
 * Module dependencies.
 */

var express = require('express');
var weixin = require('./routes/weixin');

var index = require('./routes/index');
var http = require('http');
var path = require('path');
var ejs = require('ejs');
var fs = require('fs');
var accessLogfile = fs.createWriteStream('access.log', {flags: 'a'});
var errorLogfile = fs.createWriteStream('error.log', {flags: 'a'});


var app = express();

// all environments
app.set('port', process.env.PORT || 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.logger({stream: accessLogfile}));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


weixin.set('订阅提示信息', {
  pattern: function(info) {
    return info.is('event') && info.param.event === 'subscribe';
  },
  handler: function(info) {
    return '/::)，欢迎订阅会达监控预警！\n通过【h】了解使用帮助';
  }
});

weixin.set('帮助', {
  pattern: '=h',
  handler: function(info, next) {
	  return next(null,'【1】:  我关注的指标\n【2】:  我关注的记分卡\n【3】:  我关注的目标\n【4】:  指标分析');
  }
});


weixin.set('我关注的记分卡', {
  pattern: '=2',
  handler: function(info, next) {
	  console.log(info.text);
	  return next(null,'敬请期待！');
  }
});

weixin.set('=3', {  type: 'news',
  text: 'http://example.com/a.mp3'

});

weixin.set('指标分析', {
  pattern: '=4',
  handler: function(info, next) {
	  console.log(info.text);
	  return next(null,'敬请期待！');
  }
});

weixin.set('your name', {
  pattern: /^(?:my name is|i am|我(?:的名字)?(?:是|叫)?)\s*(.*)$/i,
  handler: '你好,{1}'
});

weixin.dialog({
  'hello': '哈哈哈',
  'hi': ['好吧', '你好']
});




app.use(express.query());
app.use('/', weixin.wechat('FHD_SM', function (req, res, next) {
  // 微信输入信息都在req.weixin上
  var message = req.weixin;
  if (message.Content === '夏丹' || message.Content === '于鹏' ) {
    // 回复屌丝(普通回复)
    res.reply('屌丝');
  } else if (message.FromUserName === 'text') {
    //你也可以这样回复text类型的信息
    res.reply({
      content: 'text object',
      type: 'text'
    });
  } else if (message.FromUserName === 'hehe') {
    // 回复一段音乐
    res.reply({
      title: "来段音乐吧",
      description: "一无所有",
      musicUrl: "http://mp3.com/xx.mp3",
      hqMusicUrl: "http://mp3.com/xx.mp3"
    });
  } else if (message.Event === 'subscribe') {
    // 回复高富帅(图文回复)
    res.reply([
      {
        title: '风险监控预警',
        description: '这是一个神一样的系统',
        picurl: 'http://42.96.173.154/images/banner5.jpg',
        url: 'http://42.96.173.154/login'
      }
    ]);
  } else if (message.Content === 's') {
    // 回复高富帅(图文回复)
    res.reply([
      {
        title: '风险监控预警',
        description: '这是一个神一样的系统',
        picurl: 'http://42.96.173.154/images/banner5.jpg',
        url: 'http://42.96.173.154/login'
      }
    ]);
  }  else if (message.Content === '1') {
    // 回复高富帅(图文回复)
    res.reply([
      {
        title: '库存平均水平',
        description: '红色预警',
        picurl: 'http://42.96.173.154/images/3.png',
        url: 'http://42.96.173.154/login'
      },{
        title: '库存周转率',
        description: '黄色预警',
        picurl: 'http://www.firsthuida.com:5001/fhdys/images/icons/symbol_5_lrg.gif',
        url: 'http://42.96.173.154/bar'
      },{
        title: '资产负债率',
        description: '黄色预警',
        picurl: 'http://www.firsthuida.com:5001/fhdys/images/icons/symbol_5_lrg.gif',
        url: 'http://42.96.173.154/polarArea'
      },{
        title: '成本费用率',
        description: '黄色预警',
        picurl: 'http://www.firsthuida.com:5001/fhdys/images/icons/symbol_6_lrg.gif',
        url: 'http://42.96.173.154/doughnut'
      },{
        title: '存货占营业收入比重',
        description: '黄色预警',
        picurl: 'http://www.firsthuida.com:5001/fhdys/images/icons/symbol_4_lrg.gif',
        url: 'http://42.96.173.154/line'
      }
    ]);
  } else {
	var info = weixin.normInfo(req.weixin);

    info.req = req;
    info.res = res;
    info.session = req.wxsession;

    weixin.reply(info, function(err, info) {
      if (info.noReply === true) {
        res.statusCode = 204;
        res.end();
        return;
      }
      var reply = info.reply;
      if (typeof reply === 'object' && !reply.type && !Array.isArray(reply)) {
        reply = [reply];
      }
      res.reply(reply, info.flag);
    });
  }
}));


//weixin.watch(app, { token: 'FHD_SM', path: '/' });


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.get('/login', index.login);
app.post('/login', index.doLogin);

app.get('/line', index.line);

app.get('/doughnut', index.doughnut);
app.get('/bar', index.bar);
app.get('/polarArea', index.polarArea);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
