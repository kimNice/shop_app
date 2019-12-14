// components/tabBar/tabBar.js
let app = getApp()
let index = 0
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    navList: [
      { url: '/images/1.png', activeUrl: '/images/active-1.png', title: '首页', 
        to: '/pages/index/index'
      },
      {
        url: '/images/leimupinleifenleileibie.png', activeUrl: '/images/active-leimupinleifenleileibie.png', title: '赚钱',
        to: '/pages/zhuanqian/zhuanqian'
      },
      // { url: '/images/gouwuche.png', activeUrl: '/images/active-gouwuche.png', title: '购物车', 
      //   to: '/pages/cart/cart' 
      // },
      {
        url: '/images/fenlei.png', activeUrl: '/images/fenlei.png', title: '精品',
        to: '/pages/goods-search/goods-search?category_id=893'
      },
      { url: '/images/wode.png', activeUrl: '/images/active-wode.png', title: '我的', 
        to: '/pages/user/user' 
      },

    ],
    updateIndex: 0,
    quick_nav_cart_count:0

  },
  pageLifetimes: {
    show() {
      let o = this.getPageInfo()
      //解决用户左滑页面退回导航还在上个页面样式
      if (o.route == '/pages/index/index'){
        index = 0
      } else if (o.route == '/pages/zhuanqian/zhuanqian'){
        index = 1
      } else if (o.route == '/pages/cart/cart'){
        index = 2
      }else{
        index = 3
      }
      this.setData({
        updateIndex: index
      })
      

      this.getCartData()
      
    },
    
  },
  /**
   * 组件的方法列表
   */
  methods: {
    getCartData(){
      var user = app.get_user_cache_info(this, "init")
      if (user) {
        wx.request({
          url: app.get_request_url("index", "cart"),
          method: "POST",
          data: {},
          dataType: "json",
          success: res => {
            let data = res.data.data
            if (res.data.code == 0) {
              this.setData({
                quick_nav_cart_count: data.data.length || 0
              })
            }
          }
        })
      }
    },
    onTab(e) {
      let o = this.getPageInfo()
      index = e.currentTarget.dataset.index
      let toUrl = this.data.navList[index].to
      //判断是否点击当前页面
      if (toUrl == o.route) return
      this.setData({
        updateIndex: index
      })
     //当getCurrentPages页面栈过多就使用reLaunch跳转清空一下
      if( o.pages.length > 8){
        if (index == 0) wx.reLaunch({ url: toUrl })
        else if (index == 1) wx.reLaunch({ url: toUrl })
        else if (index == 2) wx.reLaunch({ url: toUrl })
        else wx.reLaunch({ url: toUrl })
      }else{
        if (index == 0) wx.navigateTo({ url: toUrl })
        else if (index == 1) wx.navigateTo({ url: toUrl })
        else if (index == 2) wx.navigateTo({ url: toUrl })
        else wx.navigateTo({ url: toUrl })
      }
    },
    //触发分享事件
    share(e) {
      var user = app.get_user_cache_info(this, "init")
      // 用户未绑定用户则转到登录页面
      var msg ='授权用户即可生成';
      if (app.user_is_need_login(user)) {
        wx.showModal({
          title: '温馨提示',
          content: msg,
          confirmText: '确认',
          cancelText: '暂不',
          success: (result) => {
            wx.stopPullDownRefresh();
            if (result.confirm) {
              wx.navigateTo({
                url: "/pages/login/login?event_callback=init"
              });
            } else {
              wx.navigateBack()
              
            }

          },
        });
      }else{
        this.triggerEvent("shareCompon")
      }
    },
    //获取页面信息
    getPageInfo(){
      //获取页面信息
      let pages = getCurrentPages()
      //获取当前页面信息
      let currentPage = pages[pages.length - 1]
      let route = "/" + currentPage.route
      let o = {
        'pages': pages,
        'currentPage': currentPage,
        'route': route
      }
      return o
    }
  }
})
