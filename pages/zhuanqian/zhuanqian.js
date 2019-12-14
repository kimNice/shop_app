// pages/zhuanqian/zhuanqian.js
const app = getApp();
const CONFIG = require("../../configPage.js")
let movableArea = 0
let movableView = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showShare:false,
    nav_title: CONFIG.ZHUANQIAN,
    // movable_X:0,
    // progress:0,
    // count:3,
    // currentent:2,
    // left:0,
    // differ:0

  },
  _initProgress(){
    const query = this.createSelectorQuery()
    query.select('.movable-area').boundingClientRect()
    query.select('.movable-view').boundingClientRect()
    query.exec( rs =>{
      console.log(rs)
      movableArea = rs[0].width
      movableView = rs[1].width
      let jindu = parseInt(this.data.currentent) / parseInt(this.data.count) * 100
      let view = (movableArea - movableView) * parseInt(this.data.currentent) / parseInt(this.data.count)
      console.log(jindu, view)
      this.setData({
        left: view,
        movable_X:view,
        progress:jindu,
        differ: parseInt(this.data.count) - parseInt(this.data.currentent)
      })
    })
    
    
  },
  onshareCompon(){
    this.setData({
      showShare:!this.data.showShare
    })
    this.selectComponent("#share")._posterQr(0)
  },
  
  // 申请加盟
  navigation_event(e) {
    app.operation_event(e);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let param = app.launch_params_handle(options)
    var user = app.get_user_cache_info(this, "init")
    // this.setData({
    //   referrer: param.referrer || 0
    // })
    // 用户未绑定用户则转到登录页面
    var msg = (user == false) ? '授权用户信息' : '绑定手机号码';
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
          }else{
            wx.navigateBack()
            console.log("返回")
          }
          
        },
      });
    }else{
      // this._initProgress()
    }
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
  onShareAppMessage: function (e) {
    let img = (e.target || null) == null ? '':e.target.dataset.url
    var user = app.get_user_cache_info(this, 'goods_favor_event') || null;
    var user_id = (user != null && (user.id || null) != null) ? user.id : 0;
    console.log("用户id", user_id)
    var obj={
      imageUrl:img,
      title: "搞鲜商城",
      path: "/pages/zhuanqian/zhuanqian?referrer=" + user_id
    };
    return obj;
  }
})