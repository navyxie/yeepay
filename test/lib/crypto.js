var util = require('../../lib/util');
var config = require('../../lib/config');
var yeepayCrypto = require('../../lib/crypto');
var _ = require('underscore');
var should = require('should');
var port = 8007;
var host = "http://192.168.1.120:"+port;
var testData = {
	orderid:"abcdefg1524316ha",
	transtime:1429003138,
	amount:2,
	identityid:'12345678abcefgds',
	userip:'172.17.253.112',
	userua:'NokiaN70/3.0544.5.1 Series60/2.8 Profile/MIDP-2.0 Configuration/CLDC-1.1',
	callbackurl:host+"/yp_callback",
	fcallbackurl:host+"/yp_finish"
}
var RSASIGN = "zKl92h8uhUnnvXnKsO+b1gIWZhSRessYfLU9K4kdt7S8YN1+KkyrL09qjoqEuN1IYKNuu1w5ILCPTzVzYDQw1mba/ttdWhtVps+iqMow3kfGdA++NaX3r0egXCvaSm6AbU0Qrdol2K9CgwWMlmmyCHSO01VPY/MJQ/2NmtTS4wA=";
describe('test crypto api',function(){
	//获取签名
	describe('#getRSASign()',function(){
		it('RSASIGN must be equal constant RSASIGN',function(){
			var queryObj = _.extend(util.getDefaultConfig(config),testData);
			queryObj = util.pickWebPayKeys(queryObj);
			yeepayCrypto.getRSASign(queryObj,config.merchantPrivateKey).should.be.equal(RSASIGN);		
		});
	});
	//验证易宝返回数据的合法性
	describe('#RSAVerify()',function(){
		var verifyData = { 
			amount: 2,
			bank: '建设银行',
			bankcode: 'CCB',
			cardtype: 1,
			lastno: '7533',
			merchantaccount: 'YB01000000144',
			orderid: 'camdffhiocgijamg',
			sign: 'OMqXbaupWsyN+Or+l/lxfIaOQ7dxaGg477lUJ94jTWuS7KsKZfgZJe3oh8XlgGsqdgg7F/8tuKZFwEvG0+MEMHpzPPEmsFss8LWMa5gh+Hgb8+zqx0ivS7TQ3xsdybFm87YJFgLgL55cIPDtQS/41zfd7UOdqNCAemHC5fWe6pU=',
			status: 1,
			yborderid: '411504146514509569'
		}
		var sign = verifyData.sign;
		it('RSAVerify return must be true',function(){
			yeepayCrypto.RSAVerify(verifyData,sign,yeepayCrypto.getRSAPublicKey(config.yeepayPublicKey)).should.be.ok;		
		});
	});
	describe('#enEAS()',function(){
		it('should not be ok!',function(){
			yeepayCrypto.enEAS('navytest','asdasdasd').should.be.not.ok();
		})
	});
	describe('#deEAS()',function(){
		it('should not be ok!',function(){
			yeepayCrypto.deEAS('navytest','asdasdasd').should.be.not.ok();
		})
	});
	describe('#decryptKey()',function(){
		it('should not be ok!',function(){
			yeepayCrypto.decryptKey('navytest','asdasdasd').should.be.not.ok();
		})
	})
})