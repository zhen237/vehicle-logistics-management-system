<template>
  <div>
    <h1>个人资料</h1>
    <a-card title="用户信息" style="margin-bottom: 16px;">
      <a-descriptions :column="2">
        <a-descriptions-item label="用户名">admin</a-descriptions-item>
        <a-descriptions-item label="邮箱">admin@example.com</a-descriptions-item>
        <a-descriptions-item label="手机号">138****8888</a-descriptions-item>
        <a-descriptions-item label="部门">技术部</a-descriptions-item>
        <a-descriptions-item label="职位">系统管理员</a-descriptions-item>
        <a-descriptions-item label="注册时间">2024-01-01</a-descriptions-item>
      </a-descriptions>
    </a-card>
    
    <a-card title="操作">
      <a-space>
        <a-button type="primary">编辑资料</a-button>
        <a-button>修改密码</a-button>
        <a-button>头像设置</a-button>
      </a-space>
    </a-card>
  </div>
</template>

<script setup>
// 这里可以添加个人资料相关的逻辑
</script>

<style lang="scss" scoped>

</style>
