# 微信小程序新手引导组件
一个简单的微信小程序新手引导组件，支持镂空引导元素，不遮挡引导元素的操作，支持定义样式

![img](http://qiniuyun.hmydgz.top/doc/img/new-user-guide-priview.gif)

# 引入

```bash
npm i weapp-new-user-guide
```

安装完在小程序开发者工具中点击菜单栏：工具 -> 构建 npm

在需要使用的页面的 `json` 文件中添加配置
```json
{
  "usingComponents": {
    "weapp-new-user-guide": "/miniprogram_npm/weapp-new-user-guide/index"
  }
}
```

# 使用
```xml
<weapp-new-user-guide
  wx:if="{{ showGuide }}"
  options="{{ guideData }}"
  bind:stepChange="onGuideStepChange"
  bind:end="onGuideEnd"
/>
```

```js
Page({
  ...
  data: {
    showGuide: true,
    guideData: [
      { selector: '.image_wrapper .tempImage', tips: '步骤1' },
      { selector: '.bottomIcon .setting', tips: '步骤2' },
      { selector: '.bottomIcon .playback', tips: '步骤3' },
      { selector: '.bottomIcon .buyBtn', tips: '步骤4', scrollViewSelector: '.scroll-view' },
    ],
  },
  ...
})
```

# Props
| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| options | Array | [] | 引导步骤数据 |
| options[].selector | String | '' | 引导元素选择器 |
| options[].tips | String | '' | 引导提示文字 |
| options[].scrollViewSelector | String | '' | 引导元素所在的滚动元素选择器，如果引导元素在滚动元素内，需要传入该参数，否则引导元素可能会被滚动元素遮挡 |
| hollowOut | Boolean | false | 是否镂空引导元素，关闭时点击镂空位置会触发下一步，开启时高亮区域为镂空状态，点击事件可以正常触发，需要自己调用 `nextStep` 方法进行下一步 |
| initDelay | Number | 500 | 初始化延迟时间，防止元素还未创建时就开始查询节点，单位ms |
| zIndex | Number | 3000 | 层级 |
| pageKey | String | '' | 页面标识，用于区分同页面的不同引导，不传默认为路由字符串 |
| animationTime | Number | 250 | 动画时间，单位ms |
| tipsWrapperClass | String | '' | 提示文字容器类名 |
| nextBtnText | String | '下一步' | 下一步按钮文字 |
| nextBtnClass | String | '' | 下一步按钮类名 |
| endBtnText | String | '我知道了' | 完成按钮文字 |
| endBtnClass | String | '' | 完成按钮类名 |
| jumpAllBtnText | String | '全部跳过' | 跳过按钮文字 |
| maskPadding | Number | 5 | 遮罩层与引导元素的间距，单位px |

# Events
| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| stepChange | 引导步骤变化时触发 | `{ pageKey: string, step: number }` |
| end | 引导结束时触发 | `{ pageKey: string }` |

# Methods
| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| nextStep | 下一步 | - |

```xml
<weapp-new-user-guide
  wx:if="{{ showGuide }}"
  id="guide"
  hollowOut
  options="{{ guideData }}"
  bind:stepChange="onGuideStepChange"
  bind:end="onGuideEnd"
/>
```

```js
this.selectComponent('#guide')?.nextStep()
```