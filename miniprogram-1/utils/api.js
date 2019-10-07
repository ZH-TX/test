// 创建一个api 的函数，将请求进行封装，整合；getTopics  与getTopic
/**
 * 
 * 
 * 这里渲染Markdown 的格式有问题， 有的可以渲染, 有的出错;
*/

module.exports={


	// get /topics 主题首页
  getTopics(options, callback){
    let apiUrl="https://cnodejs.org/api/v1/topics?";
    if (typeof options==='function'){
			callback=options;
      options={};
      

    };

// 设置文档参数；
    let params={
      page: options.page || 1,
      limit: options.limit || 10,
			tab: options.tab || 'all',
	  	mdrender: true  // true, 默认值渲染Markdown的格式；
	}

			apiUrl += set(params);
			request(apiUrl, callback);


  },

	
	// get /topic/:id 主题详情
  getTopic(topicId, callback){
    let apiUrl='https://cnodejs.org/api/v1/topic/' + topicId + '?';
	 
		// 参数
    let params={
		accesstoken: '',
		mdrender: false,

	}

		apiUrl += set(params);
    request(apiUrl, callback);


  }
  
};



// 获取数据， 将数据数据整合（有些复杂）
function request(url, callback){

	wx.request({
		url: url,
		date:{},
		header:{
			"Content-Type":"application/json"
		},

	// 获取数据；
	success(res){
		// console.log(res);
		callback(res.data);
	}

	})

}

// 进行url编码， 遍历拿到值（这里使用的函数有难度，想不到）

function set(object) {
    return Object.keys(object).map( (k) => {
			// console.log((k +'='+object[k]).join('&'));
			
			// console.log(object[k]);
			
        return k + '=' + object[k];
    }).join('&');
}