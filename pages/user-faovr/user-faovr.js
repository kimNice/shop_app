const app = getApp();
const CONFIG = require("../../configPage.js")
Page({
  data: {
    nav_title: CONFIG.COLLECT,
    data_list: [],
    data_page_total: 0,
    data_page: 1,
    data_list_loding_status: 1,
    data_bottom_line_status: false,
  },

  onShow() {
    wx.setNavigationBarTitle({title: app.data.common_pages_title.user_favor});
    this.init();
  },

  init() {
    var user = app.get_user_cache_info(this, "init");
    // 用户未绑定用户则转到登录页面
    if (app.user_is_need_login(user)) {
      wx.redirectTo({
        url: "/pages/login/login?event_callback=init"
      });
      return false;
    } else {
      // 获取数据
      this.get_data_list();
    }
  },

  // 获取数据
  get_data_list(is_mandatory) {
    // 分页是否还有数据
    if ((is_mandatory || 0) == 0) {
      if (this.data.data_bottom_line_status == true) {
        return false;
      }
    }

    // 加载loding
    wx.showLoading({title: "加载中..." });
    this.setData({
      data_list_loding_status: 1
    });

    // 获取数据
    wx.request({
      url: app.get_request_url("index", "usergoodsfavor"),
      method: "POST",
      data: {
        page: this.data.data_page
      },
      dataType: "json",
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: res => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          if (res.data.data.data.length > 0) {
            if (this.data.data_page <= 1) {
              var temp_data_list = res.data.data.data;
            } else {
              var temp_data_list = this.data.data_list;
              var temp_data = res.data.data.data;
              for (var i in temp_data) {
                temp_data_list.push(temp_data[i]);
              }
            }
            this.setData({
              data_list: temp_data_list,
              data_total: res.data.data.total,
              data_page_total: res.data.data.page_total,
              data_list_loding_status: 3,
              data_page: this.data.data_page + 1
            });

            // 是否还有数据
            if (this.data.data_page > 1 && this.data.data_page > this.data.data_page_total)
            {
              this.setData({ data_bottom_line_status: true });
            } else {
              this.setData({data_bottom_line_status: false});
            }
          } else {
            this.setData({
              data_list_loding_status: 0
            });
          }
        } else {
          this.setData({
            data_list_loding_status: 0
          });

          app.showToast(res.data.msg);
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.stopPullDownRefresh();

        this.setData({
          data_list_loding_status: 2
        });
        app.showToast("服务器请求出错");
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      data_page: 1
    });
    this.get_data_list(1);
  },

  // 滚动加载
  scroll_lower(e) {
    this.get_data_list();
  },

  // 取消
  cancel_event(e) {
    wx.showModal({
      title: "温馨提示",
      content: "取消后不可恢复，确定继续吗?",
      confirmText: "确认",
      cancelText: "不了",
      success: result => {
        if (result.confirm) {
          // 参数
          var id = e.currentTarget.dataset.value;
          var index = e.currentTarget.dataset.index;

          // 加载loding
          wx.showLoading({title: "处理中..." });

          wx.request({
            url: app.get_request_url("cancel", "usergoodsfavor"),
            method: "POST",
            data: {id: id},
            dataType: "json",
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: res => {
              wx.hideLoading();
              if (res.data.code == 0) {
                var temp_data_list = this.data.data_list;
                temp_data_list.splice(index, 1);
                this.setData({data_list: temp_data_list});
                if(temp_data_list.length == 0)
                {
                  this.setData({
                    data_list_loding_status: 0,
                    data_bottom_line_status: false,
                  });
                }

                app.showToast(res.data.msg, "success");
              } else {
                app.showToast(res.data.msg);
              }
            },
            fail: () => {
              wx.hideLoading();
              app.showToast("服务器请求出错");
            }
          });
        }
      }
    });
  },

});
