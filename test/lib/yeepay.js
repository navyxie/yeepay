var request = require('request');
var yeepay = require('../../lib/yeepay');
describe('test yeepay pay',function(){
	var payInstance = new yeepay();
	var port = 8007;
	var host = "http://192.168.1.120:"+port;
	var testData = {
		orderid:payInstance.generateAESKey(16),
		transtime:parseInt(Date.now()/1000),
		amount:2,
		identityid:'12345678abcefgdc',
		userip:'172.17.253.112',
		userua:'NokiaN70/3.0544.5.1 Series60/2.8 Profile/MIDP-2.0 Configuration/CLDC-1.1',
		callbackurl:host+"/yp_callback",
		fcallbackurl:host+"/yp_finish"
	}
	describe('request yeepay pay api',function(){
		var redirectUrl = "";
		before(function(){
			redirectUrl = payInstance.webPay(testData); 
		});
		it('should return ok when the response body is not contain 支付失败',function(done){
			var headers = {
				"Host":"mobiletest.yeepay.com",
				"Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
				"Accept-Encoding":"gzip, deflate, sdch",
				"Accept-Language":"zh-CN,zh;q=0.8,en;q=0.6,nl;q=0.4",
				"Connection":"keep-alive",
				"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/41.0.2272.76 Chrome/41.0.2272.76 Safari/537.36"
			};
			this.timeout(15000);
			console.log('yeepay pay url:'+redirectUrl);
			request.get({url:redirectUrl,headers:headers},function(err,httpResponse,body){
				// console.log('body:'+body);
				if(err){
					return done(err);
				}
				if(httpResponse.statusCode !== 200){
					return done({statusCode:httpResponse.statusCode});
				}
				if(/支付失败/.test(body)){
					return done({msg:"支付失败"});
				}
				return done();
			})
		})
	})
});