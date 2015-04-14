yeepay-易宝支付 SDK

=======

###  use case

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
			var parseData = payInstance.parseReturn(data,encryptkey);
			if(parseData.code == 0){
				res.send('恭喜，成功购买考拉理财产品。<br />'+JSON.stringify(parseData));
			}else{
				res.send(parseData.msg);
			}
		});
		// pay callback page async
		app.post('/yp_callback',function(req,res){
			//req.body->   code:0 is success.
			console.log(req.body);
			res.send('ok');
		});
		app.listen(port);
		console.log('app listen on '+port);