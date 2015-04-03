var crypto = require('crypto');
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
	var cipherChunks = [];
	cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
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
	return decrypt(data,key,'aes-128-ecb','utf8','base64','');
}
module.exports = {
	encrypt:encrypt,
	decrypt:decrypt,
	enEAS:enEAS,
	deEAS:deEAS
}