import { createApp } from 'vue'
import App from './App.vue'
import Icon from './components/icon'
import router from './router'
// 导入 Ant Design Vue
import Antd from 'ant-design-vue'
// 导入 Ant Design Vue 样式
import 'ant-design-vue/dist/reset.css'

const app = createApp(App)
app.use(router)
app.use(Icon)
app.use(Antd)
app.mount('#app')
