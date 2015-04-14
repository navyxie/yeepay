var _ = require('underscore');
/**
*是否为空对象
*@param object val
*@return boolean
*/
function isNotEmptyObj(val){
	return _.isObject(val) && !_.isEmpty(val)
}
/**
 * 对象按键排序
 * @param object obj
 * @param boolean desc
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
*生成一个随机的字符串
*@param number len
*/
function generateKey(len){
	var baseString = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	len = len || 16;
	var str = '';
	for(var i = 0 ; i < len ; i++){
		str += baseString[parseInt(Math.random()*(len-1))];
	}
	return str;
}
/**
 * 移动端网页支付所需参数
 * @return array
*/
function getWebPayKeys(){
	//keys,详情请查看易宝文档-> http://mobiletest.yeepay.com/file/doc/pubshow?doc_id=14#ha_32
	var keys = ['merchantaccount','orderid','transtime','currency','amount','productcatalog','productname','productdesc','identityid','identitytype','terminaltype','terminalid','orderexpdate','userip','userua','callbackurl','fcallbackurl','version','paytypes','cardno','idcardtype','idcard','owner','sign','bank','orderexpdate'];
	return keys;
}
/**
 * 拾取移动端网页支付所需参数
 * @param object obj
 * @return object
*/
function pickWebPayKeys(obj){
	return _.pick(obj,getWebPayKeys());
}
/**
 * 获取支付必填参数key
 * @return array
 */
function getCheckKey(){
	return ['orderid','transtime','amount','identityid','userip','userua'];
}
/**
 * 检测支付必填参数是否齐全
 * @param object json
 * @return boolean
 */
function checkParam(json){
	var flag = true;
	var keys = getCheckKey();
	for(var i = 0 , len = keys.length ; i < len ; i++){
		if(!json[keys[i]]){
			flag = false;
			break;
		}
	}
	return flag;
}
/**
 * 获取默认配置keys
 * 
 * @return array
 */
function getDefaultKey(){
	return ['merchantaccount','currency','productcatalog','productname','productdesc','identitytype','terminaltype','terminalid','callbackurl','fcallbackurl'];
}
/**
 * 获取默认配置
 * 
 * @return object
 */
function getDefaultConfig(json){
	var keys = getDefaultKey();
	var result = {};
	for(var i = 0 , len = keys.length ; i < len ; i++){
		result[keys[i]] = json[keys[i]];
	}
	return result;
}
module.exports = {
	isNotEmptyObj:isNotEmptyObj,
	sortObjectByKey:sortObjectByKey,
	jsonToSearch:jsonToSearch,
	generateKey:generateKey,
	getWebPayKeys:getWebPayKeys,
	pickWebPayKeys:pickWebPayKeys,
	getCheckKey:getCheckKey,
	checkParam:checkParam,
	getDefaultKey:getDefaultKey,
	getDefaultConfig:getDefaultConfig
}