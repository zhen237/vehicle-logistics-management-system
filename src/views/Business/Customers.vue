<template>
  <div class="customers-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <UserOutlined />
        客户管理
      </h1>
      <p>管理客户信息，维护客户关系，提升服务质量</p>
    </div>

    <!-- 操作工具栏 -->
    <a-card class="toolbar-card">
      <a-row :gutter="[16, 16]" align="middle">
        <a-col :xs="24" :sm="12" :md="8">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索客户名称、联系人、电话"
            @search="handleSearch"
            style="width: 100%"
          />
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-space>
            <a-select v-model:value="filterType" placeholder="客户类型" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部类型</a-select-option>
              <a-select-option value="零售连锁">零售连锁</a-select-option>
              <a-select-option value="物流公司">物流公司</a-select-option>
              <a-select-option value="制造企业">制造企业</a-select-option>
              <a-select-option value="其他">其他</a-select-option>
            </a-select>

            <a-select v-model:value="filterCredit" placeholder="信用等级" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部等级</a-select-option>
              <a-select-option value="AAA">AAA级</a-select-option>
              <a-select-option value="AA">AA级</a-select-option>
              <a-select-option value="A">A级</a-select-option>
              <a-select-option value="B">B级</a-select-option>
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
              新增客户
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 客户统计卡片 -->
    <a-row :gutter="[16, 16]" class="stats-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="总客户数"
            :value="customerStats.total"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="活跃客户"
            :value="customerStats.active"
            :value-style="{ color: '#52c41a' }"
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
            title="本月新增"
            :value="customerStats.newThisMonth"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <UserAddOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="总交易额"
            :value="customerStats.totalAmount"
            :value-style="{ color: '#fa8c16' }"
            :formatter="(value) => `¥${(value / 10000).toFixed(0)}万`"
          >
            <template #prefix>
              <DollarOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 客户列表 -->
    <a-card title="客户列表" class="customers-table-card">
      <template #extra>
        <a-space>
          <a-button size="small" @click="handleBatchContact" :disabled="selectedRowKeys.length === 0">
            <PhoneOutlined />
            批量联系
          </a-button>
          <a-dropdown>
            <a-button size="small">
              更多操作
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="handleBatchTag">批量标签</a-menu-item>
                <a-menu-item key="2" @click="handleBatchExport">批量导出</a-menu-item>
                <a-menu-item key="3" @click="handleBatchDelete">批量删除</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-space>
      </template>

      <a-table
        :columns="customerColumns"
        :data-source="filteredCustomers"
        :pagination="pagination"
        :loading="loading"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
        size="small"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a @click="viewCustomerDetail(record)">{{ record.name }}</a>
          </template>

          <template v-else-if="column.key === 'creditLevel'">
            <a-tag :color="getCreditColor(record.creditLevel)">
              {{ record.creditLevel }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'totalAmount'">
            ¥{{ record.totalAmount.toLocaleString() }}
          </template>

          <template v-else-if="column.key === 'cooperationYears'">
            <a-progress
              :percent="Math.min((record.cooperationYears / 10) * 100, 100)"
              size="small"
              :show-info="false"
            />
            <span class="ml-1">{{ record.cooperationYears }}年</span>
          </template>

          <template v-else-if="column.key === 'lastOrderDate'">
            {{ formatDate(record.lastOrderDate) }}
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a @click="editCustomer(record)">编辑</a>
              <a @click="contactCustomer(record)">联系</a>
              <a @click="viewOrders(record)">订单</a>
              <a-dropdown>
                <a>
                  更多
                  <DownOutlined />
                </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="viewContracts(record)">查看合同</a-menu-item>
                    <a-menu-item key="2" @click="addTag(record)">添加标签</a-menu-item>
                    <a-menu-item key="3" @click="exportCustomer(record)">导出信息</a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="4" @click="deleteCustomer(record)" style="color: #ff4d4f">删除客户</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  UserOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PlusOutlined,
  TeamOutlined,
  UserAddOutlined,
  DollarOutlined,
  PhoneOutlined,
  DownOutlined
} from '@ant-design/icons-vue'
import { customerData } from '@/data/mockData.js'

// 搜索和筛选
const searchKeyword = ref('')
const filterType = ref('')
const filterCredit = ref('')
const loading = ref(false)

// 表格选择
const selectedRowKeys = ref([])

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

// 客户统计
const customerStats = ref({
  total: customerData.length,
  active: customerData.filter(customer => customer.lastOrderDate >= '2024-06-01').length,
  newThisMonth: 8,
  totalAmount: customerData.reduce((sum, customer) => sum + customer.totalAmount, 0)
})

// 客户数据
const customers = ref(customerData.map(customer => ({
  ...customer,
  key: customer.id
})))

// 表格列配置
const customerColumns = [
  { title: '客户名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '客户类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '联系人', dataIndex: 'contact', key: 'contact', width: 100 },
  { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 130 },
  { title: '信用等级', dataIndex: 'creditLevel', key: 'creditLevel', width: 100 },
  { title: '合作年限', dataIndex: 'cooperationYears', key: 'cooperationYears', width: 120 },
  { title: '订单总数', dataIndex: 'totalOrders', key: 'totalOrders', width: 100 },
  { title: '交易总额', dataIndex: 'totalAmount', key: 'totalAmount', width: 120 },
  { title: '最后订单', dataIndex: 'lastOrderDate', key: 'lastOrderDate', width: 120 },
  { title: '操作', key: 'actions', width: 200, fixed: 'right' }
]

// 过滤后的客户数据
const filteredCustomers = computed(() => {
  let result = customers.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(customer =>
      customer.name.toLowerCase().includes(keyword) ||
      customer.contact.toLowerCase().includes(keyword) ||
      customer.phone.includes(keyword)
    )
  }

  // 类型过滤
  if (filterType.value) {
    result = result.filter(customer => customer.type === filterType.value)
  }

  // 信用等级过滤
  if (filterCredit.value) {
    result = result.filter(customer => customer.creditLevel === filterCredit.value)
  }

  pagination.value.total = result.length
  return result
})

// 获取信用等级颜色
const getCreditColor = (creditLevel) => {
  const colorMap = {
    'AAA': 'gold',
    'AA': 'green',
    'A': 'blue',
    'B': 'orange'
  }
  return colorMap[creditLevel] || 'default'
}

// 格式化日期
const formatDate = (dateStr) => {
  return dayjs(dateStr).format('YYYY-MM-DD')
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
  message.success('客户数据导出成功')
}

// 显示新增弹窗
const showAddModal = () => {
  message.info('打开新增客户弹窗')
}

// 表格选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 表格变化处理
const handleTableChange = (pag) => {
  pagination.value = { ...pagination.value, ...pag }
}

// 查看客户详情
const viewCustomerDetail = (record) => {
  message.info(`查看客户详情: ${record.name}`)
}

// 编辑客户
const editCustomer = (record) => {
  message.info(`编辑客户: ${record.name}`)
}

// 联系客户
const contactCustomer = (record) => {
  message.info(`联系客户: ${record.name} (${record.phone})`)
}

// 查看订单
const viewOrders = (record) => {
  message.info(`查看客户 ${record.name} 的订单记录`)
}

// 查看合同
const viewContracts = (record) => {
  message.info(`查看客户 ${record.name} 的合同记录`)
}

// 添加标签
const addTag = (record) => {
  message.info(`为客户 ${record.name} 添加标签`)
}

// 导出客户信息
const exportCustomer = (record) => {
  message.success(`客户 ${record.name} 信息导出成功`)
}

// 删除客户
const deleteCustomer = (record) => {
  const index = customers.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    customers.value.splice(index, 1)
    message.success('客户删除成功')
  }
}

// 批量联系
const handleBatchContact = () => {
  message.info(`批量联系 ${selectedRowKeys.value.length} 个客户`)
  selectedRowKeys.value = []
}

// 批量标签
const handleBatchTag = () => {
  message.info(`为 ${selectedRowKeys.value.length} 个客户添加标签`)
  selectedRowKeys.value = []
}

// 批量导出
const handleBatchExport = () => {
  message.success(`批量导出 ${selectedRowKeys.value.length} 个客户信息`)
  selectedRowKeys.value = []
}

// 批量删除
const handleBatchDelete = () => {
  customers.value = customers.value.filter(item => !selectedRowKeys.value.includes(item.key))
  message.success(`已删除 ${selectedRowKeys.value.length} 个客户`)
  selectedRowKeys.value = []
}

onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.customers-management {
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

.customers-table-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: none;
}

.text-right {
  text-align: right;

  @media (max-width: 768px) {
    text-align: left;
  }
}

.ml-1 {
  margin-left: 4px;
}

// 响应式设计
@media (max-width: 768px) {
  .customers-management {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 20px;
  }
}
</style>
