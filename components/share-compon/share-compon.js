// components/share-compon/share-compon.js
let CURRENT = 0
let app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showShare:Boolean,
    shareImg:Object,
    
  },

  /**
   * 组件的初始数据
   */
  data: {
    list:[],
    imgUrl:'',
    index:0
  },
  pageLifetimes:{
    show(){
      
      //初始化缓存
      wx.setStorageSync( 'share_Qr_key', [])
      wx.getStorage({
        key: app.data.share_preview_key,
        success: (res)=> {
          this.setData({
            list:res.data,
            showShare:true,
            
          })
        },
      })
    }
  },
 
  /**
   * 组件的方法列表
   */
  methods: {
    //父组件调用 购物车生成海报
    _getQrCode(e){
      console.log(1)
      if(this.data.list.length != 0){
        this.setData({ list: [] })
      }
      
      if ((e || null) != null){
        this.setData({
          list: [{url:e}],
          imgUrl:e
        })
      }
    },
    //主页调用生成海报
    _posterQr(even){
      console.log("海报的请求index",even)
      //拿到第几张图片对象
      let data = this.data.list[even]
      //去缓存拿取数据
      let arr = wx.getStorageSync('share_Qr_key');
      //保证了每次点击分享都是第一张
      if(even != this.data.index){
        this.setData({
          index: even
        })
      }
      
      //如果缓存和页面数据长度一样证明不需要去请求数据了（缓存数据更新是主页存进去的）
      if (this.data.list.length == arr.length){
        this.setData({
          list:arr
        })
        return
      }
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      wx.request({
        url: app.get_request_url('poster', 'index'),
        data:{
          poster_background: data.filename
        },
        method:"POST",
        dataType: 'json', 
        success:(res) =>{
          if(res.data.code == 0){
            wx.hideLoading()
            //更改data.list某条对象
            this.data.list[even]["url"] = res.data.data
            //渲染到界面
            this.setData({
              list: this.data.list,
              imgUrl:this.data.list[CURRENT].url
            })
        
            //数据去重 
            for (let i = 0; i < arr.length; i++) {
              if (this.data.list[even].name == arr[i].name) {
                 return
              }
            }
            
            //往arr添加值，然后存进缓存
            arr.push(this.data.list[even])
            wx.setStorage({
              key: 'share_Qr_key',
              data: arr,
            })
          }else{
            app.showToast("生成海报失败");
          }
        },fail(){
          app.showToast("服务器请求出错");
        }
      })
    },
    colseMask(){
      this.setData({ showShare: !this.properties.showShare})
    },
    onChange(e){
      CURRENT = e.detail.current
      
      this._posterQr(CURRENT)
    },
    saveImg(){
      let url = this.data.list[CURRENT].url
      wx.showLoading({
        title: '加载中',
        mask:true
      })
      
      //图片需要调用 downloadFile 下载下来在进行保存
      wx.downloadFile({
        url: url,
        success:(res)=>{
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: (res) => {
              console.log(res)
              wx.hideLoading()
              wx.showToast({
                title: '保存成功',
                icon: 'none'
              })
            }, fail: (r) => {
              wx.hideLoading()
              
              wx.getSetting({
                success:(sett)=>{
                  if (!sett.authSetting['scope.writePhotosAlbum']){
                    wx.showModal({
                      title: '提示',
                      content: '需要图片授权哦',
                      success:(log)=>{
                        if(log.confirm){
                          wx.openSetting({
                            success:(open)=>{
                              this.setData({ showShare: true })
                            }
                          })
                        }else{
                          this.setData({ showShare:false})
                        }
                      }
                    })
                  }
                }
              })
            }
          })
          this.setData({
            showShare:true
          })
        }
      })
    },
    
  }
})
