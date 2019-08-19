/**
 * 演示程序当前的 “注册/登录” 等操作，是基于 “本地存储” 完成的
 * 当您要参考这个演示程序进行相关 app 的开发时，
 * 请注意将相关方法调整成 “基于服务端Service” 的实现。
 **/
(function($, owner) {
	var serverurl = "http://192.168.11.72:8080";
	//var serverurl ="http://192.168.2.164:8080";
	/**
	 * 用户登录
	 **/
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.username = loginInfo.username || '';
		loginInfo.password = loginInfo.password || '';
		/* if (loginInfo.username.length < 5) {
			return callback('账号最短为 5 个字符');
		}
		if (loginInfo.password.length < 6) {
			return callback('密码最短为 6 个字符');
		} */
		console.log(serverurl+'/rest/user/login');
		mui.ajax(serverurl+'/rest/user/login',{
			data:loginInfo,
			dataType:'json',//服务器返回json格式数据
			type:'post',//HTTP请求类型
			timeout:10000,//超时时间设置为10秒；
			//headers:{'Content-Type':'application/json'},	              
			success:function(re){
				//服务器返回响应，根据响应结果，分析是否登录成功；
				console.log( JSON.stringify((re)));
				//var users = JSON.parse(data);
				if("505"==re.status){
					return callback(re.message);
				}
				localStorage.setItem('$users', JSON.stringify(re));
				return owner.createState(re.data.truename, callback);
			},
			error:function(xhr,type,errorThrown){
				//异常处理；
				return callback("上传数据失败！");
			}
		});
		
		/* var users = JSON.parse(localStorage.getItem('$users') || '[]');
		var authed = users.some(function(user) {
			return loginInfo.username == user.username && loginInfo.password == user.password;
		});
		
		if (authed) {
			return owner.createState(loginInfo.username, callback);
		} else {
			
		} */
	};

	owner.createState = function(name, callback) {
		var state = owner.getState();
		state.username = name;
		state.token = "token123456789";
		owner.setState(state);
		return callback();
	};

	/**
	 * 新用户注册
	 **/
	owner.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.username = regInfo.username || '';
		regInfo.password = regInfo.password || '';
		if (regInfo.username.length < 5) {
			return callback('用户名最短需要 5 个字符');
		}
		if (regInfo.password.length < 6) {
			return callback('密码最短需要 6 个字符');
		}
		if (!checkEmail(regInfo.email)) {
			return callback('邮箱地址不合法');
		}
		var users = JSON.parse(localStorage.getItem('$users') || '[]');
		users.push(regInfo);
		localStorage.setItem('$users', JSON.stringify(users));
		return callback();
	};

	/**
	 * 获取当前状态
	 **/
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		
		localStorage.setItem('$state', JSON.stringify(state));
		//var settings = owner.getSettings();
		//settings.gestures = '';
		//owner.setSettings(settings);
	};

	var checkEmail = function(email) {
		email = email || '';
		return (email.length > 3 && email.indexOf('@') > -1);
	};

	/**
	 * 找回密码
	 **/
	owner.forgetPassword = function(email, callback) {
		callback = callback || $.noop;
		if (!checkEmail(email)) {
			return callback('邮箱地址不合法');
		}
		return callback(null, '新的随机密码已经发送到您的邮箱，请查收邮件。');
	};

	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
			var settingsText = localStorage.getItem('$settings') || "{}";
			return JSON.parse(settingsText);
		}
		/**
		 * 获取本地是否安装客户端
		 **/
	owner.isInstalled = function(id) {
		if (id === 'qihoo' && mui.os.plus) {
			return true;
		}
		if (mui.os.android) {
			var main = plus.android.runtimeMainActivity();
			var packageManager = main.getPackageManager();
			var PackageManager = plus.android.importClass(packageManager)
			var packageName = {
				"qq": "com.tencent.mobileqq",
				"weixin": "com.tencent.mm",
				"sinaweibo": "com.sina.weibo"
			}
			try {
				return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
			} catch (e) {}
		} else {
			switch (id) {
				case "qq":
					var TencentOAuth = plus.ios.import("TencentOAuth");
					return TencentOAuth.iphoneQQInstalled();
				case "weixin":
					var WXApi = plus.ios.import("WXApi");
					return WXApi.isWXAppInstalled()
				case "sinaweibo":
					var SinaAPI = plus.ios.import("WeiboSDK");
					return SinaAPI.isWeiboAppInstalled()
				default:
					break;
			}
		}
	}
	
	//保存灭菌信息
	owner.saveSterilize = function (sterilize,callback) {
	   	callback = callback || $.noop;
		var users = JSON.parse(localStorage.getItem('$users') || '[]');
	   	sterilize = sterilize || {};
	  	sterilize.barcode = sterilize.barcode || '';
		sterilize.mjdate =  sterilize.mjdate || '';
		sterilize.guihao = sterilize.guihao || '';
		sterilize.coperator = sterilize.coperator || '';
		sterilize.banbie = sterilize.banbie || '';
		sterilize.creator = users.data.truename || '';
		if(sterilize.creator.length <1 ){
			return callback(1,' 请登录后进行扫码操作！');
		}
		if(sterilize.mjdate.length < 2 || "请选择灭菌日期"==sterilize.mjdate){
			return callback(1,' 请选择灭菌日期！');
		}
		if(sterilize.coperator.length < 1 || "请选择操作人"==sterilize.coperator){
			return callback(1,' 请选择操作人！');
		}
		if(sterilize.banbie.length < 1 || "请选择班别"==sterilize.banbie){
			return callback(1,' 请选班别！');
		}
		if(sterilize.guihao.length < 1 || "请选择灭菌柜号"==sterilize.guihao){
			return callback(1,' 请选择柜号！');
		}
		if(sterilize.barcode.length != 26){
			return callback(1,' 条码长度必须为26位！');
		}
		

	   	console.log(serverurl+'/rest/ster/add');
	   	mui.ajax(serverurl+'/rest/ster/add',{
	   		data:sterilize,
	   		dataType:'json',//服务器返回json格式数据
	   		type:'post',//HTTP请求类型
	   		timeout:10000,//超时时间设置为10秒；
	   		headers:{'Content-Type':'application/json'},
	   		success:function(re){
	   			//服务器返回响应，根据响应结果，分析是否登录成功；
	   			//console.log( JSON.stringify((data)));
	   			//var users = JSON.parse(data);
	   			if("505"==re.status){
	   				return callback(1,re.message);
	   			}
	   			return callback(0,re.data);
	   		},
	   		error:function(xhr,type,errorThrown){
	   			//异常处理；
	   			//console.log(type); 
	   			return callback(1,"连接服务器失败！");
	   		}
		}) 
	}
 }(mui, window.app = {}));