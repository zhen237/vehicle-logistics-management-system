<template>
  <div class="role-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <TeamOutlined />
        角色管理
      </h1>
      <p>管理系统角色，配置权限分配，确保系统安全有序运行</p>
    </div>

    <!-- 操作工具栏 -->
    <a-card class="toolbar-card">
      <a-row :gutter="[16, 16]" align="middle">
        <a-col :xs="24" :sm="12" :md="8">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索角色名称、描述"
            @search="handleSearch"
            style="width: 100%"
          />
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-space>
            <a-select v-model:value="filterStatus" placeholder="角色状态" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部状态</a-select-option>
              <a-select-option value="启用">启用</a-select-option>
              <a-select-option value="禁用">禁用</a-select-option>
            </a-select>

            <a-select v-model:value="filterType" placeholder="角色类型" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部类型</a-select-option>
              <a-select-option value="系统角色">系统角色</a-select-option>
              <a-select-option value="业务角色">业务角色</a-select-option>
              <a-select-option value="自定义角色">自定义角色</a-select-option>
            </a-select>
          </a-space>
        </a-col>

        <a-col :xs="24" :sm="24" :md="8" class="text-right">
          <a-space>
            <a-button @click="handleRefresh">
              <ReloadOutlined />
              刷新
            </a-button>
            <a-button @click="handleExport">
              <DownloadOutlined />
              导出
            </a-button>
            <a-button type="primary" @click="showAddModal">
              <PlusOutlined />
              新增角色
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 角色统计卡片 -->
    <a-row :gutter="[16, 16]" class="stats-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="总角色数"
            :value="roleStats.total"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <TeamOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="启用角色"
            :value="roleStats.active"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <CheckCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="系统角色"
            :value="roleStats.system"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <SettingOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="自定义角色"
            :value="roleStats.custom"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 角色列表 -->
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="16">
        <a-card title="角色列表" class="role-table-card">
          <template #extra>
            <a-space>
              <a-button size="small" @click="handleBatchEnable" :disabled="selectedRowKeys.length === 0">
                <CheckOutlined />
                批量启用
              </a-button>
              <a-dropdown>
                <a-button size="small">
                  更多操作
                  <DownOutlined />
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="handleBatchDisable">批量禁用</a-menu-item>
                    <a-menu-item key="2" @click="handleBatchExport">批量导出</a-menu-item>
                    <a-menu-item key="3" @click="handleBatchDelete">批量删除</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </template>

          <a-table
            :columns="roleColumns"
            :data-source="filteredRoles"
            :pagination="pagination"
            :loading="loading"
            :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
            @change="handleTableChange"
            size="small"
            bordered
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                <a @click="viewRoleDetail(record)">{{ record.name }}</a>
              </template>

              <template v-else-if="column.key === 'status'">
                <a-tag :color="getStatusColor(record.status)">
                  {{ record.status }}
                </a-tag>
              </template>

              <template v-else-if="column.key === 'type'">
                <a-tag :color="getTypeColor(record.type)">
                  {{ record.type }}
                </a-tag>
              </template>

              <template v-else-if="column.key === 'userCount'">
                <a @click="viewRoleUsers(record)">{{ record.userCount }}人</a>
              </template>

              <template v-else-if="column.key === 'permissionCount'">
                <a @click="viewRolePermissions(record)">{{ record.permissionCount }}项</a>
              </template>

              <template v-else-if="column.key === 'createTime'">
                {{ formatDateTime(record.createTime) }}
              </template>

              <template v-else-if="column.key === 'actions'">
                <a-space>
                  <a @click="editRole(record)">编辑</a>
                  <a @click="configPermissions(record)">配置权限</a>
                  <a @click="assignUsers(record)">分配用户</a>
                  <a-dropdown>
                    <a>
                      更多
                      <DownOutlined />
                    </a>
                    <template #overlay>
                      <a-menu>
                        <a-menu-item key="1" @click="copyRole(record)">复制角色</a-menu-item>
                        <a-menu-item key="2" @click="exportRole(record)">导出角色</a-menu-item>
                        <a-menu-item key="3" @click="viewAuditLog(record)">审计日志</a-menu-item>
                        <a-menu-divider />
                        <a-menu-item key="4" @click="toggleRoleStatus(record)">
                          {{ record.status === '启用' ? '禁用' : '启用' }}
                        </a-menu-item>
                        <a-menu-item key="5" @click="deleteRole(record)" style="color: #ff4d4f" v-if="record.type !== '系统角色'">
                          删除角色
                        </a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="8">
        <a-card title="角色详情" class="role-detail-card">
          <div v-if="selectedRole" class="role-detail">
            <div class="role-header">
              <a-avatar :size="64" :style="{ backgroundColor: getTypeColor(selectedRole.type) }">
                {{ selectedRole.name.charAt(0) }}
              </a-avatar>
              <div class="role-info">
                <h3>{{ selectedRole.name }}</h3>
                <p>{{ selectedRole.description }}</p>
                <a-tag :color="getStatusColor(selectedRole.status)">{{ selectedRole.status }}</a-tag>
                <a-tag :color="getTypeColor(selectedRole.type)">{{ selectedRole.type }}</a-tag>
              </div>
            </div>

            <a-divider />

            <div class="role-stats">
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-statistic title="用户数量" :value="selectedRole.userCount" suffix="人" />
                </a-col>
                <a-col :span="12">
                  <a-statistic title="权限数量" :value="selectedRole.permissionCount" suffix="项" />
                </a-col>
              </a-row>
            </div>

            <a-divider />

            <div class="role-actions">
              <a-space direction="vertical" style="width: 100%">
                <a-button type="primary" block @click="configPermissions(selectedRole)">
                  <SettingOutlined />
                  配置权限
                </a-button>
                <a-button block @click="assignUsers(selectedRole)">
                  <UserAddOutlined />
                  分配用户
                </a-button>
                <a-button block @click="viewAuditLog(selectedRole)">
                  <FileTextOutlined />
                  审计日志
                </a-button>
              </a-space>
            </div>
          </div>

          <div v-else class="no-selection">
            <a-empty description="请选择角色查看详情" />
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  TeamOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  UserOutlined,
  CheckOutlined,
  DownOutlined,
  UserAddOutlined,
  FileTextOutlined
} from '@ant-design/icons-vue'

// 搜索和筛选
const searchKeyword = ref('')
const filterStatus = ref('')
const filterType = ref('')
const loading = ref(false)

// 表格选择
const selectedRowKeys = ref([])
const selectedRole = ref(null)

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

// 角色数据
const roleList = ref([
  {
    id: 'ROLE001',
    name: '超级管理员',
    code: 'super_admin',
    description: '系统超级管理员，拥有所有权限',
    type: '系统角色',
    status: '启用',
    userCount: 1,
    permissionCount: 50,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00',
    creator: '系统',
    key: 'ROLE001'
  },
  {
    id: 'ROLE002',
    name: '系统管理员',
    code: 'system_admin',
    description: '系统管理员，负责系统配置和用户管理',
    type: '系统角色',
    status: '启用',
    userCount: 2,
    permissionCount: 35,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-06-15 10:30:00',
    creator: '超级管理员',
    key: 'ROLE002'
  },
  {
    id: 'ROLE003',
    name: '调度管理员',
    code: 'dispatch_admin',
    description: '调度管理员，负责车辆调度和运输管理',
    type: '业务角色',
    status: '启用',
    userCount: 5,
    permissionCount: 25,
    createTime: '2024-02-01 09:00:00',
    updateTime: '2024-06-20 14:20:00',
    creator: '系统管理员',
    key: 'ROLE003'
  },
  {
    id: 'ROLE004',
    name: '财务管理员',
    code: 'finance_admin',
    description: '财务管理员，负责财务数据和薪资管理',
    type: '业务角色',
    status: '启用',
    userCount: 3,
    permissionCount: 20,
    createTime: '2024-02-01 09:00:00',
    updateTime: '2024-06-18 16:45:00',
    creator: '系统管理员',
    key: 'ROLE004'
  },
  {
    id: 'ROLE005',
    name: '人事管理员',
    code: 'hr_admin',
    description: '人事管理员，负责员工管理和考勤管理',
    type: '业务角色',
    status: '启用',
    userCount: 2,
    permissionCount: 18,
    createTime: '2024-02-01 09:00:00',
    updateTime: '2024-06-22 11:15:00',
    creator: '系统管理员',
    key: 'ROLE005'
  },
  {
    id: 'ROLE006',
    name: '普通用户',
    code: 'normal_user',
    description: '普通用户，只能查看基本信息',
    type: '自定义角色',
    status: '启用',
    userCount: 15,
    permissionCount: 8,
    createTime: '2024-03-01 10:00:00',
    updateTime: '2024-06-25 09:30:00',
    creator: '系统管理员',
    key: 'ROLE006'
  },
  {
    id: 'ROLE007',
    name: '测试角色',
    code: 'test_role',
    description: '测试用角色，用于功能测试',
    type: '自定义角色',
    status: '禁用',
    userCount: 0,
    permissionCount: 5,
    createTime: '2024-06-01 15:00:00',
    updateTime: '2024-06-01 15:00:00',
    creator: '系统管理员',
    key: 'ROLE007'
  }
])

// 角色统计
const roleStats = ref({
  total: roleList.value.length,
  active: roleList.value.filter(role => role.status === '启用').length,
  system: roleList.value.filter(role => role.type === '系统角色').length,
  custom: roleList.value.filter(role => role.type === '自定义角色').length
})

// 表格列配置
const roleColumns = [
  { title: '角色名称', dataIndex: 'name', key: 'name', width: 150 },
  { title: '角色编码', dataIndex: 'code', key: 'code', width: 150 },
  { title: '角色类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '用户数量', dataIndex: 'userCount', key: 'userCount', width: 100 },
  { title: '权限数量', dataIndex: 'permissionCount', key: 'permissionCount', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 150 },
  { title: '操作', key: 'actions', width: 250, fixed: 'right' }
]

// 过滤后的角色数据
const filteredRoles = computed(() => {
  let result = roleList.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(role =>
      role.name.toLowerCase().includes(keyword) ||
      role.code.toLowerCase().includes(keyword) ||
      role.description.toLowerCase().includes(keyword)
    )
  }

  // 状态过滤
  if (filterStatus.value) {
    result = result.filter(role => role.status === filterStatus.value)
  }

  // 类型过滤
  if (filterType.value) {
    result = result.filter(role => role.type === filterType.value)
  }

  pagination.value.total = result.length
  return result
})

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    '启用': 'green',
    '禁用': 'red'
  }
  return colorMap[status] || 'default'
}

// 获取类型颜色
const getTypeColor = (type) => {
  const colorMap = {
    '系统角色': 'purple',
    '业务角色': 'blue',
    '自定义角色': 'orange'
  }
  return colorMap[type] || 'default'
}

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  return dateTimeStr ? dayjs(dateTimeStr).format('YYYY-MM-DD HH:mm') : '-'
}

// 搜索处理
const handleSearch = (value) => {
  searchKeyword.value = value
  pagination.value.current = 1
}

// 筛选处理
const handleFilter = () => {
  pagination.value.current = 1
}

// 刷新数据
const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('数据已刷新')
  }, 1000)
}

// 导出数据
const handleExport = () => {
  message.success('角色数据导出成功')
}

// 显示新增弹窗
const showAddModal = () => {
  message.info('打开新增角色弹窗')
}

// 表格选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 表格变化处理
const handleTableChange = (pag) => {
  pagination.value = { ...pagination.value, ...pag }
}

// 查看角色详情
const viewRoleDetail = (record) => {
  selectedRole.value = record
  message.info(`查看角色详情: ${record.name}`)
}

// 编辑角色
const editRole = (record) => {
  message.info(`编辑角色: ${record.name}`)
}

// 配置权限
const configPermissions = (record) => {
  message.info(`配置角色权限: ${record.name}`)
}

// 分配用户
const assignUsers = (record) => {
  message.info(`分配用户到角色: ${record.name}`)
}

// 查看角色用户
const viewRoleUsers = (record) => {
  message.info(`查看角色用户: ${record.name}`)
}

// 查看角色权限
const viewRolePermissions = (record) => {
  message.info(`查看角色权限: ${record.name}`)
}

// 复制角色
const copyRole = (record) => {
  message.success(`角色 ${record.name} 已复制`)
}

// 导出角色
const exportRole = (record) => {
  message.success(`角色 ${record.name} 导出成功`)
}

// 查看审计日志
const viewAuditLog = (record) => {
  message.info(`查看角色审计日志: ${record.name}`)
}

// 切换角色状态
const toggleRoleStatus = (record) => {
  const newStatus = record.status === '启用' ? '禁用' : '启用'
  record.status = newStatus
  record.updateTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  message.success(`角色 ${record.name} 已${newStatus}`)
}

// 删除角色
const deleteRole = (record) => {
  const index = roleList.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    roleList.value.splice(index, 1)
    message.success(`角色 ${record.name} 已删除`)
  }
}

// 批量启用
const handleBatchEnable = () => {
  selectedRowKeys.value.forEach(key => {
    const role = roleList.value.find(item => item.key === key)
    if (role) {
      role.status = '启用'
      role.updateTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  })
  message.success(`批量启用 ${selectedRowKeys.value.length} 个角色`)
  selectedRowKeys.value = []
}

// 批量禁用
const handleBatchDisable = () => {
  selectedRowKeys.value.forEach(key => {
    const role = roleList.value.find(item => item.key === key)
    if (role && role.type !== '系统角色') {
      role.status = '禁用'
      role.updateTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  })
  message.success(`批量禁用 ${selectedRowKeys.value.length} 个角色`)
  selectedRowKeys.value = []
}

// 批量导出
const handleBatchExport = () => {
  message.success(`批量导出 ${selectedRowKeys.value.length} 个角色`)
  selectedRowKeys.value = []
}

// 批量删除
const handleBatchDelete = () => {
  const deletableKeys = selectedRowKeys.value.filter(key => {
    const role = roleList.value.find(item => item.key === key)
    return role && role.type !== '系统角色'
  })

  deletableKeys.forEach(key => {
    const index = roleList.value.findIndex(item => item.key === key)
    if (index > -1) {
      roleList.value.splice(index, 1)
    }
  })

  message.success(`批量删除 ${deletableKeys.length} 个角色`)
  selectedRowKeys.value = []
}

onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.role-management {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;

  h1 {
    font-size: 24px;
    font-weight: 600;
    color: #262626;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 8px;

    .anticon {
      color: #1890ff;
    }
  }

  p {
    color: #8c8c8c;
    margin: 0;
    font-size: 14px;
  }
}

.toolbar-card {
  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: none;
}

.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: none;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
}

.role-table-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: none;
}

.role-detail-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: none;
}

.role-detail {
  .role-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;

    .role-info {
      flex: 1;

      h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
        color: #262626;
      }

      p {
        margin: 0 0 12px 0;
        color: #8c8c8c;
        font-size: 14px;
        line-height: 1.5;
      }
    }
  }

  .role-stats {
    margin: 16px 0;
  }

  .role-actions {
    margin-top: 16px;
  }
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.text-right {
  text-align: right;

  @media (max-width: 768px) {
    text-align: left;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .role-management {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .role-header {
    flex-direction: column;
    text-align: center;

    .role-info {
      text-align: center;
    }
  }
}
</style>
