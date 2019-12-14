var app = getApp()

Component({
  data: {
    statusBarHeight: '',
    titleBarHeight: '',
    isShowHome: false, 
    jiantou:false, //箭头
    sousuo:true,  //搜索图标
    is_nav_list_show:true,
    on_off:true,
    nav_list:[
      { title: "首页", imgUrl: "/images/faxian.png", path:"/pages/index/index", value: "0" },
      { title: "个人中心", imgUrl: "/images/default-user.png", path: "/pages/user/user", value: "1" },
      { title: "我的收藏", imgUrl: "/images/shoucang.png", path: "/pages/user-faovr/user-faovr", value: "2" },
      { title: "我的足迹", imgUrl: "/images/fangkezuji.png", path: "/pages/user-goods-browse/user-goods-browse", value: "3" },
    ],
    index_img:0
  },
  properties: {
    //属性值可以在组件使用时指定
    title: {
      type: String,
      value: '搞鲜商城'
    }
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show() {
      this.navShowJudge()
     
    }
   
  },
  attached() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      titleBarHeight: app.globalData.titleBarHeight
    })
  },
  methods: {
    onbindinput(e){
      //搜索图标的显示与否
      if(e.detail.value == ""){
        this.setData({
          sousuo: true
        })
      }else{
        this.setData({
          sousuo:false
        })
      }
    },
    on_nav(event){
      let eventIndex = event.currentTarget.dataset.index
      if (eventIndex == this.data.nav_list[eventIndex].value){
        if (eventIndex == 0){
          wx.reLaunch({
            url: this.data.nav_list[eventIndex].path,
          })
          return
        }
        wx.navigateTo({
          url: this.data.nav_list[eventIndex].path,
        })
        this.setData({
          on_off: !this.data.on_off
        })
      }
    },
    //回退
    navToBack(){
      let pageContext = getCurrentPages()
      let page = pageContext[pageContext.length - 2]
      let pages = pageContext[pageContext.length - 1]
      let index = 0
      //循环判断当前页面在页面栈重复几次
      for (let i = 0; i < pageContext.length;i++){
        if (pageContext[i].route == pages.route){
          index ++ 
        }
      }
      console.log("回退",index)
      wx.navigateBack({ delta: index })
      
    },
    //搜索判断
    search_input_event(e) {
      console.log(e)
      var keywords = e.detail.value || null;
      if (keywords == null) {
        app.showToast("请输入搜索关键字");
        return false;
      }

      // 进入搜索页面
      wx.navigateTo({
        url: '/pages/goods-search/goods-search?keywords=' + keywords
      });
    },
    on_list(){
      let on_off = this.data.on_off
      if(on_off){
        this.setData({
          on_off: !this.data.on_off
        })
      }else{
        this.setData({
          on_off: !this.data.on_off
        })
      }
    },
    //判断导航部分显示问题
    navShowJudge() {
      let pageContext = getCurrentPages()
      let page = pageContext[pageContext.length - 1]
      let route = "/" + page.route
      console.log("页面栈" , (pageContext.length > 9 ? "满溢" : pageContext))
      //是主页就显示搜索
      if (route == "/pages/index/index") {
        this.setData({ isShowHome: true })
        return
      }else{
        this.setData({
          isShowHome: false
        })
      }
      //显示首页小房子(暂时不要小房子返回)
      if ((route == "/pages/station/station" && pageContext.length == 1) || (pageContext.length == 1 && route == "/pages/brand-merchant/brand-merchant") || (route == "/pages/shop/shop" && pageContext.length == 1)) {
        // this.setData({index_img:1})
        
        return
      }
      
      
      //这三个页面不显示返回箭头
      if (route == "/pages/cart/cart" ||  route == "/pages/zhuanqian/zhuanqian") {
        this.setData({ jiantou: false })
      } else {
        this.setData({ jiantou: true })
      }
      //商品详情显示
      if (route == "/pages/goods-detail/goods-detail") {
        this.setData({ is_nav_list_show: false })
        if (pageContext.length == 1) {
          this.setData({ jiantou: false })
        } else {
          this.setData({ jiantou: true })
        }
      }
    },
  }
})