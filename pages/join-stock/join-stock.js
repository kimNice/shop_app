// pages/join-stock/join-stock.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    brand_merchant_goods_list_data:[],
    not_found:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this._getJoinStock(options.brandMerchant_id)
  },
  _getJoinStock(id){
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: app.get_request_url("BrandMerchantGoodsList", "Brandmerchant"),
      method: "POST",
      data: {
        brand_merchant_id: id,
      },
      dataType: "json",
      success: (res) => {
        console.log("shangbu", res)
        wx.hideLoading()
        let info = res.data
        if (res.data.code == 0) {
          this.setData({
            brand_merchant_goods_list_data: info.data.brand_merchant_goods_list_data,
            not_found: info.data.brand_merchant_goods_list_data.length ? null : 0
          })

        } else {
          this.setData({
            not_found: 0
          })
        }

      }
    })

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

  }
})