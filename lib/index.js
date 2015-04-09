var express = require('express');
var app = express();
var yeepay = require('yeepay');
// respond with "hello world" when a GET request is made to the homepage
app.get('/', function(req, res) {
  res.send('hello world');
});
app.get('/webpay',function(req,res){
	var payInstance = new yeepay();
	var orderid = payInstance.generateAESKey(16);
	var redirectUrl = payInstance.webPay(
		{
			orderid:orderid,
			transtime:parseInt(Date.now()/1000),
			productcatalog:'1',
			amount:1,
			identityid:payInstance.generateAESKey(16),
			userip:'172.17.253.112',
			userua:'NokiaN70/3.0544.5.1 Series60/2.8 Profile/MIDP-2.0 Configuration/CLDC-1.1',
			callbackurl:"http://mobiletest.yeepay.com/apidemo/pay/callback",
			fcallbackurl:"http://mobiletest.yeepay.com/apidemo/pay/callback"
		}
	);
	res.send(redirectUrl+'<script type="text/javascript">setTimeout(function(){var a = document.createElement("a");if(!a.click) {window.location = "'+redirectUrl+'";return;}a.setAttribute("href", "'+redirectUrl+'");a.style.display = "none";document.body.appendChild(a);a.click();},5000)<\/script>');
})
app.listen(8007);
console.log('app listen on 8007');