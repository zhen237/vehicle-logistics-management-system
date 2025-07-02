<template>
  <div class="insurance-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <SafetyOutlined />
        保险管理
      </h1>
      <p>管理车辆保险信息，及时续保，确保车辆合规运营</p>
    </div>

    <!-- 操作工具栏 -->
    <a-card class="toolbar-card">
      <a-row :gutter="[16, 16]" align="middle">
        <a-col :xs="24" :sm="12" :md="8">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索车牌号、保险公司"
            @search="handleSearch"
            style="width: 100%"
          />
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-space>
            <a-select v-model:value="filterType" placeholder="保险类型" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部类型</a-select-option>
              <a-select-option value="交强险">交强险</a-select-option>
              <a-select-option value="商业险">商业险</a-select-option>
              <a-select-option value="第三者责任险">第三者责任险</a-select-option>
              <a-select-option value="车损险">车损险</a-select-option>
            </a-select>

            <a-select v-model:value="filterStatus" placeholder="保险状态" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部状态</a-select-option>
              <a-select-option value="有效">有效</a-select-option>
              <a-select-option value="即将到期">即将到期</a-select-option>
              <a-select-option value="已到期">已到期</a-select-option>
              <a-select-option value="已失效">已失效</a-select-option>
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
              新增保险
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 保险统计卡片 -->
    <a-row :gutter="[16, 16]" class="stats-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="总保险数"
            :value="insuranceStats.total"
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
            title="有效保险"
            :value="insuranceStats.active"
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
            title="即将到期"
            :value="insuranceStats.expiringSoon"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #prefix>
              <ClockCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="保险费用"
            :value="insuranceStats.totalCost"
            :value-style="{ color: '#722ed1' }"
            :formatter="(value) => `¥${(value / 10000).toFixed(1)}万`"
          >
            <template #prefix>
              <DollarOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 到期提醒 -->
    <a-card title="到期提醒" class="reminder-card" v-if="expiringInsurance.length > 0">
      <template #extra>
        <a-button size="small" @click="handleAllRenewals">
          批量续保
        </a-button>
      </template>

      <a-list
        :data-source="expiringInsurance"
        size="small"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #avatar>
                <a-avatar :style="{ backgroundColor: item.daysLeft <= 7 ? '#ff4d4f' : '#faad14' }">
                  <ClockCircleOutlined />
                </a-avatar>
              </template>
              <template #title>
                <span>{{ item.vehicleNumber }} - {{ item.type }}</span>
                <a-tag :color="item.daysLeft <= 7 ? 'red' : 'orange'" class="ml-2">
                  {{ item.daysLeft <= 0 ? '已到期' : `${item.daysLeft}天后到期` }}
                </a-tag>
              </template>
              <template #description>
                保险公司：{{ item.company }} | 到期日期：{{ formatDate(item.endDate) }}
              </template>
            </a-list-item-meta>
            <template #actions>
              <a @click="renewInsurance(item)">续保</a>
              <a @click="viewInsurance(item)">查看</a>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </a-card>

    <!-- 保险列表 -->
    <a-card title="保险列表" class="insurance-table-card">
      <template #extra>
        <a-space>
          <a-button size="small" @click="handleBatchRenew" :disabled="selectedRowKeys.length === 0">
            <SyncOutlined />
            批量续保
          </a-button>
          <a-dropdown>
            <a-button size="small">
              更多操作
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="handleBatchExport">批量导出</a-menu-item>
                <a-menu-item key="2" @click="handleBatchNotify">批量提醒</a-menu-item>
                <a-menu-item key="3" @click="handleBatchDelete">批量删除</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-space>
      </template>

      <a-table
        :columns="insuranceColumns"
        :data-source="filteredInsurance"
        :pagination="pagination"
        :loading="loading"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
        size="small"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'vehicleNumber'">
            <a @click="viewVehicleDetail(record)">{{ record.vehicleNumber }}</a>
          </template>

          <template v-else-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.type)">
              {{ record.type }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ record.status }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'premium'">
            ¥{{ record.premium.toLocaleString() }}
          </template>

          <template v-else-if="column.key === 'startDate'">
            {{ formatDate(record.startDate) }}
          </template>

          <template v-else-if="column.key === 'endDate'">
            <span :class="{ 'text-warning': isExpiringSoon(record.endDate), 'text-danger': isExpired(record.endDate) }">
              {{ formatDate(record.endDate) }}
            </span>
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a @click="editInsurance(record)">编辑</a>
              <a @click="renewInsurance(record)" v-if="record.status !== '有效'">续保</a>
              <a @click="viewInsurance(record)">查看</a>
              <a-dropdown>
                <a>
                  更多
                  <DownOutlined />
                </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="downloadPolicy(record)">下载保单</a-menu-item>
                    <a-menu-item key="2" @click="sendReminder(record)">发送提醒</a-menu-item>
                    <a-menu-item key="3" @click="claimHistory(record)">理赔记录</a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="4" @click="deleteInsurance(record)" style="color: #ff4d4f">删除保险</a-menu-item>
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
  SafetyOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  SyncOutlined,
  DownOutlined
} from '@ant-design/icons-vue'
import { vehicleData } from '@/data/mockData.js'

// 搜索和筛选
const searchKeyword = ref('')
const filterType = ref('')
const filterStatus = ref('')
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

// 保险数据 - 基于vehicleData生成
const insuranceRecords = ref([
  {
    id: 'INS001',
    vehicleNumber: '京A12345',
    type: '交强险',
    company: '中国人保',
    policyNumber: 'PICC2024001',
    premium: 950,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: '有效',
    key: 'INS001'
  },
  {
    id: 'INS002',
    vehicleNumber: '京A12345',
    type: '商业险',
    company: '中国人保',
    policyNumber: 'PICC2024002',
    premium: 3200,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: '有效',
    key: 'INS002'
  },
  {
    id: 'INS003',
    vehicleNumber: '沪C11111',
    type: '交强险',
    company: '平安保险',
    policyNumber: 'PA2024001',
    premium: 950,
    startDate: '2024-02-15',
    endDate: '2025-02-14',
    status: '有效',
    key: 'INS003'
  },
  {
    id: 'INS004',
    vehicleNumber: '粤B88888',
    type: '交强险',
    company: '太平洋保险',
    policyNumber: 'CPIC2024001',
    premium: 950,
    startDate: '2023-12-01',
    endDate: '2024-11-30',
    status: '即将到期',
    key: 'INS004'
  },
  {
    id: 'INS005',
    vehicleNumber: '川A66666',
    type: '商业险',
    company: '中国人寿',
    policyNumber: 'CHINALIFE2024001',
    premium: 2800,
    startDate: '2024-03-01',
    endDate: '2025-02-28',
    status: '有效',
    key: 'INS005'
  }
])

// 保险统计
const insuranceStats = ref({
  total: insuranceRecords.value.length,
  active: insuranceRecords.value.filter(record => record.status === '有效').length,
  expiringSoon: insuranceRecords.value.filter(record => record.status === '即将到期').length,
  totalCost: insuranceRecords.value.reduce((sum, record) => sum + record.premium, 0)
})

// 即将到期的保险
const expiringInsurance = computed(() => {
  return insuranceRecords.value
    .filter(record => {
      const daysLeft = dayjs(record.endDate).diff(dayjs(), 'day')
      return daysLeft <= 30
    })
    .map(record => ({
      ...record,
      daysLeft: dayjs(record.endDate).diff(dayjs(), 'day')
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
})

// 表格列配置
const insuranceColumns = [
  { title: '车牌号', dataIndex: 'vehicleNumber', key: 'vehicleNumber', width: 120 },
  { title: '保险类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '保险公司', dataIndex: 'company', key: 'company', width: 150 },
  { title: '保单号', dataIndex: 'policyNumber', key: 'policyNumber', width: 150 },
  { title: '保费', dataIndex: 'premium', key: 'premium', width: 100 },
  { title: '生效日期', dataIndex: 'startDate', key: 'startDate', width: 120 },
  { title: '到期日期', dataIndex: 'endDate', key: 'endDate', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'actions', width: 200, fixed: 'right' }
]

// 过滤后的保险数据
const filteredInsurance = computed(() => {
  let result = insuranceRecords.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(record =>
      record.vehicleNumber.toLowerCase().includes(keyword) ||
      record.company.toLowerCase().includes(keyword)
    )
  }

  // 类型过滤
  if (filterType.value) {
    result = result.filter(record => record.type === filterType.value)
  }

  // 状态过滤
  if (filterStatus.value) {
    result = result.filter(record => record.status === filterStatus.value)
  }

  pagination.value.total = result.length
  return result
})

// 获取保险类型颜色
const getTypeColor = (type) => {
  const colorMap = {
    '交强险': 'red',
    '商业险': 'blue',
    '第三者责任险': 'green',
    '车损险': 'orange'
  }
  return colorMap[type] || 'default'
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    '有效': 'green',
    '即将到期': 'orange',
    '已到期': 'red',
    '已失效': 'default'
  }
  return colorMap[status] || 'default'
}

// 格式化日期
const formatDate = (dateStr) => {
  return dateStr ? dayjs(dateStr).format('YYYY-MM-DD') : '-'
}

// 判断是否即将到期
const isExpiringSoon = (dateStr) => {
  if (!dateStr) return false
  const days = dayjs(dateStr).diff(dayjs(), 'day')
  return days <= 30 && days > 0
}

// 判断是否已到期
const isExpired = (dateStr) => {
  if (!dateStr) return false
  return dayjs(dateStr).isBefore(dayjs())
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
  message.success('保险数据导出成功')
}

// 显示新增弹窗
const showAddModal = () => {
  message.info('打开新增保险弹窗')
}

// 表格选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 表格变化处理
const handleTableChange = (pag) => {
  pagination.value = { ...pagination.value, ...pag }
}

// 续保
const renewInsurance = (record) => {
  record.status = '有效'
  record.startDate = dayjs().format('YYYY-MM-DD')
  record.endDate = dayjs().add(1, 'year').format('YYYY-MM-DD')
  message.success(`保险 ${record.policyNumber} 续保成功`)
}

// 查看保险
const viewInsurance = (record) => {
  message.info(`查看保险详情: ${record.policyNumber}`)
}

// 处理全部续保
const handleAllRenewals = () => {
  expiringInsurance.value.forEach(record => {
    renewInsurance(record)
  })
  message.success('批量续保完成')
}

// 查看车辆详情
const viewVehicleDetail = (record) => {
  message.info(`查看车辆详情: ${record.vehicleNumber}`)
}

// 编辑保险
const editInsurance = (record) => {
  message.info(`编辑保险: ${record.policyNumber}`)
}

// 下载保单
const downloadPolicy = (record) => {
  message.success(`保单 ${record.policyNumber} 下载成功`)
}

// 发送提醒
const sendReminder = (record) => {
  message.success(`已发送续保提醒: ${record.policyNumber}`)
}

// 理赔记录
const claimHistory = (record) => {
  message.info(`查看理赔记录: ${record.policyNumber}`)
}

// 删除保险
const deleteInsurance = (record) => {
  const index = insuranceRecords.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    insuranceRecords.value.splice(index, 1)
    message.success('保险记录删除成功')
  }
}

// 批量续保
const handleBatchRenew = () => {
  selectedRowKeys.value.forEach(key => {
    const record = insuranceRecords.value.find(item => item.key === key)
    if (record) renewInsurance(record)
  })
  message.success(`已续保 ${selectedRowKeys.value.length} 个保险`)
  selectedRowKeys.value = []
}

// 批量导出
const handleBatchExport = () => {
  message.success(`批量导出 ${selectedRowKeys.value.length} 个保险记录`)
  selectedRowKeys.value = []
}

// 批量提醒
const handleBatchNotify = () => {
  message.success(`已发送 ${selectedRowKeys.value.length} 个续保提醒`)
  selectedRowKeys.value = []
}

// 批量删除
const handleBatchDelete = () => {
  insuranceRecords.value = insuranceRecords.value.filter(item => !selectedRowKeys.value.includes(item.key))
  message.success(`已删除 ${selectedRowKeys.value.length} 个保险记录`)
  selectedRowKeys.value = []
}

onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.insurance-management {
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

.reminder-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: none;
}

.insurance-table-card {
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

.text-warning {
  color: #faad14;
}

.text-danger {
  color: #ff4d4f;
}

.ml-2 {
  margin-left: 8px;
}

// 响应式设计
@media (max-width: 768px) {
  .insurance-management {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 20px;
  }
}
</style>
