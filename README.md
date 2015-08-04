# yeepay-易宝支付 SDK

## 易宝支付回调
> 异步回调是post请求，以字节流的方式回送数据。
> 成功支付的同步回调是get请求，同时带有data和encryptkey参数。
> 支付失败同步回调是get请求，不带有data和encryptkey参数。

## API

[webPay](#webPay)

[queryOrder](#queryOrder)

[paySuccess](#paySuccess)

[getStopNotifyData](#getStopNotifyData)

[withdraw](#withdraw)

[drawRecord](#drawRecord)

[authBind](#authBind)

[bankcardCheck](#bankcardCheck)

[invokebindbankcard](#invokebindbankcard)

[confirmbindbankcard](#confirmbindbankcard)

[unbindbankcard](#unbindbankcard)

[drawvalidamount](#drawvalidamount)

<a name="webPay" />

创建订单，异步回调数据解析以及同步回调数据解析

```js
var express = require('express');
var app = express();
var yeepay = require('yeepay');
var url = require('url');
var port = 8007;
var host = "http://192.168.1.120:"+port;
// respond with "hello world" when a GET request is made to the homepage
app.get('/', function(req, res) {
  res.send('hello world');
});
// test data
var testData = {
	orderid:orderid,
	transtime:parseInt(Date.now()/1000),
	amount:2,
	identityid:'12345678abcefgds',
	userip:'172.17.253.112',
	userua:'NokiaN70/3.0544.5.1 Series60/2.8 Profile/MIDP-2.0 Configuration/CLDC-1.1',
	callbackurl:host+"/yp_callback",
	fcallbackurl:host+"/yp_finish",
	// idcardtype:"01",//易宝建议p2p平台支付的时候需要带上，处于安全考虑
	// idcard:"440****4195",//易宝建议p2p平台支付的时候需要带上，处于安全考虑
	// owner:'**军'//易宝建议p2p平台支付的时候需要带上，处于安全考虑
}
var payInstance = new yeepay();
// create order ,if success ,will redirect to yeepay pay's page
app.get('/webpay',function(req,res){
	var orderid = payInstance.generateAESKey(16);
	var redirectUrl = payInstance.webPay(testData);
	res.send(redirectUrl+'<script type="text/javascript">setTimeout(function(){var a = document.createElement("a");if(!a.click) {window.location = "'+redirectUrl+'";return;}a.setAttribute("href", "'+redirectUrl+'");a.style.display = "none";document.body.appendChild(a);a.click();},3000)<\/script>');
});
// pay finish page,sync
app.get('/yp_finish',function(req,res){
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	var encryptkey = query.encryptkey;	
	var data = query.data;
	payInstance.paySuccess({data:data,encryptkey:encryptkey},function(err,result){
		if(!err && data.code === 0){
			//同步处理成功
			//data
			{ 
				code: 0,
				msg: 'ok',
				data: 
				{ 
					amount: 1,//订单金额,以"分"为单位的整型
					bank: '建设银行',//银行名称
					bankcode: 'CCB',//银行缩写
					cardtype: 1,//支付卡的类型,1 为借记卡,2 为信用卡
					lastno: '',//支付的银行卡号
					merchantaccount: '',//商户账户编号
					orderid: '',//商户交易订单
					status: 1,//0:待付,1:已付,2:已撤销,3:阻断交易
					yborderid: ''//易宝流水号
				} 
			}
		}
	});
});
// pay callback page async
// 易宝异步回调处理
app.post('/yp_callback',function(req,res){
	var body = '';
	req.on('data',function(chunk){
		//console.log(Buffer.isBuffer(chunk))
		body += chunk
	});
	req.on('end',function(){
		console.log(body);
		//body的值:  data=2WDFjaiSBQUMVAAyI%2F3WceeXYep%2F5jjZkGVjokcWHmlNE%2BTj7PYj7CbFG08sISGle%2Bdjt57gxlJNInMi12BcgdUp8t7GRZGtuJX%2F4lJNRdmAQFwDGjD9CQl%2FxM1VYpdig%2FEloRArbvmlI8EQ%2BrJp5uMnRbUykcZx8uZY9eNKs0GWvUMUEk0nJ7ivpcJdjZ0lveFTr4hj7nn7%2BRaHhNPpvGilJIjz%2F4%2BpRMaH8osApF%2FpcFEx2QwuSriBFaQp5v9mJ11MQVOWTiZZU6j0%2FTimXpHNnXC0qfvtrWSC5%2BVZ82B%2BIyHnlRNkc6JsR8EsESkjMe0S58ikcxmYnv7EBuf0IXOz2wai8DPeZYnC4c43hzWi5rxLsAQTvtK%2BEAKy6bZtl%2FtTEVNYxKP82PeWix2bax7z%2FqCHw8J0UJ40JvYqrW6tuEIIXoVkMDBAAq9umDS0I%2BTTe%2FEg4V%2FPUs%2FREYsdUS3tmelDty%2Fmstc7tgUXNUBHt5PPfBLeL9oJXUuQlAtB&encryptkey=JusH9eWW4KelVHLi77IHpj4vo4TgDnis2QVAmkDCqwYCSeQgjWGVgIfVvJDD61HodAMUdZf4ivvTbvadbyEkmysqzcUrzFCGR1lqC1ZhaakmgeYUefn8OPrykB4V4jSkbuQKnLBNAWvkTPG6nBQW5mohz48yqI8RcedCDnGjrv0%3D
		payInstance.paySuccess({data:body[0].split('=')[1],encryptkey:body[1].split('=')[1]},function(err,data){
			if(!err && data.code === 0){
				//已完成支付可执行订单更新或者发货了
				//data
				{ 
					code: 0,
					msg: 'ok',
					data: 
					{ 
						amount: 1,//订单金额,以"分"为单位的整型
						bank: '建设银行',//银行名称
						bankcode: 'CCB',//银行缩写
						cardtype: 1,//支付卡的类型,1 为借记卡,2 为信用卡
						lastno: '',//支付的银行卡号
						merchantaccount: '',//商户账户编号
						orderid: '',//商户交易订单
						status: 1,//0:待付,1:已付,2:已撤销,3:阻断交易
						yborderid: ''//易宝流水号
					} 
				}
			}
		});
  	})
});
app.listen(port);
console.log('app listen on '+port);
```

<a name="queryOrder" />

订单查询接口

```js
payInstance.queryOrder({
	orderid:"订单id"
},function(err,data){
	//交易记录查询
	data =>{
		code: 0,
		msg: 'success',
		data:{
			amount: 700,
			bank: "农业银行",
			bankcardtype: 1,
			bankcode: "ABC",
			cardno: "622************9577",
			closetime: 1433372844,
			currency: 156,
			merchantaccount: "***",
			orderid: "1234567700244123373146",
			ordertime: 1433372758,
			productcatalog: 30,
			productdesc: "考拉理财,开启懒人理财生活。",
			productname: "考拉理财",
			refundtotal: 0,
			sourceamount: 700,
			sourcefee: 0,
			status: 1,//0:待付,1:已付,2:已撤销,3:阻断交易.交易成功以判断status为1为准
			targetamount: 700,
			targetfee: 0,
			type: 1,
			yborderid: ""
		}
	}
});
```

<a name="paySuccess" />

异步或者同步回调进行数据解析的函数，判断是否支付成功

```js
payInstance.paySuccess({
	data:"2WDFjaiSBQUMVAAyI%2F3WceeXYep%2F5jjZkGVjokcWHmlNE%2BTj7PYj7CbFG08sISGle%2Bdjt57gxlJNInMi12BcgdUp8t7GRZGtuJX%2F4lJNRdmAQFwDGjD9CQl%2FxM1VYpdig%2FEloRArbvmlI8EQ%2BrJp5uMnRbUykcZx8uZY9eNKs0GWvUMUEk0nJ7ivpcJdjZ0lveFTr4hj7nn7%2BRaHhNPpvGilJIjz%2F4%2BpRMaH8osApF%2FpcFEx2QwuSriBFaQp5v9mJ11MQVOWTiZZU6j0%2FTimXpHNnXC0qfvtrWSC5%2BVZ82B%2BIyHnlRNkc6JsR8EsESkjMe0S58ikcxmYnv7EBuf0IXOz2wai8DPeZYnC4c43hzWi5rxLsAQTvtK%2BEAKy6bZtl%2FtTEVNYxKP82PeWix2bax7z%2FqCHw8J0UJ40JvYqrW6tuEIIXoVkMDBAAq9umDS0I%2BTTe%2FEg4V%2FPUs%2FREYsdUS3tmelDty%2Fmstc7tgUXNUBHt5PPfBLeL9oJXUuQlAtB",
	encryptkey:"JusH9eWW4KelVHLi77IHpj4vo4TgDnis2QVAmkDCqwYCSeQgjWGVgIfVvJDD61HodAMUdZf4ivvTbvadbyEkmysqzcUrzFCGR1lqC1ZhaakmgeYUefn8OPrykB4V4jSkbuQKnLBNAWvkTPG6nBQW5mohz48yqI8RcedCDnGjrv0%3D"
},function(err,data){
	if(!err && data.code === 0){
		//已完成支付可执行订单更新或者发货了
		//data
		{ 
			code: 0,
			msg: 'ok',
			data: 
			{ 
				amount: 1,//订单金额,以"分"为单位的整型
				bank: '建设银行',//银行名称
				bankcode: 'CCB',//银行缩写
				cardtype: 1,//支付卡的类型,1 为借记卡,2 为信用卡
				lastno: '',//支付的银行卡号
				merchantaccount: '',//商户账户编号
				orderid: '',//商户交易订单
				status: 1,//0:待付,1:已付,2:已撤销,3:阻断交易
				yborderid: ''//易宝流水号
			} 
		}
	}
});
```

<a name="getStopNotifyData" />

获取终止异步回调的相应字符串

**注：当向yeepay发送字符串时，代表商户已经成功处理回调，yeepay将终止异步回调。**

```js
//wap异步回调数据
res.send(payInstance.getStopNotifyData());
```

<a name="withdraw" />

处理用户提现接口

```js
payInstance.withdraw({
	'requestid':'',
	'identityid':'',
	'cardno':'',
	'amount':100,
	'userip':'0.0.144.241',
	'ua':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/41.0.2272.76 Chrome/41.0.2272.76 Safari/537.36'
},function(err,body){
	if(err){
		res.send(err);
	}else{
		var parseData = payInstance.parseCommon(body.data,body.encryptkey);
	}
})
```

<a name="drawRecord" />

用户提现接口查询

```js
payInstance.drawRecord({
	requestid:'',
	ybdrawflowid:''
},function(err,body){
	if(err){
		res.send(err);
	}else{
		var parseData = payInstance.parseCommon(body.data,body.encryptkey);
		res.json(200,parseData);
	}
})
```

<a name="authBind" />

绑卡查询接口

```js
payInstance.authBind({
	'identityid':'**'
},function(err,body){
	if(err){
		console.log(err);
	}else{
		data=>{ 
			code: 0,
			msg: 'success',
			data: 
			{ 
				cardlist: [
					{
						"bankcode":"",
						"bindid":"",
						"bindvalidthru":,
						"card_last":"",
						"card_name":"",
						"card_top":"",
						"merchantaccount":"",
						"phone":""
					}
				],
				identityid: '***',
				identitytype: 2,
				merchantaccount: '***' 
			} 
		}
	}
});
```	

<a name="bankcardCheck" />

检查是否为有效的银行卡	

```js
//商户交互页面,让用户输入卡信息后,先调用本接口检查是否为有效的银行卡(但并不代表是投资通
支持的银行卡,投资通支持的银行卡请见附录),然后再进行支付请求,以提高支付成功率。
payInstance.bankcardCheck('6227003300000000000',function(err,body){
	var parseData = payInstance.parseCommon(body.data,body.encryptkey);
	//parseData = > 
	// {
	// 	code: 0,
	// 	msg: "success",
	// 	data: {
	// 		bankcode: "CCB",
	// 		bankname: "建设银行",
	// 		cardno: "6227003300000000000",
	// 		cardtype: 1,//1:储蓄卡,2:信用卡,-1 未知银行卡
	// 		isvalid: 1,//0:无效卡号,1:有效的银行卡号
	// 		merchantaccount: "***"
	// 	}
	// }
	res.json(200,parseData);
})
```

<a name="invokebindbankcard" />

绑卡请求接口

```js
payInstance.invokebindbankcard({
	'identityid':"",
	'userip':'0.0.144.241',
	'requestid':'',
	'cardno':'',
	'idcardtype':'01',
	'idcardno':'',
	'username':'',
	'phone':''
	},function(err,body){
		var parseData = payInstance.parseCommon(body.data,body.encryptkey);
		console.log(parseData)
	}
)
```

<a name="confirmbindbankcard" />

确定绑卡接口

```js
payInstance.confirmbindbankcard({
	'requestid':'',
	'validatecode':'',
	},function(err,body){
	var parseData = payInstance.parseCommon(body.data,body.encryptkey);
	console.log(parseData);
})
```

<a name="unbindbankcard" />

解绑卡接口

```js
payInstance.unbindbankcard({
	'identityid':"",
	'bindid':''
},function(err,body){
	if(err){
		res.send(err);
	}else{
		var parseData = payInstance.parseCommon(body.data,body.encryptkey);
		console.log(parseData)
	}
})
```

<a name="drawvalidamount" />

可提现余额接口

```js
payInstance.drawvalidamount(
	function(err,body){
	if(err){
		console.log(err);
	}else{
		var parseData = payInstance.parseNotAuthSign(body.data,body.encryptkey);
		console.log(JSON.stringify(parseData));
	}
});
```