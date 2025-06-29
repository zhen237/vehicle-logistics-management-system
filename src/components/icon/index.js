// 当前文件用于把图标组件注册为全局组件
import { UpCircleOutlined } from '@ant-design/icons-vue'


// 注册为全局组件
const icons=[
  UpCircleOutlined
]
// app.use({install(){}})
export default {
  install(app){
    // 遍历图标数组
    icons.forEach(icon=>{
      //注册为全局组件
      app.component(icon.name,icon)
    })
  }
}
