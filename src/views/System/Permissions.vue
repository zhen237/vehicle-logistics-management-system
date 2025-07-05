<template>
  <div class="permission-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <SafetyOutlined />
        权限管理
      </h1>
      <p>管理系统权限，配置访问控制，确保数据安全和操作规范</p>
    </div>

    <!-- 操作工具栏 -->
    <a-card class="toolbar-card">
      <a-row :gutter="[16, 16]" align="middle">
        <a-col :xs="24" :sm="12" :md="8">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索权限名称、编码"
            @search="handleSearch"
            style="width: 100%"
          />
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-space>
            <a-select v-model:value="filterModule" placeholder="功能模块" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部模块</a-select-option>
              <a-select-option value="系统管理">系统管理</a-select-option>
              <a-select-option value="用户管理">用户管理</a-select-option>
              <a-select-option value="数据管理">数据管理</a-select-option>
              <a-select-option value="业务管理">业务管理</a-select-option>
              <a-select-option value="车辆管理">车辆管理</a-select-option>
              <a-select-option value="调度管理">调度管理</a-select-option>
              <a-select-option value="员工管理">员工管理</a-select-option>
            </a-select>

            <a-select v-model:value="filterType" placeholder="权限类型" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部类型</a-select-option>
              <a-select-option value="菜单权限">菜单权限</a-select-option>
              <a-select-option value="操作权限">操作权限</a-select-option>
              <a-select-option value="数据权限">数据权限</a-select-option>
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
              新增权限
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 权限统计卡片 -->
    <a-row :gutter="[16, 16]" class="stats-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="总权限数"
            :value="permissionStats.total"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <SafetyOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="菜单权限"
            :value="permissionStats.menu"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <MenuOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="操作权限"
            :value="permissionStats.operation"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <ToolOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="数据权限"
            :value="permissionStats.data"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #prefix>
              <DatabaseOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 权限树形结构 -->
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="12">
        <a-card title="权限树形结构" class="permission-tree-card">
          <template #extra>
            <a-space>
              <a-button size="small" @click="expandAll">
                <PlusSquareOutlined />
                展开全部
              </a-button>
              <a-button size="small" @click="collapseAll">
                <MinusSquareOutlined />
                收起全部
              </a-button>
            </a-space>
          </template>

          <a-tree
            v-model:expandedKeys="expandedKeys"
            v-model:selectedKeys="selectedKeys"
            :tree-data="permissionTree"
            :field-names="{ children: 'children', title: 'name', key: 'id' }"
            show-line
            @select="onTreeSelect"
          >
            <template #title="{ name, type, code }">
              <span class="tree-node">
                <a-tag :color="getTypeColor(type)" size="small">{{ type }}</a-tag>
                <span class="node-name">{{ name }}</span>
                <span class="node-code">{{ code }}</span>
              </span>
            </template>
          </a-tree>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="12">
        <a-card title="权限详情" class="permission-detail-card">
          <div v-if="selectedPermission" class="permission-detail">
            <div class="permission-header">
              <div class="permission-info">
                <h3>{{ selectedPermission.name }}</h3>
                <p>{{ selectedPermission.description }}</p>
                <a-space>
                  <a-tag :color="getTypeColor(selectedPermission.type)">{{ selectedPermission.type }}</a-tag>
                  <a-tag color="blue">{{ selectedPermission.module }}</a-tag>
                </a-space>
              </div>
            </div>

            <a-divider />

            <div class="permission-info-detail">
              <a-descriptions :column="1" size="small">
                <a-descriptions-item label="权限编码">{{ selectedPermission.code }}</a-descriptions-item>
                <a-descriptions-item label="功能模块">{{ selectedPermission.module }}</a-descriptions-item>
                <a-descriptions-item label="权限类型">{{ selectedPermission.type }}</a-descriptions-item>
                <a-descriptions-item label="资源路径">{{ selectedPermission.resource || '-' }}</a-descriptions-item>
                <a-descriptions-item label="请求方法">{{ selectedPermission.method || '-' }}</a-descriptions-item>
                <a-descriptions-item label="排序">{{ selectedPermission.sort }}</a-descriptions-item>
                <a-descriptions-item label="创建时间">{{ formatDateTime(selectedPermission.createTime) }}</a-descriptions-item>
                <a-descriptions-item label="更新时间">{{ formatDateTime(selectedPermission.updateTime) }}</a-descriptions-item>
              </a-descriptions>
            </div>

            <a-divider />

            <div class="permission-actions">
              <a-space direction="vertical" style="width: 100%">
                <a-button type="primary" block @click="editPermission(selectedPermission)">
                  <EditOutlined />
                  编辑权限
                </a-button>
                <a-button block @click="viewRoles(selectedPermission)">
                  <TeamOutlined />
                  查看角色
                </a-button>
                <a-button block @click="viewUsers(selectedPermission)">
                  <UserOutlined />
                  查看用户
                </a-button>
                <a-button block @click="addSubPermission(selectedPermission)" v-if="selectedPermission.type === '菜单权限'">
                  <PlusOutlined />
                  添加子权限
                </a-button>
              </a-space>
            </div>
          </div>

          <div v-else class="no-selection">
            <a-empty description="请选择权限查看详情" />
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
  SafetyOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PlusOutlined,
  MenuOutlined,
  ToolOutlined,
  DatabaseOutlined,
  PlusSquareOutlined,
  MinusSquareOutlined,
  EditOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons-vue'

// 搜索和筛选
const searchKeyword = ref('')
const filterModule = ref('')
const filterType = ref('')
const loading = ref(false)

// 树形控制
const expandedKeys = ref(['PERM001', 'PERM002', 'PERM003', 'PERM004', 'PERM005', 'PERM006', 'PERM007'])
const selectedKeys = ref([])
const selectedPermission = ref(null)

// 权限数据
const permissionList = ref([
  // 系统管理
  {
    id: 'PERM001',
    name: '系统管理',
    code: 'system',
    description: '系统管理模块',
    module: '系统管理',
    type: '菜单权限',
    resource: '/system',
    method: 'GET',
    sort: 1,
    parentId: null,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00',
    children: [
      {
        id: 'PERM001001',
        name: '用户管理',
        code: 'system:user',
        description: '用户管理页面',
        module: '系统管理',
        type: '菜单权限',
        resource: '/system/users',
        method: 'GET',
        sort: 1,
        parentId: 'PERM001',
        createTime: '2024-01-01 00:00:00',
        updateTime: '2024-01-01 00:00:00',
        children: [
          {
            id: 'PERM001001001',
            name: '新增用户',
            code: 'system:user:add',
            description: '新增用户操作',
            module: '系统管理',
            type: '操作权限',
            resource: '/api/users',
            method: 'POST',
            sort: 1,
            parentId: 'PERM001001',
            createTime: '2024-01-01 00:00:00',
            updateTime: '2024-01-01 00:00:00'
          },
          {
            id: 'PERM001001002',
            name: '编辑用户',
            code: 'system:user:edit',
            description: '编辑用户操作',
            module: '系统管理',
            type: '操作权限',
            resource: '/api/users/*',
            method: 'PUT',
            sort: 2,
            parentId: 'PERM001001',
            createTime: '2024-01-01 00:00:00',
            updateTime: '2024-01-01 00:00:00'
          },
          {
            id: 'PERM001001003',
            name: '删除用户',
            code: 'system:user:delete',
            description: '删除用户操作',
            module: '系统管理',
            type: '操作权限',
            resource: '/api/users/*',
            method: 'DELETE',
            sort: 3,
            parentId: 'PERM001001',
            createTime: '2024-01-01 00:00:00',
            updateTime: '2024-01-01 00:00:00'
          }
        ]
      },
      {
        id: 'PERM001002',
        name: '角色管理',
        code: 'system:role',
        description: '角色管理页面',
        module: '系统管理',
        type: '菜单权限',
        resource: '/system/roles',
        method: 'GET',
        sort: 2,
        parentId: 'PERM001',
        createTime: '2024-01-01 00:00:00',
        updateTime: '2024-01-01 00:00:00',
        children: [
          {
            id: 'PERM001002001',
            name: '新增角色',
            code: 'system:role:add',
            description: '新增角色操作',
            module: '系统管理',
            type: '操作权限',
            resource: '/api/roles',
            method: 'POST',
            sort: 1,
            parentId: 'PERM001002',
            createTime: '2024-01-01 00:00:00',
            updateTime: '2024-01-01 00:00:00'
          },
          {
            id: 'PERM001002002',
            name: '配置权限',
            code: 'system:role:permission',
            description: '配置角色权限',
            module: '系统管理',
            type: '操作权限',
            resource: '/api/roles/*/permissions',
            method: 'PUT',
            sort: 2,
            parentId: 'PERM001002',
            createTime: '2024-01-01 00:00:00',
            updateTime: '2024-01-01 00:00:00'
          }
        ]
      }
    ]
  },
  // 数据管理
  {
    id: 'PERM002',
    name: '数据管理',
    code: 'data',
    description: '数据管理模块',
    module: '数据管理',
    type: '菜单权限',
    resource: '/data',
    method: 'GET',
    sort: 2,
    parentId: null,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00',
    children: [
      {
        id: 'PERM002001',
        name: '订单管理',
        code: 'data:order',
        description: '订单数据管理',
        module: '数据管理',
        type: '菜单权限',
        resource: '/data/orders',
        method: 'GET',
        sort: 1,
        parentId: 'PERM002',
        createTime: '2024-01-01 00:00:00',
        updateTime: '2024-01-01 00:00:00'
      },
      {
        id: 'PERM002002',
        name: '客户管理',
        code: 'data:customer',
        description: '客户数据管理',
        module: '数据管理',
        type: '菜单权限',
        resource: '/data/customers',
        method: 'GET',
        sort: 2,
        parentId: 'PERM002',
        createTime: '2024-01-01 00:00:00',
        updateTime: '2024-01-01 00:00:00'
      }
    ]
  },
  // 车辆管理
  {
    id: 'PERM003',
    name: '车辆管理',
    code: 'vehicle',
    description: '车辆管理模块',
    module: '车辆管理',
    type: '菜单权限',
    resource: '/vehicle',
    method: 'GET',
    sort: 3,
    parentId: null,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00',
    children: [
      {
        id: 'PERM003001',
        name: '车辆档案',
        code: 'vehicle:list',
        description: '车辆档案管理',
        module: '车辆管理',
        type: '菜单权限',
        resource: '/vehicle/list',
        method: 'GET',
        sort: 1,
        parentId: 'PERM003',
        createTime: '2024-01-01 00:00:00',
        updateTime: '2024-01-01 00:00:00'
      },
      {
        id: 'PERM003002',
        name: '维修记录',
        code: 'vehicle:maintenance',
        description: '车辆维修记录',
        module: '车辆管理',
        type: '菜单权限',
        resource: '/vehicle/maintenance',
        method: 'GET',
        sort: 2,
        parentId: 'PERM003',
        createTime: '2024-01-01 00:00:00',
        updateTime: '2024-01-01 00:00:00'
      }
    ]
  }
])

// 权限统计
const permissionStats = ref({
  total: 0,
  menu: 0,
  operation: 0,
  data: 0
})

// 计算权限统计
const calculateStats = () => {
  const flatPermissions = []

  const flatten = (permissions) => {
    permissions.forEach(permission => {
      flatPermissions.push(permission)
      if (permission.children) {
        flatten(permission.children)
      }
    })
  }

  flatten(permissionList.value)

  permissionStats.value = {
    total: flatPermissions.length,
    menu: flatPermissions.filter(p => p.type === '菜单权限').length,
    operation: flatPermissions.filter(p => p.type === '操作权限').length,
    data: flatPermissions.filter(p => p.type === '数据权限').length
  }
}

// 权限树形数据
const permissionTree = computed(() => {
  return permissionList.value
})

// 获取类型颜色
const getTypeColor = (type) => {
  const colorMap = {
    '菜单权限': 'blue',
    '操作权限': 'green',
    '数据权限': 'orange'
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
}

// 筛选处理
const handleFilter = () => {
  // 筛选逻辑
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
  message.success('权限数据导出成功')
}

// 显示新增弹窗
const showAddModal = () => {
  message.info('打开新增权限弹窗')
}

// 展开全部
const expandAll = () => {
  const getAllKeys = (permissions) => {
    const keys = []
    permissions.forEach(permission => {
      keys.push(permission.id)
      if (permission.children) {
        keys.push(...getAllKeys(permission.children))
      }
    })
    return keys
  }
  expandedKeys.value = getAllKeys(permissionList.value)
}

// 收起全部
const collapseAll = () => {
  expandedKeys.value = []
}

// 树形选择
const onTreeSelect = (keys, { node }) => {
  if (keys.length > 0) {
    selectedPermission.value = node
  } else {
    selectedPermission.value = null
  }
}

// 编辑权限
const editPermission = (permission) => {
  message.info(`编辑权限: ${permission.name}`)
}

// 查看角色
const viewRoles = (permission) => {
  message.info(`查看权限关联角色: ${permission.name}`)
}

// 查看用户
const viewUsers = (permission) => {
  message.info(`查看权限关联用户: ${permission.name}`)
}

// 添加子权限
const addSubPermission = (permission) => {
  message.info(`为权限 ${permission.name} 添加子权限`)
}

onMounted(() => {
  calculateStats()
})
</script>

<style lang="scss" scoped>
.permission-management {
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

.permission-tree-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: none;

  .tree-node {
    display: flex;
    align-items: center;
    gap: 8px;

    .node-name {
      font-weight: 500;
      color: #262626;
    }

    .node-code {
      font-size: 12px;
      color: #8c8c8c;
      font-family: 'Courier New', monospace;
    }
  }
}

.permission-detail-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: none;
}

.permission-detail {
  .permission-header {
    .permission-info {
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

  .permission-info-detail {
    margin: 16px 0;
  }

  .permission-actions {
    margin-top: 16px;
  }
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.text-right {
  text-align: right;

  @media (max-width: 768px) {
    text-align: left;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .permission-management {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .tree-node {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
