var config = require('./config');
var _ = require('underscore');
var yeepayCrypto = require('./crypto'); 
var JSONbig = require('json-bigint');
var util = require('./util');
/**
 * 易宝支付类
 * @param object customConfig
 */

function yeePay(customConfig){
	this.config = config;
	if(util.isNotEmptyObj(customConfig)){
		for(var key in customConfig){
			if(customConfig.hasOwnProperty(key)){
				this.config[key] = customConfig[key];
			}
		}
	}
	this.account = this.config['merchantaccount'];
	this.merchantPublicKey = this.config['merchantPublicKey'];
	this.merchantPrivateKey = this.config['merchantPrivateKey'];
	this.yeepayPublicKey = this.config['yeepayPublicKey'];
	this.AESKey = '';
	this.AES = '';
}


/**
 * 获取默认配置
 * 
 * @return object
 */
yeePay.prototype.getDefaultConfig = function(){
	var thisConfig = this.config;
	return {
		merchantaccount:thisConfig.merchantaccount,
		currency:thisConfig.currency,
		productcatalog:thisConfig.productcatalog,
		productname:thisConfig.productname,
		productdesc:thisConfig.productdesc,
		identitytype:thisConfig.identitytype,
		terminaltype:thisConfig.terminaltype,
		terminalid:thisConfig.terminalid,
		callbackurl:thisConfig.callbackurl,
		fcallbackurl:thisConfig.fcallbackurl
	}
}
/**
 * 返回移动终端通用网页支付跳转URL地址
 * 
 * @param string order_id
 * @param string transtime
 * @param int amount
 * @param string product_catalog
 * @param string identity_id
 * @param int identity_type
 * @param string user_ip
 * @param string callbackurl
 * @param int currency
 * @param string product_name
 * @param string product_desc
 * @param string other
 * @return string
 */
yeePay.prototype.webPay = function(obj){
	//obj is Object,must need key:orderid,transtime,amount,identityid,userip,userua
	if(util.isNotEmptyObj(obj)){
		if(!util.checkParam(obj)){
			return null;
		}
		var queryObj = _.extend(util.getDefaultConfig(this.config),obj);
		queryObj = util.pickWebPayKeys(queryObj);
		return this.getUrl(config.YEEPAY_MOBILE_API,'pay/request',queryObj);
	}
	return null;
}

/**
* 返回请求URL地址
* @param string $type
* @param string $method
* @param array $query
* @return string
*/

yeePay.prototype.getUrl = function(type,method,query){
	query = this.buildRequest(query);
	var url = this.getAPIUrl(type,method);
	url += '?' + util.jsonToSearch(query);
	return url;
}

/**
* 创建提交到易宝的最终请求
* 
* @param array $query
* @return array
*/

yeePay.prototype.buildRequest = function(query){
	var sign = this.RSASign(query);
	query['sign'] = sign;
	var merchantaccount = this.account;
	var request = {
		merchantaccount:this.account,
		encryptkey:encodeURIComponent(this.getEncryptkey()),
		data:encodeURIComponent(this.AESEncryptRequest(query))
	}
	return request;
}

/**
* 根据请求类型不同，返回完整API请求地址
* 
* @param int $type
* @param string $method
* @return string
*/

yeePay.prototype.getAPIUrl = function(type,method){
	if(type == config.YEEPAY_MERCHANT_API){
		return config.API_Merchant_Base_Url + method;
	}else if(type == config.YEEPAY_MOBILE_API){
		return config.API_Mobile_Pay_Base_Url + method;
	}else if(type == config.YEEPAY_PC_API){
		return config.API_PC_Pay_Base_Url + method;
	}else{
		return config.API_Pay_Base_Url + method;	
	}	
}
/**
 * 用RSA 签名请求
 * 
 * @param object obj
 * @return string
 */
yeePay.prototype.RSASign = function(obj){
	return yeepayCrypto.getRSASign(obj,this.merchantPrivateKey);
}
/**
* 通过RSA，使用易宝公钥，加密本次请求的AESKey
* 
* @return string
*/
yeePay.prototype.getEncryptkey = function(){
	if(!this.AESKey){
		this.setAESKey(this.generateAESKey());
	}
	return yeepayCrypto.getEncryptkey(this.yeepayPublicKey,this.AESKey);
}
/**
  通过RSA，解密 易宝支付成功后返回的encryptkey
* @param string key
* @return string
*/
yeePay.prototype.decryptKey = function(key){
	return yeepayCrypto.decryptKey(key,this.merchantPrivateKey)
}
/**
  通过RSA，解密 易宝支付成功后返回的encryptkey
* @param string key
* @return string
*/
yeePay.prototype.deEAS = function(data,key){
	if(!data || !key){
		return '';
	}
	return yeepayCrypto.deEAS(data,key);
}
/**
  验证易宝返回的签名
* @param object data
  @param string sign
* @return boolean
*/
yeePay.prototype.RSAVerify = function(json,sign){		
	return yeepayCrypto.RSAVerify(json,sign,yeepayCrypto.getRSAPublicKey(this.yeepayPublicKey));
}
/**
* 生成一个随机的字符串作为AES密钥
* 
* @param number $length
* @return string
*/
yeePay.prototype.generateAESKey = function(len){
	var baseString = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	len = len || 16;
	var AESKey = '';
	for(var i = 0 ; i < len ; i++){
		AESKey += baseString[parseInt(Math.random()*(len-1))];
	}
	this.AESKey = AESKey;
	return AESKey;
}
/**
* 通过AES加密请求数据
* 
* @param array $query
* @return string
*/
yeePay.prototype.AESEncryptRequest = function(obj){
	if(!this.AESKey){
		this.setAESKey(this.generateAESKey());
	}
	return yeepayCrypto.enEAS(JSON.stringify(obj).replace(/[\/]/g,'\\/'),this.AESKey);
}
/**
* 设置AESKey
* 
* @param string key
* @return string
*/
yeePay.prototype.setAESKey = function(key){
	this.AESKey = key;
}
/**
*支付专用的解析接口
* 解析易宝返回的数据
* @param string data
  @param string encryptkey
* @return object
*/
yeePay.prototype.parseReturn = function(data,encryptkey){
	if(!data || !encryptkey){
		return {code:-6,msg:'data,encryptkey参数不能为空'};
	}
	var easKey = this.decryptKey(encryptkey);
	var jsonStr = this.deEAS(data,easKey);
	try{
		var json = JSONbig.parse(jsonStr);
		json.yborderid = json.yborderid.toString();//tostring
		if(!json.sign){
			if(json.error_code){
				return {code:-1,msg:'error_code:'+json.error_code+',error_msg:'+json.error_msg}
			}else{
				return {code:-2,msg:"请求yeepay返回异常"}
			}
		}else{
			if(!this.RSAVerify(json,json.sign)){
				return {code:-3,msg:'请求返回签名验证失败'}
			}
		}
		if(json.error_code && !json.status){
			return {code:-4,msg:'error_code:'+json.error_code+',error_msg:'+json.error_msg,data:json}
		}
		delete json.sign;
		return {code:0,msg:'success',data:json};
	}catch(err){
		var errData = {code:-5};
		try{
			errData['data'] = JSON.parse(jsonStr);
			errData['msg'] = errData['data']['error_msg'];
		}catch(err){
			errData['data'] = jsonStr;
			errData['msg'] = jsonStr;
		}
		return errData;
	}
}
//签名认证
yeePay.prototype.verify = function(data,encryptkey){
	var easKey = this.decryptKey(encryptkey);
	var jsonStr = this.deEAS(data,easKey);
	try{
		var json = JSONbig.parse(jsonStr);
		json.yborderid = json.yborderid.toString();//tostring
		if(!json.sign){
			return false;
		}else{
			if(!this.RSAVerify(json,json.sign)){
				return false;
			}
		}
		if(json.error_code && !json.status){
			return false;
		}
		delete json.sign;
		return json;
	}catch(err){
		return false;
	}
}
//订单已成功支付
yeePay.prototype.paySuccess = function(data,cbf){
	var code = 0,msg = 'ok';
	if(!_.isObject(data)){
		msg = 'yeepay SDK log : the param must be object.';
		console.warn(msg);
		return cbf(msg);
	}
	if(!data.data || !data.encryptkey){
		msg = '参数不全，需要data&encryptkey参数';
		return cbf(msg);
	}
	var encryptdata = data.data, encryptkey = data.encryptkey;
	var verifyData = this.verify(encryptdata,encryptkey);
	if(!verifyData){
		msg = '验签不通过';
		return cbf(msg);
	}
	if(verifyData.status !== 1){
		code = 1,msg = '未支付成功，请勿执行订单更新操作。';
	}
	cbf(null,{code:code,msg:msg,data:verifyData});		
}
yeePay.prototype.getStopNotifyData = function(){
	return 'success';
}
/**
*  通用的返回数据的解析接口
*  解析易宝返回的数据
* 
* @param string data
  @param string encryptkey
* @return object
*/
yeePay.prototype.parseCommon = function(data,encryptkey){
	var easKey = this.decryptKey(encryptkey);
	var jsonStr = this.deEAS(data,easKey);
	try{
		var json = JSON.parse(jsonStr);
		if(!json.sign){
			if(json.error_code){
				return {code:-1,msg:'error_code:'+json.error_code+',error_msg:'+json.error_msg}
			}else{
				return {code:-2,msg:"请求yeepay返回异常"}
			}
		}else{
			if(!this.RSAVerify(json,json.sign)){
				return {code:-3,msg:'请求返回签名验证失败'}
			}
		}
		if(json.error_code && !json.status){
			return {code:-4,msg:'error_code:'+json.error_code+',error_msg:'+json.error_msg,data:json}
		}
		delete json.sign;
		return {code:0,msg:'success',data:json};
	}catch(err){
		var errData = {code:-5};
		try{
			errData['data'] = JSON.parse(jsonStr);
			errData['msg'] = errData['data']['error_msg'];
		}catch(err){
			errData['data'] = jsonStr;
			errData['msg'] = jsonStr;
		}
		return errData;
	}
}
/**
* 处理用户提现接口
* @param object obj
* @return function cb
*/
yeePay.prototype.withdraw = function(obj,cb){
	//obj is Object,must need key:'requestid','identityid','cardno','amount','userip','ua'
	var msg = '参数不全，请检查参数:requestid,identityid,cardno,amount,userip,ua';
	if(util.isNotEmptyObj(obj)){
		if(!util.checkWithdrawParam(obj)){
			return cb(msg);
		}
		var cardno = obj.cardno;
		var card_top = cardno.slice(0,6);
		var cardLen = cardno.length
		var card_last = obj.cardno.substring(cardLen-4);
		var queryObj = _.extend(this.getWithdrawDefaultConfig(this.config),obj);
		queryObj = util.pickWithdrawKeys(queryObj);
		queryObj['card_top'] = card_top;
		queryObj['card_last'] = card_last;
		queryObj['sign'] = this.RSASign(queryObj);
		this._post(queryObj,this.config.API_TZT_withdraw_Base_Url,cb);
	}else{
		return cb(msg);
	}	
}
/**
 * 获取处理用户提现默认配置
 * @return object
 */
yeePay.prototype.getWithdrawDefaultConfig = function(){
	var thisConfig = this.config;
	return {
		merchantaccount:thisConfig.merchantaccount,
		currency:thisConfig.currency,
		drawtype:thisConfig.drawtype,
		identitytype:thisConfig.identitytype
	}
}
yeePay.prototype._post = function(obj,url,cb){
	obj.merchantaccount = obj.merchantaccount || this.getDefaultConfig().merchantaccount;
	obj.sign = this.RSASign(obj);
	var requestData = {
		merchantaccount:obj.merchantaccount,
		encryptkey:(this.getEncryptkey()),
		data:(this.AESEncryptRequest(obj))
	}
	var request = require('request');
	request.post({url:url,form:requestData},function(error, response, body){
		if(!error && response.statusCode === 200){
			cb(null,JSON.parse(body));
		}else{
			cb(error, response, body);
		}	
	})
}
/**
* 用户提现接口查询
* @param object obj
* @return function cb
*/
yeePay.prototype.drawRecord = function(obj,cb){
	//obj is Object,must need key:'requestid','ybdrawflowid'
	var msg = '参数不全，请检查参数:requestid,ybdrawflowid';
	if(util.isNotEmptyObj(obj)){
		if(!obj.requestid && !obj.ybdrawflowid){
			return cb(msg);
		}
		var queryObj = _.extend(this.getWithdrawDefaultConfig(this.config),obj);
		queryObj = util.pickQueryWithdrawKeys(queryObj);
		queryObj['sign'] = this.RSASign(queryObj);
		var request = {
			merchantaccount:queryObj.merchantaccount,
			encryptkey:encodeURIComponent(this.getEncryptkey()),
			data:encodeURIComponent(this.AESEncryptRequest(queryObj))
		}
		var url =  this.config.API_TZT_Drawrecord_Base_Url+'?'+util.jsonToSearch(request);
		this.doQuery(url,cb);
	}else{
		return cb(msg);
	}	
}
/**
* 通用接口,订单查询
* @param object obj
* @return function cb
*/
yeePay.prototype.queryOrder = function(obj,cb){
	//obj is Object,must need key:'orderid'
	var msg = '参数不全，请检查参数:orderid';
	if(util.isNotEmptyObj(obj)){
		if(!util.checkQueryOrderParam(obj)){
			return cb(msg);
		}
		var queryObj = _.extend(this.getWithdrawDefaultConfig(this.config),obj);
		queryObj = util.pickQueryOrderKeys(queryObj);
		queryObj['sign'] = this.RSASign(queryObj);
		var request = {
			merchantaccount:queryObj.merchantaccount,
			encryptkey:encodeURIComponent(this.getEncryptkey()),
			data:encodeURIComponent(this.AESEncryptRequest(queryObj))
		}
		var url =  this.config.API_TZT_Paysingle_Base_Url+'?'+util.jsonToSearch(request);
		this.doQuery(url,cb);
	}else{
		return cb(msg);
	}	
}
/**
* 通用接口查询
* @param object obj
* @return function cb
*/
yeePay.prototype.authBind = function(obj,cb){
	//obj is Object,must need key:'orderid','yborderid'
	var msg = '参数不全，请检查参数:identityid';
	if(util.isNotEmptyObj(obj)){
		if(!util.checkQueryAuthBindParam(obj)){
			return cb(msg);
		}
		var queryObj = _.extend(this.getWithdrawDefaultConfig(this.config),obj);
		queryObj = util.pickQueryAuthbindKeys(queryObj);
		queryObj['sign'] = this.RSASign(queryObj);
		var request = {
			merchantaccount:queryObj.merchantaccount,
			encryptkey:encodeURIComponent(this.getEncryptkey()),
			data:encodeURIComponent(this.AESEncryptRequest(queryObj))
		}
		var url =  this.config.API_TZT_AuthBind+'?'+util.jsonToSearch(request);
		this.doQuery(url,cb);
	}else{
		return cb(msg);
	}	
}
/**
*解析不需要认证的数据接口
*/
yeePay.prototype.parseNotAuthSign = function(data,encryptkey){
	var easKey = this.decryptKey(encryptkey);
	var jsonStr = this.deEAS(data,easKey);
	try{
		var json = JSON.parse(jsonStr);
		if(!json.sign){
			if(json.error_code){
				return {code:-1,msg:'error_code:'+json.error_code+',error_msg:'+json.error_msg}
			}else{
				return {code:-2,msg:"请求yeepay返回异常"}
			}
		}
		if(json.error_code && !json.status){
			return {code:-4,msg:'error_code:'+json.error_code+',error_msg:'+json.error_msg}
		}
		delete json.sign;
		return {code:0,msg:'success',data:json};
	}catch(err){
		var errData = {code:-5};
		errData['err'] = jsonStr;
		errData['msg'] = jsonStr;
		return errData;
	}
}
/**
 * 处理查询,Get 请求
 * @param url,查询的url
 * @return object
 */
yeePay.prototype.doQuery = function(url,cb){
	var request = require('request');
	request.get({url:url},function(error, response, body){
		if(!error && response.statusCode === 200){
			cb(null,JSON.parse(body));
		}else{
			cb(error, response, body);
		}	
	})
}
//商户交互页面,让用户输入卡信息后,先调用本接口检查是否为有效的银行卡(但并不代表是投资通支持的银行卡,投资通支持的银行卡请见附录),然后再进行支付请求,以提高支付成功率。
yeePay.prototype.bankcardCheck = function(cardno,cb){
	if(!cardno){
		cb('银行卡不能为空');
	}
	var config = this.getDefaultConfig();
	var query = {
		merchantaccount:config.merchantaccount,
		cardno:cardno
	}
	this._post(query,this.config.API_TZT_Check_Bankcard,cb);
}
//绑卡请求接口
yeePay.prototype.invokebindbankcard = function(obj,cb){
	var config = this.getDefaultConfig();
	obj.merchantaccount = config.merchantaccount;
	obj.identitytype = config.identitytype;
	this._post(obj,this.config.API_TZT_invokebindbankcard,cb);
}
//确定绑卡接口
yeePay.prototype.confirmbindbankcard = function(obj,cb){
	var config = this.getDefaultConfig();
	obj.merchantaccount = config.merchantaccount;
	this._post(obj,this.config.API_TZT_confirmbindbankcard,cb);
}
//解绑卡接口
yeePay.prototype.unbindbankcard = function(obj,cb){
	var config = this.getDefaultConfig();
	obj.merchantaccount = config.merchantaccount;
	obj.identitytype = config.identitytype;
	this._post(obj,this.config.API_TZT_bankcard_unbind,cb);
}
//可提现余额接口
yeePay.prototype.drawvalidamount = function(cb){
	var config = this.getDefaultConfig();
	var queryObj = {merchantaccount:config.merchantaccount};
	queryObj['sign'] = this.RSASign(queryObj);
	var request = {
		merchantaccount:queryObj.merchantaccount,
		encryptkey:encodeURIComponent(this.getEncryptkey()),
		data:encodeURIComponent(this.AESEncryptRequest(queryObj))
	}
	var url =  this.config.API_TZT_drawvalidamount+'?'+util.jsonToSearch(request);
	this.doQuery(url,cb);
}
module.exports = yeePay;