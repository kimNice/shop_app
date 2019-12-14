const app = getApp()
let oneOn_off = true //一级开关
let twoOn_off = true //二级开关
Page({

  /**
   * 页面的初始数据
   */
  data: {
    brand_merchant_data:null, // 加盟商信息
    goods_list_data:[], //商品数组
    shop_list_data: [], //首页门店数组
    shop_list: [], //加盟店列表数组
    stockList:[], //加盟商进货数组
    temp_list: [], //首页临时数组
    temp_lists:[], //临时数组
    //导航
    nav_data:[
      { name:'首页', value:"0"},
      { name:'加盟店',value:'1'},
      { name: '商品分类', value: "2" },
      { name: '加盟商进货', value: "3" },
      { name: '品牌介绍', value: "4" },
    ],
    list_classify:[], //商品分类
    currentIdenx:0, //导航下标判断用
    data_bottom_line_status:true, //底部 底线
    classifyIndex:0, //分类下标
    sunIndex:null, // 分类下标
    //下面参数用于分页
    data_page:1,
    data_page_total:0,
    data_list_loding_status:1,
    params:null,
    _id:'', //加盟商id
    bosHeight:0,
    sonHeight:0,
    showShare: false,//分享弹窗

    poster_list:'',//分享海报背景图
    referrer:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let param = app.launch_params_handle(options)
    let _id = (param.brand_merchant_id || null) || param.bmid 
    console.log("扫码", options, options.brand_merchant_id, options.bmid)
    this._getBrand_Merchant(_id)
    this.setData({
      top_height: app.globalData.statusBarHeight + app.globalData.titleBarHeight,
      _id: param.brand_merchant_id || param.bmid,
    })
    //bmtid
  },
  //导航栏事件
  nav_event(event){
    let currentIdenx = event.currentTarget.dataset.index
    let id = event.currentTarget.dataset.id
    if (currentIdenx == 3){
      this._getJoinStock(this.data.brand_merchant_data.id)
    }
    this.setData({ currentIdenx, temp_lists:[]})
    console.log(event)
  },
   
  //最上级
  onClassify(event){
    let classifyIndex = event.currentTarget.dataset.index
    let items = event.currentTarget.dataset.items
    let countData = items.items.length
    //如果第一级下面没有下级就直接查询
    if(items.items.length == 0){
      
      if(items.id == 2){
        this._getclassifyList(classifyIndex)
      }
      return
    }else{
      console.log("下标比值", classifyIndex, "渲染", this.data.classifyIndex, oneOn_off)
      //如果下标不一致就是其他栏，并直接展开列表
      if (this.data.classifyIndex != classifyIndex){
        this.setData({
          classifyIndex,
          bosHeight: (70 * countData)
        })
        return
      }else{//相等就把开关设为false 方便下面代码收起
        oneOn_off = false
      }
      
      //是否展开与收起
      if (oneOn_off){
        this.setData({
          classifyIndex,
          bosHeight: (70 * countData)
        })
        oneOn_off = !oneOn_off
      }else{
        this.setData({
          classifyIndex:0,
        })
        oneOn_off = !oneOn_off
      }
    }
   
  },
  //第二级
  onSon(event){
    let sunIndex = event.currentTarget.dataset.index
    let type =event.currentTarget.dataset.type
    let data = event.currentTarget.dataset.data
    let it = event.currentTarget.dataset.len 
    let countData = (it.items || null) == null ? 0 : it.items.length //这个判断怕没有items数组会报length为undefined

    let data_it = (data.items.length * 70) + (countData * 70)
    // 如果第二级下面没有第三级就去查询商品
    if (type == 'No'){
      this._getclassifyList(sunIndex)
      return
    }
    console.log("第二级开关下标比较", this.data.sunIndex, sunIndex)
    if (this.data.sunIndex != sunIndex){
      this.setData({
        sunIndex,
        sonHeight: ( 70 * countData ),
        bosHeight:data_it
      })
      return
    }else{
      twoOn_off = false
    }
    if (twoOn_off){
      this.setData({
        sunIndex,
        sonHeight: ( 70 * countData ),
        bosHeight: data_it
      })
      twoOn_off = !twoOn_off
    }else{
      this.setData({
        sunIndex:0, 
        bosHeight: data_it - ( 70 * countData )
      })
      twoOn_off = !twoOn_off
    }
    
  },
  //第三级 直接向
  onSun(event){
    let sunIndex = event.currentTarget.dataset.index
    this._getclassifyList(sunIndex)
  },
  //根据列表分类id请求商品数据
  _getclassifyList(_id){
    let url = app.get_request_url("BrandMerchantGoodsSearch", "Brandmerchant")
    let obj = { category_id: _id }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    app.is_req_objData(url, obj, "POST", (res) => {
      let data = res.data.data
      console.log("分类列表",  data.data)
      
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
          nav_title: this.data.parmar + res.data.data.data.category.name
        })
        if (res.data.data.data.data.length == 0){
          wx.showToast({
            title: '暂无产品',
            icon:'none'
          })
        }

      }
      wx.hideLoading()
    })
  },
  
  back(){
    this.setData({
      temp_lists:[]
    })
  },
  //生成加盟商海报
  share_event(){
    var user = app.get_user_cache_info(this, 'poster_event');
    let id = this.data.brand_merchant_data.id
    console.log("加盟商id",id)
    // 用户未绑定用户则转到登录页面
    if (app.user_is_need_login(user)) {
      wx.navigateTo({
        url: "/pages/login/login?event_callback=init"
      });
      return false;
    } else {
      wx.showLoading({ title: '生成中...' });
      wx.request({
        url: app.get_request_url('poster', 'Brandmerchant'),//api/index/poster
        method: 'POST',
        data: {
           "brand_merchant_id": id,
            'poster_background':'poster-background001.jpg' 
        },
        dataType: 'json',
        success: (res) => {
          console.log("生成",res)
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
  //页面初始化数据接口
  _getBrand_Merchant(id){
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: app.get_request_url("Index", "Brandmerchant"),
      method: "POST",
      data: {
        brand_merchant_id: id,
      },
      dataType: "json",
      success: (res) => {
        console.log("shangbu",res)
        
        let info = res.data
        let id = info.data.brand_merchant_data[0].id
        if (res.data.code == 0) {
          this.setData({
            brand_merchant_data: info.data.brand_merchant_data[0],
            goods_list_data: info.data.goods_list_data,
            shop_list_data: info.data.shop_list_data,
            station_list_data: info.data.station_list_data,
            params:id,
            // poster_list: info.data.poster_list[0]
          })
          
          this._getShopList(id);
          this._getCategoryList(id)
          this._getTempList()
          wx.hideLoading()
        } else {
          this.setData({
            not_found: 0,
            data_bottom_line_status:false
          })
        }

      }
    })
  },
  //商品分类列表
  _getCategoryList(id){
    let url = app.get_request_url("BrandMerchantCategory", "Brandmerchant")
    let obj = { brand_merchant_id: id }
    
    app.is_req_objData(url,obj,"POST",(res)=>{
      console.log("分类",res)
      let data = res.data
      if(data.code == 0){
        this.setData({
          list_classify:data.data,
          
        })
      }
    })
  },
  //首页请求接口
  _getTempList(){
    let url = app.get_request_url("BrandMerchantGoodsSearch", "Brandmerchant")
    let obj = { category_id: 1 }
    app.is_req_objData(url,obj,"POST",(res)=>{
      console.log("刺身",res)
      let data = res.data.data.data.data
      let list = []
      for (let i = 0; i < data.length;i++){
        //价格如果是多少到多少之间就切割
        data[i].sp_price = app._split(data[i].price)
        list.push(data[i])
      }
      this.setData({//_id等于2是 sooboss
        temp_list: this.data._id == 2 ? [] : list
      })
    })
  },
  //加盟商进货
  _getJoinStock(is_mandatory){
    // 分页是否还有数据
    if ((is_mandatory || 0) == 0) {
      if (this.data.data_bottom_line_status == true) {
        return false;
      }
    }
    // 加载loding
    wx.showLoading({ title: "加载中..." });
    this.setData({
      data_list_loding_status: 1
    });
    let url = app.get_request_url("BrandMerchantGoodsSearch", "Brandmerchant")
    let obj = { category_id: 2 }
    var post_data = {};
    var params = this.data.params;
    post_data['page'] = this.data.data_page;
    post_data['category_id'] = params['category_id'] || 0;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    app.is_req_objData(url, obj,"POST", (res)=>{
      wx.hideLoading()
      if (res.data.code == 0) {
        console.log("```````````````",res.data.data.data)
        if (res.data.data.data.data.length > 0) {
          if (this.data.data_page <= 1) {
            var temp_data_list = res.data.data.data.data;
          } else {
            var temp_data_list = this.data.stockList;
            var temp_data = res.data.data.data.data;
            for (var i in temp_data) {
              temp_data_list.push(temp_data[i]);
            }
          }
          this.setData({
            stockList: temp_data_list,
            data_total: res.data.data.total,
            data_page_total: res.data.data.page_total,
            data_list_loding_status: 3,
            data_page: this.data.data_page + 1
          });

          // 是否还有数据
          if (this.data.data_page > 1 && this.data.data_page > this.data.data_page_total) {
            // this.setData({ data_bottom_line_status: true });
          } else {
            // this.setData({ data_bottom_line_status: false });
          }
        } else {
          this.setData({
            data_list_loding_status: 0,
          });
          if (this.data.data_page <= 1) {
            this.setData({
              data_list: [],
              // data_bottom_line_status: false,
            });
          }
        }
      } else {
        this.setData({
          data_list_loding_status: 0
        });

        app.showToast(res.data.msg);
      }
    },(fail)=>{
      app.showToast(fail)
    })
  },
  //加盟店列表
  _getShopList(shopId){
    
    wx.request({
      url: app.get_request_url("BrandMerchantShopList", "Brandmerchant"),
      method: "POST",
      data: {
        brand_merchant_id: shopId,
      },
      dataType: "json",
      success: (res) => {
        console.log("res",res)
        let info = res.data
        if (info.code == 0) {
          this.setData({
            shop_list: info.data.shop_list_data,

          })
        }

      }, fail() {
        app.showToast("服务器请求出错");
      }
    })
  },
  // 滚动加载
  scroll_lower(e) {
    console.log("滚动")
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
  onShareAppMessage: function (e) {
    console.log("分享", e)
    var user = app.get_user_cache_info(this, 'goods_favor_event') || null;
    var user_id = (user != null && (user.id || null) != null) ? user.id : 0;
    console.log("refId", user_id)
    return {
      title: this.data.brand_merchant_data.name,
      // desc: app.data.application_describe,
      imageUrl: this.data.brand_merchant_data.logo_address,
      path: '/pages/brand-merchant/brand-merchant?brand_merchant_id=' + this.data._id + '&referrer=' + user_id
    };
  }
})