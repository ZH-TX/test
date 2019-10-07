// pages/detail/index.js

const app= getApp();

  
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const diffTime = util.getDateDiff;
const transformTab = util.transformTab;

Page({
    data: { 

        topNum:0,
        
        loading: false,
        article: {}
    },

    onLoad: function (params) {
        let topicId = params.id;
        this.getTopic(topicId);
    },

    getTopic: function (id) {
        const _this = this;
        _this.setData({
            loading: true
        });
        api.getTopic(id, function (res) {
            const article = res.data;
            // 转换为markdown的格式;
            article.content=app.towxml.toJson(article.content, 'markdown')
            // console.log(article.content);
            
            article.create_at = diffTime(+new Date(article.create_at));
            article.last_reply_at = diffTime(+new Date(article.last_reply_at));
            article.tabText = transformTab(article.tab);
            article.replies.map(function(reply){
            reply.create_at = diffTime(+new Date(reply.create_at));
                return reply;
            });
            
            if(article.good){
                article.mark = '精华';
            }
            if(article.top){
                article.mark = '置顶';
            }
            _this.setData({
                loading: false,
                article: article
            });
        });
    },


    onPageScroll: function (e) {
        // console.log(e)
        if (e.scrollTop > 300) {
          this.setData({
            floorstatus: true
          });
        } else {
          this.setData({
            floorstatus: false
          });
        }
      },
   



    toTop: function (e) {  // 一键回到顶部
      wx.pageScrollTo({
          scrollTop:0,

      })
        
    
  }
})