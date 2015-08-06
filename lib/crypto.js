var crypto = require('crypto');
var ursa = require('ursa');
var utf8 = require('utf8');
var base64 = require('base64');
var encoding = require('encoding');
var _ = require('underscore');
var util = require('./util');
/**
	获取rsa私钥的前缀
	@return string
*/
function getRSAPrivateKeyPrefix(){
	return '-----BEGIN RSA PRIVATE KEY-----\r\n';
}
/**
	获取rsa私钥的后缀
	@return string
*/
function getRSAPrivateKeySuffix(){
	return '-----END RSA PRIVATE KEY-----';
}
/**
	获取rsa公钥的前缀
	@return string
*/
function getRSAPublickKeyPrefix(){
	return '-----BEGIN PUBLIC KEY-----\r\n';
}
/**
	获取rsa公钥的后缀
	@return string
*/
function getRSAPublicKeySuffix(){
	return '-----END PUBLIC KEY-----';
}
/**
	@param string key
	格式化rsa的私钥，64位长度为一行
	@return string
*/
function formatRSAKey(key){
	var len = key.length;
	var privateLen = 64;//private key 64 length one line
	var space = Math.floor(len/privateLen);
	var flag = len%privateLen === 0 ? true : false;
	var str = "";
	for(var i = 0 ; i < space ; i++){
		str += key.substr(i*privateLen,privateLen) + '\r\n';
	}
	if(!flag){
		str += key.substring(space*privateLen) + '\r\n';
	}
	return str;
}
/**
	@param string key rsa的私钥
	返回标准格式的rsa的私钥
	@return string
*/
function getRSAPrivateKey(key){
	return getRSAPrivateKeyPrefix() + formatRSAKey(key) + getRSAPrivateKeySuffix();
}
/**
	@param string key rsa的私钥
	返回标准格式的rsa的公钥
	@return string
*/
function getRSAPublicKey(key){
	return getRSAPublickKeyPrefix() + formatRSAKey(key) + getRSAPublicKeySuffix();
}
/**
 * 加密
 * 
 * @param string data
 * @param string key
 * @param string algorithm
 * @param string clearEncoding
 * @param string cipherEncoding
 * @param string iv
 * @return string
 */
function encrypt(data,key,algorithm,clearEncoding,cipherEncoding,iv){
	var cipher = crypto.createCipheriv(algorithm, key,iv);
	cipher.setAutoPadding(true);
	var cipherChunks = [];
	cipherChunks.push(cipher.update(new Buffer(data), clearEncoding, cipherEncoding));
	cipherChunks.push(cipher.final(cipherEncoding));
	return cipherChunks.join('');
}
/**
 * 解密
 * 
 * @param string data
 * @param string key
 * @param string algorithm
 * @param string clearEncoding
 * @param string cipherEncoding
 * @param string iv
 * @return string
 */
function decrypt(cipherChunks,key,algorithm,clearEncoding,cipherEncoding,iv){
	var decipher = crypto.createDecipheriv(algorithm, key,iv);
	var plainChunks = [];
	for(var i = 0 , len = cipherChunks.length ; i < len ; i++) {
		plainChunks.push(decipher.update(cipherChunks[i], cipherEncoding, clearEncoding));
	}
	plainChunks.push(decipher.final(clearEncoding));
	return plainChunks.join('');
}
/**
 * 加密 EAS
 * 
 * @param string data
 * @param string key
 * @return string
 */
function enEAS(data,key){
	var str = '';
	try{
		str = encrypt(data,key,'aes-128-ecb','utf8','base64','');
	}catch(e){
		console.error('yeepay SDK enEAS error : '+e);
	}
	return str;
}
/**
 * 解密 EAS
 * 
 * @param string data
 * @param string key
 * @return string
 */
function deEAS(data,key){
	var str = '';
	try{
		data = decodeURIComponent(data);
		data = base64.decode(data);
		str = decrypt(data,key,'aes-128-ecb','utf8','binary','');
	}catch(e){
		console.error('yeepay SDK deEAS error : '+e)
	}
	return str;
}
/**
 * 获取rsa签名
 * 
 * @param object obj
 * @param string merchantPrivateKey
 * @param string algorithm
 * @return string
*/
function getRSASign(obj,merchantPrivateKey,algorithm){
	if(obj.sign){
		delete obj.sign;
	}
	obj = util.sortObjectByKey(obj);
	var values = _.values(obj);
	var valStr = values.join('');
	valStr = utf8.encode(valStr);//中文字符使用UTF-8编码,see:http://mobiletest.yeepay.com/file/doc/pubshow?doc_id=19#hm_6, keyword:RSA验签
	algorithm = algorithm || "RSA-SHA1";
	var RSA = crypto.createSign(algorithm);
	var pem = getRSAPrivateKey(merchantPrivateKey);
	RSA.update(valStr);	
	return RSA.sign(pem,'base64');
}
/**
 * 签名认证
 * 
 * @param object json
 * @param string sign
 * @param string yibaoPublickKey
 * @param string algorithm
 * @return boolean
*/
function RSAVerify(json,sign,yibaoPublickKey,algorithm){
	var flag = false;
	if(!_.isObject(json)){
		return flag;
	}
	delete json.sign;
	try{
		json = util.sortObjectByKey(json);
		var values = _.values(json);
		var valStr = values.join('');
		valStr = utf8.encode(valStr);//中文字符使用UTF-8编码,see:http://mobiletest.yeepay.com/file/doc/pubshow?doc_id=19#hm_6, keyword:RSA验签
		algorithm = algorithm || "RSA-SHA1";
		var verifier = crypto.createVerify(algorithm);
		verifier.update(valStr);
		flag = verifier.verify(yibaoPublickKey,sign,"base64");
	}catch(e){
		console.error('yeepay SDK RSAVerify error : '+e);
	}
	return flag;
}
function getEncryptkey(publicKey,aesKey){
	var crt = ursa.createPublicKey(getRSAPublicKey(publicKey));
  	return crt.encrypt(aesKey, 'utf8', 'base64',ursa.RSA_PKCS1_PADDING);
}
function decryptKey(encryptkey,merchantPrivateKey){
	var str = '';
	try{
		var key = decodeURIComponent(encryptkey);
		key = base64.decode(key);//易宝要求必须进行base64解码才能得到正确的解密 eas key
		var pem = ursa.createPrivateKey(getRSAPrivateKey(merchantPrivateKey));
		str = pem.decrypt(key, 'binary', 'utf8', ursa.RSA_PKCS1_PADDING);
	}catch(e){
		console.error('yeepay SDK decryptKey error : '+e);
	}
	return str;
	
}
module.exports = {
	encrypt:encrypt,
	decrypt:decrypt,
	enEAS:enEAS,
	deEAS:deEAS,
	getRSASign:getRSASign,
	getRSAPrivateKey:getRSAPrivateKey,
	getRSAPublicKey:getRSAPublicKey,
	RSAVerify:RSAVerify,
	getEncryptkey:getEncryptkey,
	decryptKey:decryptKey
}