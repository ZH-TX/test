//index.js
//获取应用实例
// var app = getApp();
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const formatTime = util.formatTime;
const diffTime = util.getDateDiff;





Page({
    data: {
        page: 1,
        tab: 'all',
        topics: [],
        topNum: 0,
        isLoadMore: false,
        isRefresh: false
    },

    // 页面加载 时候将请求进行发送
    onLoad: function () {
        this.getTopics(1, true);
    },

    // 主题转换(等待中)  涉及到组件的通信
    changebar: function (e) {
        //   console.log(event.target);
        // console.log(e);

        let tab = e.detail.tab;
        // console.log(tab);

        this.setData({
            tab: tab,
            topics: []
        });
        this.getTopics(1, true);
    },

    



    getTopics(page, isRefresh) {

        //   console.log(this);

        let _this = this;

        //   console.log(_this);
        if (isRefresh) {
            _this.setData({
                isRefresh: true
            });
        } else {
            _this.setData({
                isLoadMore: true
            });
        }

        //   调用api  的getTopics 来获取数据
        api.getTopics({
            page: page,
            tab: _this.data.tab
        }, (res) => {
            const topics = isRefresh ? res.data : _this.data.topics.concat(res.data);

            //   console.log(topics);



            
            topics.map( (topic) =>{
                topic.create_at = formatTime(new Date(topic.create_at));
                const last_reply_at = +new Date(topic.last_reply_at);
                topic.last_reply_at = !last_reply_at ? topic.last_reply_at : diffTime(last_reply_at);
                
                // console.log(topic);
                
                return topic;
            });


            //   设置data数据，重新恢复原始状态
            _this.setData({
                topics: topics,
                page: page + 1,
                isLoadMore: false,
                isRefresh: false
            });
        });
    },

    //   滚动操作;

    refresh (e) {
        // console.log(e);
        // wx.showNavigationBarLoading();
        
        this.getTopics(1, true);
        // wx.stopPullDownRefresh();
    },
    loadMore () {
        this.getTopics(this.data.page);
    },

    // 控制滚动 回到顶部的显影
    scrolltoupper (e) {
        // console.log(e)
        if (e.detail.scrollTop > 300) {
            this.setData({
                floorstatus: true
            });
        } else {
            this.setData({
                floorstatus: false
            });
        }
    },


    //   跳转到detail  的具体页面
    viewDetail: function (event) {

        console.log(event.currentTarget);

        //   必须使用currentTarget 才能获取当前页面的id
        var topicId = event.currentTarget.dataset.id;
        wx.navigateTo({
            url: '../detail/index?id=' + topicId
        });
    },



    toTop: function (e) { // 一键回到顶部
        this.setData({
            topNum: this.data.topNum = 0
        });
    },


    
    // toTop(){
    //   wx.pageScrollTo({
    //       scrollTop: 0,
    //       duration: 300
    //     })
    // },
});