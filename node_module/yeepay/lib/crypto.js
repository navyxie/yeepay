var crypto = require('crypto');
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
	return encrypt(data,key,'aes-128-ecb','utf8','base64','');
}
/**
 * 解密 EAS
 * 
 * @param string data
 * @param string key
 * @return string
 */
function deEAS(data,key){
	return decrypt(data,key,'aes-128-ecb','utf8','binary','');
}
/**
 * 获取rsa签名
 * 
 * @param string dataStr
 * @param string merchantPrivateKey
 * @param string algorithm
 * @return string
*/
function getRSASign(dataStr,merchantPrivateKey,algorithm){
	algorithm = algorithm || "RSA-SHA1";
	var RSA = crypto.createSign(algorithm);
	var pem = getRSAPrivateKey(merchantPrivateKey);
	RSA.update(dataStr);	
	return RSA.sign(pem,'base64');
}
/**
 * 签名认证
 * 
 * @param string signData
 * @param string sign
 * @param string yibaoPublickKey
 * @return boolean
*/
function RSAVerify(signData,sign,yibaoPublickKey,algorithm){
	algorithm = algorithm || "RSA-SHA1";
	var verifier = crypto.createVerify(algorithm);
	verifier.update(signData);
	return verifier.verify(yibaoPublickKey,sign,"base64");
}
module.exports = {
	encrypt:encrypt,
	decrypt:decrypt,
	enEAS:enEAS,
	deEAS:deEAS,
	getRSASign:getRSASign,
	getRSAPrivateKey:getRSAPrivateKey,
	getRSAPublicKey:getRSAPublicKey,
	RSAVerify:RSAVerify
}