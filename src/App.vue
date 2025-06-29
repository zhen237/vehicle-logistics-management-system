<template>
  <div>
    <a-config-provider :theme="theme" :locale="locale">
      <router-view />
    </a-config-provider>

    <UpCircleOutlined />
  </div>
</template>

<script setup>
import { UpCircleOutlined } from '@ant-design/icons-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN';

const theme = {
  token: {
    colorPrimary: '#00b96b', // 明显的绿色，便于验证颜色是否生效
  }
}

</script>

<style lang="scss" scoped></style>
