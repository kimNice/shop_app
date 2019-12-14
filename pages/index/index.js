const app = getApp();
let key = app.data.share_preview_key
Page({
  data: {
    // pr_data:[
    //   { logo:'http://192.168.50.213/public/static/upload/images/goods/2019/11/11/1573458204272858.jpg',
    //     store:'渔先生',
    //     title:'这是商品标题',
    //     activity:'满300减1',
    //     price:380,
    //     // pay_number:100
    //   },
    //   {
    //     logo: 'http://192.168.50.213/public/static/upload/images/goods/2019/11/11/1573458204272858.jpg',
    //     store: '渔先生',
    //     title: '这是商品标题',
    //     // activity: '满300减1',
    //     price: 380,
    //     pay_number: 100
    //   }, {
    //     logo: 'http://192.168.50.213/public/static/upload/images/goods/2019/11/11/1573458204272858.jpg',
    //     // store: '渔先生',
    //     title: '这是商品标题',
    //     activity: '满300减1',
    //     price: 380,
    //     pay_number: 100
    //   },
    // ],
    load_status: 0,
    data_list_loding_status: 1,
    data_bottom_line_status: false,
    data_list: [],
    banner_list: [],
    navigation: [],
    common_shop_notice: null,
    common_app_is_enable_search: 1,
    common_app_is_enable_answer: 1,
    common_app_is_header_nav_fixed: 0,
    common_app_is_online_service: 0,

    // 限时秒杀插件
    common_app_is_limitedtimediscount: 0,
    plugins_limitedtimediscount_data: null,
    plugins_limitedtimediscount_timer_title: '距离结束',
    plugins_limitedtimediscount_is_show_time: true,

    //分享弹窗
    showShare: false,
  
  },

  onShow() {
    this.init();
  },
  
  onLoad(opt){
    
    let param = app.launch_params_handle(opt)
    this.setData({
      referrer: param.referrer
    })
    wx.getSystemInfo({
      success:  (res) => {
        // 计算主体部分高度,单位为px
        this.setData({
          height: res.windowHeight
        })
      }
    })
  },
  // 获取数据列表
  init() {
    var self = this;

    // 加载loding
    this.setData({
      data_list_loding_status: 1,
    });

    // 加载loding
    wx.request({
      url: app.get_request_url("index", "index"),
      method: "POST",
      data: {},
      dataType: "json",
      success: res => {
        wx.stopPullDownRefresh();
        console.log("首页",res)
        self.setData({ load_status: 1 });
        
        if (res.data.code == 0) {
          var data = res.data.data;
          
          //存分享图片放缓存
          if (data.poster_list.length > 0) {
            wx.setStorageSync(key, data.poster_list)

          }
          self.setData({
            data_bottom_line_status: true,
            banner_list: data.banner_list || [],
            navigation: data.navigation || [],
            data_list: data.data_list,
            common_shop_notice: data.common_shop_notice || null,
            common_app_is_enable_search: data.common_app_is_enable_search,
            common_app_is_enable_answer: data.common_app_is_enable_answer,
            common_app_is_header_nav_fixed: data.common_app_is_header_nav_fixed,
            data_list_loding_status: data.data_list.length == 0 ? 0 : 3,
            common_app_is_online_service: data.common_app_is_online_service || 0,
            // common_app_is_limitedtimediscount: data.common_app_is_limitedtimediscount || 0, //显示秒杀模块
            // plugins_limitedtimediscount_data: data.plugins_limitedtimediscount_data || null, //传数组进去
            plugins_limitedtimediscount_data: data.brand_merchant_list
          });
          // 限时秒杀倒计时
          if (this.data.common_app_is_limitedtimediscount == 1 && this.data.plugins_limitedtimediscount_data != null) {
            this.plugins_limitedtimediscount_countdown();
          }
          
          
          
        } else {
          self.setData({
            data_list_loding_status: 0,
            data_bottom_line_status: true,
          });

          app.showToast(res.data.msg);
        }
      },
      fail: (res) => {
        wx.stopPullDownRefresh();
        self.setData({
          data_list_loding_status: 2,
          data_bottom_line_status: true,
          load_status: 1,
        });

        app.showToast("服务器请求出错");
      }
    });
  },

  // 搜索事件
  search_input_event(e) {
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

  // 下拉刷新
  onPullDownRefresh() {
    this.init();
    
  },
  //上拉
  onReachBottom(){
    wx.navigateTo({
      url: '/pages/goods-search/goods-search'
    });
  },
  // 显示秒杀插件-倒计时
  plugins_limitedtimediscount_countdown() {
    var status = this.data.plugins_limitedtimediscount_data.time.status || 0;
    var msg = this.data.plugins_limitedtimediscount_data.time.msg || '';
    var hours = this.data.plugins_limitedtimediscount_data.time.hours || 0;
    var minutes = this.data.plugins_limitedtimediscount_data.time.minutes || 0;
    var seconds = this.data.plugins_limitedtimediscount_data.time.seconds || 0;
    var self = this;
    if (status == 1) {
      // 秒
      var timer = setInterval(function () {
        if (seconds <= 0) {
          if (minutes > 0) {
            minutes--;
            seconds = 59;
          } else if (hours > 0) {
            hours--;
            minutes = 59;
            seconds = 59;
          }
        } else {
          seconds--;
        }

        self.setData({
          'plugins_limitedtimediscount_data.time.hours': (hours < 10 && hours.length == 1) ? 0 + hours : hours,
          'plugins_limitedtimediscount_data.time.minutes': (minutes < 10 && minutes.length == 1) ? 0 + minutes : minutes,
          'plugins_limitedtimediscount_data.time.seconds': (seconds < 10 && seconds.length == 1) ? 0 + seconds : seconds,
        });

        if (hours <= 0 && minutes <= 0 && seconds <= 0) {
          // 停止时间
          clearInterval(timer);

          // 活动已结束
          self.setData({
            plugins_limitedtimediscount_timer_title: '活动已结束',
            plugins_limitedtimediscount_is_show_time: false,
          });
        }
      }, 1000);
    } else {
      // 活动已结束
      self.setData({
        plugins_limitedtimediscount_timer_title: msg,
        plugins_limitedtimediscount_is_show_time: false,
      });
    }
  },
  shareCompon() {
    // console.log("被点击了分享")
    this.setData({ showShare: true })
    this.selectComponent("#share")._posterQr(0)
  },
  // 自定义分享
  onShareAppMessage(e) {
    let img = (e.target || null) == null ? '' : e.target.dataset.url
    var user = app.get_user_cache_info(this, 'goods_favor_event') || null;
    var user_id = (user != null && (user.id || null) != null) ? user.id : 0;
    console.log("用户id",user_id)
    return {
      title: app.data.application_title,
      desc: app.data.application_describe,
      imageUrl: img,
      path: '/pages/index/index?share=index&referrer=' + user_id
    };
  },

});
