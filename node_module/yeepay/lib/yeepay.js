var config = require('./config');
var _ = require('underscore');
var ursa = require('ursa');
var yeepayCrypto = require('./crypto'); 
var utf8 = require('utf8');
var crypto = require('crypto');
var encoding = require('encoding');
var base64 = require('base64');
var JSONbig = require('json-bigint');
function isNotEmptyObj(val){
	return _.isObject(val) && !_.isEmpty(val)
}
/**
 * 将字符串转化为查询字符串
 * @param object json
 * @return str
*/
function jsonToSearch(json){
	var str = "";
	for(var key in json){
		if(json.hasOwnProperty(key)){
			str += key + '=' + json[key]+'&';
		}
	}
	//把最后的&去掉
	if(str){
		str = str.substring(0,str.length -1);
	}
	return str;
}
/**
 * 对象按键排序
 * @param object obj
   @param boolean desc
 * @return object
*/
function sortObjectByKey(obj,desc){
	var keys = Object.keys(obj);
	var returnObj = {};
	keys = keys.sort();
	if(desc){
		keys = keys.reverse();
	}
	for(var i = 0 , len = keys.length ; i < len ; i++){
		returnObj[keys[i]] = obj[keys[i]];
	}
	return returnObj;
}
/**
 * 拾取移动端网页支付所需参数
 * @param object obj
 * @return object
*/
function pickWebPayKeys(obj){
	//keys,详情请查看易宝文档-> http://mobiletest.yeepay.com/file/doc/pubshow?doc_id=14#ha_32
	var keys = ['merchantaccount','orderid','transtime','currency','amount','productcatalog','productname','productdesc','identityid','identitytype','terminaltype','terminalid','orderexpdate','userip','userua','callbackurl','fcallbackurl','version','paytypes','cardno','idcardtype','idcard','owner','sign','bank','orderexpdate'];
	return _.pick(obj,keys);
}

/**
 * 检测支付必填参数是否齐全
 * @param object json
 * @return object
 */
function checkParam(json){
	if(!json.orderid){
		return false;
	}
	if(!json.transtime){
		return false;
	}
	if(!json.amount){
		return false;
	}
	if(!json.identityid){
		return false;
	}
	if(!json.userip){
		return false;
	}
	if(!json.userua){
		return false;
	}
	return true;
}



/**
 * 易宝支付类
 * @param object customConfig
 */

function yeePay(customConfig){
	this.config = config;
	if(isNotEmptyObj(customConfig)){
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
	if(isNotEmptyObj(obj)){
		if(!checkParam(obj)){
			return null;
		}
		var queryObj = _.extend(this.getDefaultConfig(),obj);
		queryObj = pickWebPayKeys(queryObj);
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
	url += '?' + jsonToSearch(query);
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
 * @param array $query
 * @return string
 */
yeePay.prototype.RSASign = function(obj){
	if(obj.sign){
		delete obj.sign;
	}
	obj = sortObjectByKey(obj);
	var values = _.values(obj);
	var valStr = values.join('');
	valStr = utf8.encode(valStr);//中文字符使用UTF-8编码,see:http://mobiletest.yeepay.com/file/doc/pubshow?doc_id=19#hm_6, keyword:RSA验签
	return yeepayCrypto.getRSASign(valStr,this.merchantPrivateKey);
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
  	var crt = ursa.createPublicKey(yeepayCrypto.getRSAPublicKey(this.yeepayPublicKey));
  	return crt.encrypt(this.AESKey, 'utf8', 'base64',ursa.RSA_PKCS1_PADDING);
}
/**
  通过RSA，解密 易宝支付成功后返回的encryptkey
* @param string key
* @return string
*/
yeePay.prototype.decryptKey = function(key){
	key = decodeURIComponent(key);
	key = base64.decode(key);//易宝要求必须进行base64解码才能得到正确的解密 eas key
	var pem = ursa.createPrivateKey(yeepayCrypto.getRSAPrivateKey(this.merchantPrivateKey));
	return pem.decrypt(key, 'binary', 'utf8', ursa.RSA_PKCS1_PADDING);
}
/**
  通过RSA，解密 易宝支付成功后返回的encryptkey
* @param string key
* @return string
*/
yeePay.prototype.deEAS = function(data,key){
	data = decodeURIComponent(data);
	data = base64.decode(data);
	return yeepayCrypto.deEAS(data,key);
}
/**
  解析易宝返回的数据
* @param string data
  @param string encryptkey
* @return object
*/
yeePay.prototype.parseReturn = function(data,encryptkey){
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
			return {code:-4,msg:'error_code:'+json.error_code+',error_msg:'+json.error_msg}
		}
		delete json.sign;
		return {code:0,msg:'success',data:json};
	}catch(err){
		return {code:-5,msg:err}
	}
}
/**
  验证易宝返回的签名
* @param object data
  @param string sign
* @return boolean
*/
yeePay.prototype.RSAVerify = function(json,sign){
	delete json.sign;
	json = sortObjectByKey(json);
	var values = _.values(json);
	var valStr = values.join('');
	valStr = utf8.encode(valStr);//中文字符使用UTF-8编码,see:http://mobiletest.yeepay.com/file/doc/pubshow?doc_id=19#hm_6, keyword:RSA验签
	return yeepayCrypto.RSAVerify(valStr,sign,yeepayCrypto.getRSAPublicKey(this.yeepayPublicKey));
}
/**
* 生成一个随机的字符串作为AES密钥
* 
* @param number $length
* @return string
*/
yeePay.prototype.generateAESKey = function(){
	var baseString = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	var AESKey = '',len = 16;
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
* 验证结果是否从易宝返回
* 
* @param string data
* @param string encryptkey
* @return boolean
*/
yeePay.prototype.verifySign = function(data,encryptkey){
	var key = new NodeRSA(yeepayCrypto.getRSAPrivateKey(this.merchantPrivateKey));
  	var yibaoAESKey = key.decrypt(encryptkey,'base64');
  	try{
  		data = JSON.parse(yeepayCrypto.deEAS(data,yibaoAESKey));
  		var sign = data.sign;
  		delete data.sign;
  		if(this.RSASign(data) !== sign){
  			return false;
  		}
  		return true;
  	}catch(e){
  		console.error(e);
  		return false;
  	} 	
}
module.exports = yeePay;