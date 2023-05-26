const NEW_USER_GUIDE_COMPLETION_STATUS = 'NEW_USER_GUIDE_COMPLETION_STATUS'

const SYSTEM_INFO = wx.getSystemInfoSync()

const MASK_PADDING = 5

const selectNodeRect = (selector, obj = wx) => new Promise((resolve, reject) => {
  try {
    obj.createSelectorQuery().select(selector).boundingClientRect((e) => {
      e !== null ? resolve(e) : reject()
    }).exec()
  } catch (error) {
    reject(error)
  }
})

const mathCeil = (obj) => {
  const _obj = {}
  for (const key in obj) {
    _obj[key] = typeof obj[key] === 'number' ? Math.ceil(obj[key]) : obj[key]
  }
  return _obj
}

let initDelayTimer

Component({
  options: {
    addGlobalClass: true,
  },
  behaviors: ['wx://component-export'],
  properties: {
    pageKey: { // 页面标识，用于区分不同的新手引导
      type: String,
      value: ''
    },
    /**
     * 步骤项
     * @type {{ selector: string, tips: string }[]}
     * @example
     * ```js
     * [
     *   { selector: '#app1', tips: '第一步' },
     *   { selector: '#app2', tips: '第二步' }
     * ]
     * ```
     */
    options: {
      type: Array,
      value: [],
    },
    hollowOut: { // 是否镂空
      type: Boolean,
      value: true,
    },
    initDelay: { // 初始化延迟，防止节点还没创建就开始查找节点
      type: Number,
      value: 500,
    },
    zIndex: { // z-index
      type: Number,
      value: 3000,
      observer() { this.updateMaskStyle() },
    },
    animationTime: { // 动画时间
      type: Number,
      value: 250,
    },
    tipsWrapperClass: { // tips 包裹器 class
      type: String,
      value: '',
    },
    nextBtnText: { // 下一步按钮文案
      type: String,
      value: '下一步',
    },
    nextBtnClass: { // 下一步按钮 class
      type: String,
      value: '',
    },
    endBtnText: { // 结束按钮文案
      type: String,
      value: '我知道了',
    },
    endBtnClass: { // 结束按钮 class
      type: String,
      value: '',
    },
    jumpAllBtnText: { // 跳过全部按钮文案
      type: String,
      value: '全部跳过',
    },
    maskPadding: { // 遮罩层内边距
      type: Number,
      value: MASK_PADDING,
    },
  },
  data: {
    show: false,

    storgeKey: '',

    MASK_PADDING,

    targetNodeInfo: {
      width: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },

    scrollRecordMap: {}, // 滚动记录

    maskPublicStyle: `z-index: 3000;background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.3) 100%);backdrop-filter: blur(1px);`,
    
    tips: '',
    tipsStyle: '',

    currentSelectorIndex: 0, // 当前步骤节点索引
  },
  lifetimes: {
    ready() {
      this.setData({
        storgeKey: this.properties.pageKey || getCurrentPages().pop()?.route, // 没设置就用路由
        targetNodeInfo: mathCeil({
          width: SYSTEM_INFO.windowWidth,
          height: SYSTEM_INFO.windowHeight,
          left: 0,
          right: SYSTEM_INFO.windowWidth,
          top: 0,
          bottom: SYSTEM_INFO.windowHeight,
        }),
        tipsStyle: `top: ${SYSTEM_INFO.windowHeight}px;`,
        maskPublicStyle: `z-index: ${this.properties.zIndex};background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.3) 100%);backdrop-filter: blur(1px);`
      })
      this.checkShow()
    },
    detached() {
      clearTimeout(initDelayTimer)
      initDelayTimer = -1
    }
  },
  export() {
    return {
      nextStep: () => this.nextStep(),
      handleStepEnd: () => this.handleStepEnd(),
    }
  },
  methods: {
    checkShow() {
      const obj = wx.getStorageSync(NEW_USER_GUIDE_COMPLETION_STATUS) || {}
      if (obj[this.data.storgeKey]) return
      this.setData({ show: true })
      initDelayTimer = setTimeout(() => {
        this.setCurrentTargetNodeInfo()
      }, this.properties.initDelay)
    },

    updateMaskStyle() {
      this.setData({ maskPublicStyle: `z-index: ${this.properties.zIndex};background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.3) 100%);backdrop-filter: blur(1px);` })
    },

    setCurrentTargetNodeInfo() {
      if (!this.properties.options.length) return
      const item = this.properties.options[this.data.currentSelectorIndex]
      selectNodeRect(item.selector).then((e) => {
        // 如果节点在可视区域下方，需要滚动到可视区域，滚动后仍不可见就不管了
        if (e.top > SYSTEM_INFO.windowHeight - 20 && !this.data.scrollRecordMap[this.data.currentSelectorIndex]) { // 需要滚动到可视区域
          if (item.scrollViewSelector) {
            wx.createSelectorQuery().select(item.scrollViewSelector).node().exec((res) => {
              const scrollView = res[0].node
              scrollView.scrollIntoView(item.selector)
            })
          } else {
            wx.pageScrollTo({ scrollTop: e.top - 20, duration: 0 })
          }
          this.data.scrollRecordMap[this.data.currentSelectorIndex] = true
          setTimeout(() => this.setCurrentTargetNodeInfo(), 32)
          return
        }
        this.triggerEvent('stepChange', { pageKey: this.properties.pageKey, step: this.data.currentSelectorIndex })
        this.setData({ targetNodeInfo: mathCeil(e), tips: item.tips }, () => this.setTipsStyle())
      }).catch(() => this.nextStep()) // 找不到节点，直接下一步
    },

    nextStep() {
      if (this.data.currentSelectorIndex === this.properties.options.length - 1) { // 没有下一步了
        this.handleStepEnd()
      } else { // 下一步
        this.setData({ currentSelectorIndex: this.data.currentSelectorIndex + 1 })
        this.setCurrentTargetNodeInfo()
      }
    },
    
    handleStepEnd() {
      this.setData({
        targetNodeInfo: mathCeil({
          width: SYSTEM_INFO.windowWidth,
          height: SYSTEM_INFO.windowHeight,
          left: 0,
          right: SYSTEM_INFO.windowWidth,
          top: 0,
          bottom: SYSTEM_INFO.windowHeight,
        }),
        tipsStyle: `top: ${SYSTEM_INFO.windowHeight}px;`
      })
      setTimeout(() => {
        this.setData({ show: false })
        const obj = wx.getStorageSync(NEW_USER_GUIDE_COMPLETION_STATUS) || {}
        obj[this.data.storgeKey] = true
        wx.setStorageSync(NEW_USER_GUIDE_COMPLETION_STATUS, obj)
        this.triggerEvent('end', { pageKey: this.properties.pageKey })
      }, this.properties.animationTime + 50)
    },

    setTipsStyle() {
      wx.nextTick(async () => {
        const { height } = await selectNodeRect('#NewUserGuideTips', this)
        if (SYSTEM_INFO.windowHeight - this.data.targetNodeInfo.bottom < height) { // tips 在下方放不下了
          this.setData({ tipsStyle: `top: ${((this.data.targetNodeInfo.top > SYSTEM_INFO.windowHeight) // 目标完全无法显示
            ? SYSTEM_INFO.windowHeight
            : SYSTEM_INFO.windowHeight > this.data.targetNodeInfo.bottom // 目标能完全显示
              ? this.data.targetNodeInfo.top
              : (SYSTEM_INFO.windowHeight > (this.data.targetNodeInfo.bottom + height)) // tips 底部无法显示
                ? this.data.targetNodeInfo.bottom
                : this.data.targetNodeInfo.top) - height - 20}px;` })
        } else {
          this.setData({ tipsStyle: `top: ${this.data.targetNodeInfo.bottom}px;` })
        }
      })
    }
  }
})