<template>
  <div>
    <h1>系统设置</h1>
    <a-row :gutter="16">
      <a-col :span="12">
        <a-card title="基本设置" style="margin-bottom: 16px;">
          <a-form layout="vertical">
            <a-form-item label="系统名称">
              <a-input v-model:value="systemName" placeholder="请输入系统名称" />
            </a-form-item>
            <a-form-item label="系统描述">
              <a-textarea v-model:value="systemDesc" placeholder="请输入系统描述" :rows="3" />
            </a-form-item>
            <a-form-item label="主题色">
              <a-select v-model:value="themeColor" placeholder="选择主题色">
                <a-select-option value="blue">蓝色</a-select-option>
                <a-select-option value="green">绿色</a-select-option>
                <a-select-option value="red">红色</a-select-option>
              </a-select>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>

      <a-col :span="12">
        <a-card title="安全设置">
          <a-form layout="vertical">
            <a-form-item label="登录超时时间">
              <a-input-number v-model:value="loginTimeout" :min="1" :max="24" addon-after="小时" />
            </a-form-item>
            <a-form-item label="密码复杂度">
              <a-switch v-model:checked="passwordComplexity" checked-children="开" un-checked-children="关" />
            </a-form-item>
            <a-form-item label="双因子认证">
              <a-switch v-model:checked="twoFactorAuth" checked-children="开" un-checked-children="关" />
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>

    <!-- 环境信息卡片 -->
    <a-row :gutter="16" style="margin-top: 16px;">
      <a-col :span="24">
        <a-card title="环境信息">
          <a-descriptions :column="3" bordered>
            <a-descriptions-item label="应用名称">{{ envInfo.title }}</a-descriptions-item>
            <a-descriptions-item label="版本号">{{ envInfo.version }}</a-descriptions-item>
            <a-descriptions-item label="环境">{{ envInfo.env }}</a-descriptions-item>
            <a-descriptions-item label="API地址">{{ envInfo.apiBaseUrl }}</a-descriptions-item>
            <a-descriptions-item label="调试模式">
              <a-tag :color="envInfo.debug ? 'green' : 'red'">
                {{ envInfo.debug ? '开启' : '关闭' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="Mock数据">
              <a-tag :color="envInfo.mock ? 'blue' : 'gray'">
                {{ envInfo.mock ? '开启' : '关闭' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="日志级别">{{ envInfo.logLevel }}</a-descriptions-item>
            <a-descriptions-item label="请求超时">{{ envInfo.apiTimeout }}ms</a-descriptions-item>
            <a-descriptions-item label="构建时间">{{ envInfo.buildTime }}</a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>

    <a-card title="操作" style="margin-top: 16px;">
      <a-space>
        <a-button type="primary">保存设置</a-button>
        <a-button>重置</a-button>
        <a-button danger>恢复默认</a-button>
      </a-space>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { APP_CONFIG, API_CONFIG, LOG_CONFIG } from '@/config/env.js';

const systemName = ref('管理系统');
const systemDesc = ref('基于Vue3和Ant Design Vue的管理系统');
const themeColor = ref('blue');
const loginTimeout = ref(8);
const passwordComplexity = ref(true);
const twoFactorAuth = ref(false);

// 环境信息
const envInfo = computed(() => ({
  title: APP_CONFIG.title,
  version: APP_CONFIG.version,
  env: APP_CONFIG.env.toUpperCase(),
  debug: APP_CONFIG.debug,
  mock: APP_CONFIG.mock,
  apiBaseUrl: API_CONFIG.baseURL,
  apiTimeout: API_CONFIG.timeout,
  logLevel: LOG_CONFIG.level.toUpperCase(),
  buildTime: typeof __BUILD_TIME__ !== 'undefined' ?
    new Date(__BUILD_TIME__).toLocaleString('zh-CN') : '未知',
}));
</script>

<style lang="scss" scoped>

</style>
