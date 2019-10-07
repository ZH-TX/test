// components/heder/header.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  
  data: {
    tabName: '全部',
    boolean:true
  },




 
  methods: {
    // 菜单切换

    tabTo(e) {
      // let that = this;
      // console.log(this);
      
      // console.log(e);

      // console.log(e.currentTarget.dataset.tab);

      let tab = e.currentTarget.dataset.tab;
      let name=e.currentTarget.dataset.name;


      this.triggerEvent('myEvent', {tab});
      
      this.setData({
        boolean: !this.data.boolean,
        tabName: name
      })

    },


    // 取反；
    changeBar(){
     
      console.log(this);
      
    
      this.setData({
        boolean:!this.data.boolean
        
      })
    }



  }
})

// wx.request({

//   url: 'https://cnodejs.org/api/v1/topics',

//   success: function (res) {

//     console.log(res)// 服务器回包信息

//   }

// })