const app = getApp()
let oneOn_off = true //一级开关
let twoOn_off = true //二级开关
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav_title:null,
    shop_info: {},
    station_info:{},
    shop_list: [],
    not_found: null,
    data_bottom_line_status: true, //底线
    top_height: 0,
    nav_list: [
      { title: '首页', value: '0' },
      { title: '加盟点地址', value: '1' },
      { title: '商品分类', value: '2' },
      { title: '项目介绍', value: '3' },
    ],
    list_classify: [],
    temp_lists: [],
    navIndex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let param = app.launch_params_handle(options)
    let _id = (param.station_id || null) || param.stid 
    this.setData({
      top_height: app.globalData.statusBarHeight + app.globalData.titleBarHeight,
      id: _id
    })
    this._getMerchantShopInfo(_id)
    this._getTempList()
    
  },
  onNav(event) {
    let index = event.currentTarget.dataset.index
    this.setData({
      navIndex: index
    })
  },
  back(event) {
    let type = event.currentTarget.dataset.type
    if (type == "back") {
      this.setData({ navIndex: 0 })
    } else {
      this.setData({ temp_lists: [] })
    }
  },


  //最上级
  onClassify(event) {
    let classifyIndex = event.currentTarget.dataset.index
    let items = event.currentTarget.dataset.items
    let countData = items.items.length
    //如果第一级下面没有下级就直接查询
    if (items.items.length == 0) {

      if (items.id == 2) {
        this._getclassifyList(classifyIndex)
      }
      return
    } else {
      //如果下标不一致就是其他栏，并直接展开列表
      if (this.data.classifyIndex != classifyIndex) {
        this.setData({
          classifyIndex,
          bosHeight: (70 * countData)
        })
        return
      } else {//相等就把开关设为false 方便下面代码收起
        oneOn_off = false
      }

      //是否展开与收起
      if (oneOn_off) {
        this.setData({
          classifyIndex,
          bosHeight: (70 * countData)
        })
        oneOn_off = !oneOn_off
      } else {
        this.setData({
          classifyIndex: 0,
        })
        oneOn_off = !oneOn_off
      }
    }

  },
  //第二级
  onSon(event) {
    let sunIndex = event.currentTarget.dataset.index
    let type = event.currentTarget.dataset.type
    let data = event.currentTarget.dataset.data
    let it = event.currentTarget.dataset.len
    let countData = (it.items || null) == null ? 0 : it.items.length //这个判断怕没有items数组会报length为undefined

    let data_it = (data.items.length * 70) + (countData * 70)
    // 如果第二级下面没有第三级就去查询商品
    if (type == 'No') {
      this._getclassifyList(sunIndex)
      return
    }
    if (this.data.sunIndex != sunIndex) {
      this.setData({
        sunIndex,
        sonHeight: (70 * countData),
        bosHeight: data_it
      })
      return
    } else {
      twoOn_off = false
    }
    if (twoOn_off) {
      this.setData({
        sunIndex,
        sonHeight: (70 * countData),
        bosHeight: data_it
      })
      twoOn_off = !twoOn_off
    } else {
      this.setData({
        sunIndex: 0,
        bosHeight: data_it - (70 * countData)
      })
      twoOn_off = !twoOn_off
    }

  },
  //第三级 直接去向
  onSun(event) {
    let sunIndex = event.currentTarget.dataset.index
    this._getclassifyList(sunIndex)
  },

  //首页请求接口
  _getTempList() {
    let url = app.get_request_url("BrandMerchantGoodsSearch", "Brandmerchant")
    let obj = { category_id: 1 }
    app.is_req_objData(url, obj, "POST", (res) => {
      console.log("刺身", res)
      this.setData({
        shop_list: res.data.data.data.data
      })
    })
  },
  // 获取数据
  _getMerchantShopInfo(station_id) {
    let url = app.get_request_url("Index", "Station")
    let obj = { station_id: station_id }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    app.is_req_objData(url, obj, "POST", (res) => {
      console.log("门店", res)
      wx.hideLoading()
      let info = res.data
      if (res.data.code == 0) {
        let classify_id = (info.data.station_info.length)? info.data.station_info[0].brand_merchant_id:''
        this.setData({
          // shop_info: info.data.shop_data,
          // shop_list: info.data.goods_data,
          station_info: info.data.station_info[0]
        })
        this._getclassify(classify_id);
        //商品分类
        //this._getclassify(info.data.shop_data.brand_merchant_id)
        //如果商品总数等于list长度就显示到底了
        // if (info.data.shop_data.goods_count == this.data.shop_list.length) {
        //   this.setData({
        //     data_bottom_line_status: true
        //   })
        // } else {
        //   this.setData({
        //     data_bottom_line_status: false
        //   })
        // }
      } else {
        this.setData({
          not_found: 0
        })
      }
    }, (fail) => {
      app.showToast(fail)
    })

  },

  //列表分类
  _getclassify(_id) {
    let url = app.get_request_url("BrandMerchantCategory", "Brandmerchant")
    let obj = { brand_merchant_id: _id}
    app.is_req_objData(url, obj, "POST", (res) => {
      console.log("分类列表", res)
      let data = res.data
      if (data.code == 0) {
        this.setData({
          list_classify: data.data,

        })
      }

    })
  },
  //根据列表分类id请求商品数据
  _getclassifyList(_id) {
    let url = app.get_request_url("BrandMerchantGoodsSearch", "Brandmerchant")
    let obj = { category_id: _id }
    app.is_req_objData(url, obj, "POST", (res) => {
      let data = res.data.data
      console.log("分类产品", res)
      if (data.code == 0) {
        let list = []
        for (let i = 0; i < data.data.data.length; i++) {
          console.log(data[i])
          data.data.data[i].sp_price = app._split(data.data.data[i].price)
          list.push(data.data.data[i])
        }
        this.setData({
          temp_lists: list,
          notData: res.data.data.data.category.name,
        })
        if (res.data.data.data.data.length == 0) {
          wx.showToast({
            title: '暂无产品',
            icon: 'none'
          })
        }

      }

    })
  },

  share_event() {
    var user = app.get_user_cache_info(this, 'poster_event');
    // let id = this.data.brand_merchant_data.id
    // console.log("加盟商id", id)
    // 用户未绑定用户则转到登录页面
    if (app.user_is_need_login(user)) {
      wx.navigateTo({
        url: "/pages/login/login?event_callback=init"
      });
      return false;
    } else {
      console.log("*********", this.data.poster_list)
      wx.showLoading({ title: '生成中...' });
      wx.request({
        url: app.get_request_url('poster', 'station'),//api/index/poster
        method: 'POST',
        data: {
          "station_id": 1,
          'poster_background': 'poster-background001.jpg'
        },
        dataType: 'json',
        success: (res) => {
          console.log("生成", res)
          wx.hideLoading();

          if (res.data.code == 0) {
            this.setData({ showShare: true })
            this.selectComponent("#compon")._getQrCode(res.data.data)
          } else {
            app.showToast(res.data.msg || "生成失败！请重试");
          }
        },
        fail: () => {
          wx.hideLoading();
          app.showToast("服务器请求出错");
        }
      });
    }
  },

  // 远程自定义导航事件
  navigation_event(e) {
    app.operation_event(e);
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var user = app.get_user_cache_info(this, 'goods_favor_event') || null;
    var user_id = (user != null && (user.id || null) != null) ? user.id : 0;
    console.log("用户id", user_id)
    return {
      title: this.data.station_info.name,
      // desc: app.data.application_describe,
      imageUrl: this.data.station_info.logo_address,
      path: '/pages/station/station?station_id=' + this.data.id + '&referrer=' + user_id
    };
  }
})