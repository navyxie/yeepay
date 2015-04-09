//详细文档请看易宝支付，一键支付网页版:http://mobiletest.yeepay.com/file/doc/pubshow?doc_id=14

module.exports = {
    //测试环境配置 start 
    // 商户编号
    merchantaccount : 'YB01000000144',
    // 商户私钥
    merchantPrivateKey : 'MIICdQIBADANBgkqhkiG9w0BAQEFAASCAl8wggJbAgEAAoGBAPGE6DHyrUUAgqep/oGqMIsrJddJNFI1J/BL01zoTZ9+YiluJ7I3uYHtepApj+Jyc4Hfi+08CMSZBTHi5zWHlHQCl0WbdEkSxaiRX9t4aMS13WLYShKBjAZJdoLfYTGlyaw+tm7WG/MR+VWakkPX0pxfG+duZAQeIDoBLVfL++ihAgMBAAECgYAw2urBV862+5BybA/AmPWy4SqJbxR3YKtQj3YVACTbk4w1x0OeaGlNIAW/7bheXTqCVf8PISrA4hdL7RNKH7/mhxoX3sDuCO5nsI4Dj5xF24CymFaSRmvbiKU0Ylso2xAWDZqEs4Le/eDZKSy4LfXA17mxHpMBkzQffDMtiAGBpQJBAPn3mcAwZwzS4wjXldJ+Zoa5pwu1ZRH9fGNYkvhMTp9I9cf3wqJUN+fVPC6TIgLWyDf88XgFfjilNKNz0c/aGGcCQQD3WRxwots1lDcUhS4dpOYYnN3moKNgB07Hkpxkm+bw7xvjjHqI8q/4Jiou16eQURG+hlBZlZz37Y7P+PHF2XG3AkAyng/1WhfUAfRVewpsuIncaEXKWi4gSXthxrLkMteM68JRfvtb0cAMYyKvr72oY4Phyoe/LSWVJOcW3kIzW8+rAkBWekhQNRARBnXPbdS2to1f85A9btJP454udlrJbhxrBh4pC1dYBAlz59v9rpY+Ban/g7QZ7g4IPH0exzm4Y5K3AkBjEVxIKzb2sPDe34Aa6Qd/p6YpG9G6ND0afY+m5phBhH+rNkfYFkr98cBqjDm6NFhT7+CmRrF903gDQZmxCspY',
    // 商户公钥
    merchantPublicKey : 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDxhOgx8q1FAIKnqf6BqjCLKyXXSTRSNSfwS9Nc6E2ffmIpbieyN7mB7XqQKY/icnOB34vtPAjEmQUx4uc1h5R0ApdFm3RJEsWokV/beGjEtd1i2EoSgYwGSXaC32ExpcmsPrZu1hvzEflVmpJD19KcXxvnbmQEHiA6AS1Xy/vooQIDAQAB',
    // 易宝公钥
    yeepayPublicKey : 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCxnYJL7fH7DVsS920LOqCu8ZzebCc78MMGImzW8MaP/cmBGd57Cw7aRTmdJxFD6jj6lrSfprXIcT7ZXoGL5EYxWUTQGRsl4HZsr1AlaOKxT5UnsuEhA/K1dN1eA4lBpNCRHf9+XDlmqVBUguhNzy6nfNjb2aGE+hkxPP99I1iMlQIDAQAB',
    //以上四个参数正式上线时需要替换成易宝后台提供的正试参数
    // 测试环境配置 end 
    
    //接口类型 start
    YEEPAY_PAY_API : 1,
    YEEPAY_MERCHANT_API : 2,
    YEEPAY_MOBILE_API : 3,
    YEEPAY_PC_API : 4,
    //接口类型 end

    //API请求基础地址 start
    //测试环境基础地址
    API_Pay_Base_Url : 'http://mobiletest.yeepay.com/testpayapi/api/',
    API_Mobile_Pay_Base_Url : 'http://mobiletest.yeepay.com/testpayapi/mobile/',
    API_PC_Pay_Base_Url : 'http://mobiletest.yeepay.com/payweb/',
    API_Merchant_Base_Url : 'http://mobiletest.yeepay.com/merchant/',
    //以上四个参数正式上线时需要替换成的正试地址,见下面
    //API_Pay_Base_Url : 'https://ok.yeepay.com/payapi/api/',
    //API_Mobile_Pay_Base_Url : 'https://ok.yeepay.com/payapi/mobile/',
    //API_PC_Pay_Base_Url : 'https://ok.yeepay.com/payweb/',
    //API_Merchant_Base_Url : 'https://ok.yeepay.com/merchant/',
    //API请求基础地址 end

    //商户后台系统的回调地址,用来通知商户支付结果，前后台回调地址的回调内容相同
    callbackurl:'',
    //商户前台系统提供的回调地址,用来通知商户支付结果，前后台回调地址的回调内容相同。用户在网页支付成功页面，点击“返回商户”时的回调地址
    fcallbackurl:'',

    //交易币种,int(整形),默认156人民币(当前仅支持人民币)
    currency:156,
    //商品类别码,1:虚拟产品,3:公共事业缴费,4:手机充值,6:公益事业,7:实物电商,8:彩票业务,10:行政教育,11:线下服务业,13:微信实物电商,14:微信虚拟电商,15:保险行业,16:基金行业,17:电子票务,18:金融投资,19:大额支付,20:其他,21:旅游机票,22:畅付D
    productcatalog:"18",
    //商品名称
    productname:'考拉理财',
    //商品描述
    productdesc:'考拉理财,开启懒人理财生活。',
    // //用户标识类型,0:IMEI    国际移动设备身份码的缩写,1:MAC地址。,2:用户ID    用户编号,3:用户Email ,4:用户手机号 ,5:用户身份证号,6:用户纸质订单协议号
    identitytype:2
    // //终端类型,0、IMEI；1、MAC；2、UUID；3、other
    // terminaltype:3,
    // //终端ID
    // terminalid:'web'
}