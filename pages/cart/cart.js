const app = getApp();
const CONFIG = require("../../configPage.js")
Page({
  data: {
    nav_title: CONFIG.CART,
    data_list_loding_status: 1,
    data_list_loding_msg: '',
    data_bottom_line_status: false,
    data_list: [],
    swipe_index: null,
    total_price: '0.00',
    is_selected_all: false,
    buy_submit_disabled_status: true,

    // 是否展示型
    common_is_exhibition_mode: 0,
    common_is_exhibition_mode_btn_text: null,
    customer_service_tel: null,
    showShare:false //分享弹窗
  },
  shareCompon(){
    this.setData({ showShare: !this.data.showShare})
    this.selectComponent("#share")._posterQr(0)
  },
  onShow() {
    wx.setNavigationBarTitle({ title: app.data.common_pages_title.cart });
    this.init();
  },

  init(e) {
    var user = app.get_user_cache_info(this, "init");
    console.log(user, user == false)
    // 用户未绑定用户则转到登录页面
    var msg = (user == false) ? '授权用户信息' : '绑定手机号码';
    if (app.user_is_need_login(user)) {
      wx.showModal({
        title: '温馨提示',
        content: msg,
        confirmText: '确认',
        cancelText: '暂不',
        success: (result) => {
          if (result.confirm) {
            wx.navigateTo({
              url: "/pages/login/login?event_callback=init"
            });
          } else {
            this.setData({
              data_list_loding_status: 0,
              data_bottom_line_status: false,
              data_list_loding_msg: '请先' + msg,
            });
          }
        },
      });
    } else {
      this.get_data();
    }
  },

  // 获取数据
  get_data() {
    this.setData({
      data_list_loding_status: 1,
      total_price: '0.00',
      is_selected_all: false,
      buy_submit_disabled_status: true,
    });

    wx.request({
      url: app.get_request_url("index", "cart"),
      method: "POST",
      data: {},
      dataType: "json",
      success: res => {
        
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          var data = res.data.data;
          // 数据赋值
          this.setData({
            data_list: data.data,
            data_list_loding_status: data.data.length == 0 ? 0 : 3,
            data_bottom_line_status: true,
            data_list_loding_msg: '购物车空空如也',

            // 是否展示型
            common_is_exhibition_mode: data.common_is_exhibition_mode || 0,
            common_is_exhibition_mode_btn_text: data.common_is_exhibition_mode_btn_text || '立即咨询',
            customer_service_tel: data.customer_service_tel || null,
          });
        } else {
          this.setData({
            data_list_loding_status: 2,
            data_bottom_line_status: false,
            data_list_loding_msg: res.data.msg,
          });
          app.showToast(res.data.msg);
        }
      },
      fail: () => {
        wx.stopPullDownRefresh();
        this.setData({
          data_list_loding_status: 2,
          data_bottom_line_status: false,
          data_list_loding_msg: '服务器请求出错',
        });

        app.showToast("服务器请求出错");
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.init();
  },

  // 数量输入事件
  goods_buy_number_blur(e) {
    var index = e.currentTarget.dataset.index || 0;
    let indexs = e.currentTarget.dataset.indexs || 0;
    var buy_number = parseInt(e.detail.value) || 1;
    this.goods_buy_number_func(index,indexs, buy_number);
  },

  // 数量操作事件
  goods_buy_number_event(e) {
    var index = e.currentTarget.dataset.index || 0;
    let indexs = e.currentTarget.dataset.indexs || 0;
    var type = parseInt(e.currentTarget.dataset.type) || 0;
    var temp_buy_number = parseInt(this.data.data_list[index][indexs]['stock']);
    
    if (type == 0) {
      var buy_number = temp_buy_number - 1;
    } else {
      var buy_number = temp_buy_number + 1;
    }
    this.goods_buy_number_func(index,indexs, buy_number);
  },

  // 数量处理方法
  goods_buy_number_func(index,indexs, buy_number) {
    var temp_data_list = this.data.data_list;
    var buy_min_number = parseInt(temp_data_list[index][indexs]['buy_min_number']) || 1;
    var buy_max_number = parseInt(temp_data_list[index][indexs]['buy_max_number']) || 0;
    var inventory = parseInt(temp_data_list[index][indexs]['inventory']);
    var inventory_unit = temp_data_list[index][indexs]['inventory_unit'];
    if (buy_number < buy_min_number) {
      buy_number = buy_min_number;
      if (buy_min_number > 1) {
        app.showToast('起购' + buy_min_number + inventory_unit );
        return false;
      }
    }
    if (buy_max_number > 0 && buy_number > buy_max_number) {
      buy_number = buy_max_number;
      app.showToast('限购' + buy_max_number + inventory_unit );
      return false;
    }
    if (buy_number > inventory) {
      buy_number = inventory;
      app.showToast( '库存数量' + inventory + inventory_unit );
      return false;
    }

    if (temp_data_list[index][indexs]['stock'] == 1 && buy_number == 1)
    {
      return false;
    }
    
    // 更新数据库
    wx.request({
      url: app.get_request_url("stock", "cart"),
      method: "POST",
      data: { "id": temp_data_list[index][indexs]['id'], "goods_id": temp_data_list[index][indexs]['goods_id'], "stock": buy_number},
      dataType: "json",
      success: res => {
        wx.stopPullDownRefresh();
        console.log("更新数量",res)
        if (res.data.code == 0) {
          temp_data_list[index][indexs]['stock'] = buy_number;
          this.setData({ data_list: temp_data_list });

          // 选择处理
          this.selected_calculate();
        } else {
          app.showToast(res.data.msg);
        }
      },
      fail: () => {
        app.showToast("服务器请求出错");
      }
    });
  },

  // 收藏+删除
  goods_favor_delete(id, goods_id, type) {
    wx.request({
      url: app.get_request_url('favor', 'goods'),
      method: 'POST',
      data: { "id": goods_id, "is_mandatory_favor": 1 },
      dataType: 'json',
      success: (res) => {
        if (res.data.code == 0) {
          this.cart_delete(id, type);
        } else {
          app.showToast(res.data.msg);
        }
      },
      fail: () => {
        app.showToast("服务器请求出错");
      }
    });
  },

  // 移除操作事件
  cart_remove_event(e) {
    var id = e.currentTarget.dataset.id || null;
    var index = e.currentTarget.dataset.index || 0;
    // var indexs = e.currentTarget.dataset.indexs || 0;
    var goods_id = e.currentTarget.dataset.goodsid || 0;
    var self = this;
    if (id !== null) {
      self.setData({ swipe_index: index})
      wx.showActionSheet({
        itemList: ['加入收藏', '删除'],
        success(res) {
          if (res.tapIndex == 0)
          {
            self.goods_favor_delete(id, goods_id, 'favor')
          } else {
            self.cart_delete(id, 'delete');
          }
        }
      });
    } else {
      app.showToast("参数有误");
    }
  },

  // 购物车删除
  cart_delete(id, type) {
    wx.request({
      url: app.get_request_url('delete', 'cart'),
      method: 'POST',
      data: { "id": id },
      dataType: 'json',
      success: (res) => {
        if (res.data.code == 0) {
          var temp_data_list = this.data.data_list;
          temp_data_list.splice(this.data.swipe_index, 1);
          this.setData({
            data_list: temp_data_list,
            swipe_index: null,
            data_list_loding_status: temp_data_list.length == 0 ? 0 : this.data.data_list_loding_status,
          });
          //调用子组件的方法
          this.selectComponent("#tabBar").getCartData()
          app.showToast(((type == 'delete') ? '删除成功' : '收藏成功'), 'success');
        } else {
          app.showToast((type == 'delete') ? '删除失败' : '收藏失败');
        }
      },
      fail: () => {
        app.showToast("服务器请求出错");
      }
    });
  },

  // 选中处理
  selectedt_event(e) {
    var type = e.currentTarget.dataset.type || null;
    let deepIndex = e.currentTarget.dataset.indexs || 0; //第二层下标
    var index = e.currentTarget.dataset.index || 0; //第一层下标
   
    if (type != null)
    {
      var temp_data_list = this.data.data_list;
      var temp_is_selected_all = this.data.is_selected_all;
      switch(type) {
        // 批量操作
        case 'all' :
          temp_is_selected_all = (this.data.is_selected_all == true) ? false : true;
          for (var i in temp_data_list) {
            for (let j = 0; j < temp_data_list[i].length;j++){
              if (temp_data_list[i][j]['is_error'] != 1) {
                temp_data_list[i][j]['selected'] = temp_is_selected_all;
              }
            }
          }
          break;

        // 节点操作
        case 'node' :
          if (temp_data_list[index][deepIndex]['is_error'] != 1)
          {
            temp_data_list[index][deepIndex]['selected'] = (temp_data_list[index][deepIndex]['selected'] == true) ? false : true;
          }
          break;
      }

      this.setData({
        data_list: temp_data_list,
        is_selected_all: temp_is_selected_all,
      });
      
      // 选择处理
      this.selected_calculate();
    }
  },

  // 选中计算
  selected_calculate() {
    var total_price = 0;
    var data_count = 0;
    var selected_count = 0;
    var temp_data_list = this.data.data_list;
    for (var i in temp_data_list) {
      for (let j = 0; j < temp_data_list[i].length;j++){
        if ((temp_data_list[i][j]['is_error'] || 0) == 0) {
          data_count++;
        }
        if ((temp_data_list[i][j]['selected'] || false) == true) {
          total_price += temp_data_list[i][j]['stock'] * temp_data_list[i][j]['price'];
          selected_count++;
        }
      }
     
    }

    this.setData({
      total_price: total_price.toFixed(2),
      buy_submit_disabled_status: (selected_count <= 0),
      is_selected_all: (selected_count >= data_count),
    });
  },

  // 结算
  buy_submit_event(e) {
    var selected_count = 0;
    var ids = [];
    var temp_data_list = this.data.data_list;
    for (var i in temp_data_list) {
      
      for(let j = 0;j<temp_data_list[i].length;j++){
        console.log(temp_data_list[i][j]['selected'])
        if ((temp_data_list[i][j]['selected'] || false) == true) {
          ids.push(temp_data_list[i][j]['id']);
          selected_count++;
          
        }
      }
    }
    if (selected_count <= 0) {
      app.showToast("请选择商品");
      return false
    }

    // 进入订单确认页面
    var data = {
      "buy_type": "cart",
      "ids": ids.join(',')
    };
    wx.navigateTo({
      url: '/pages/buy/buy?data=' + JSON.stringify(data)
    });
  },

  // 展示型事件
  exhibition_submit_event(e) {
    app.call_tel(this.data.customer_service_tel);
  },

});
