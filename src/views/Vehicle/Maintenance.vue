<template>
  <div class="maintenance-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <ToolOutlined />
        维修保养
      </h1>
      <p>管理车辆维修保养记录，确保车辆安全运行，延长使用寿命</p>
    </div>

    <!-- 操作工具栏 -->
    <a-card class="toolbar-card">
      <a-row :gutter="[16, 16]" align="middle">
        <a-col :xs="24" :sm="12" :md="8">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索车牌号、维修项目"
            @search="handleSearch"
            style="width: 100%"
          />
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-space>
            <a-select v-model:value="filterType" placeholder="维修类型" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部类型</a-select-option>
              <a-select-option value="定期保养">定期保养</a-select-option>
              <a-select-option value="故障维修">故障维修</a-select-option>
              <a-select-option value="紧急维修">紧急维修</a-select-option>
              <a-select-option value="年检">年检</a-select-option>
            </a-select>

            <a-select v-model:value="filterStatus" placeholder="维修状态" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部状态</a-select-option>
              <a-select-option value="待维修">待维修</a-select-option>
              <a-select-option value="维修中">维修中</a-select-option>
              <a-select-option value="已完成">已完成</a-select-option>
              <a-select-option value="已取消">已取消</a-select-option>
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
              新增维修
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 维修统计卡片 -->
    <a-row :gutter="[16, 16]" class="stats-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="总维修次数"
            :value="maintenanceStats.total"
            :value-style="{ color: '#1890ff' }"
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
            title="本月维修"
            :value="maintenanceStats.thisMonth"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <CalendarOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="维修费用"
            :value="maintenanceStats.totalCost"
            :value-style="{ color: '#722ed1' }"
            :formatter="(value) => `¥${(value / 10000).toFixed(1)}万`"
          >
            <template #prefix>
              <DollarOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="待维修车辆"
            :value="maintenanceStats.pending"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #prefix>
              <ExclamationCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 维修提醒 -->
    <a-card title="维修提醒" class="reminder-card" v-if="reminders.length > 0">
      <template #extra>
        <a-button size="small" @click="handleAllReminders">
          处理全部
        </a-button>
      </template>

      <a-list
        :data-source="reminders"
        size="small"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #avatar>
                <a-avatar :style="{ backgroundColor: item.level === 'urgent' ? '#ff4d4f' : '#faad14' }">
                  <ExclamationOutlined />
                </a-avatar>
              </template>
              <template #title>
                <span>{{ item.title }}</span>
                <a-tag :color="item.level === 'urgent' ? 'red' : 'orange'" class="ml-2">
                  {{ item.level === 'urgent' ? '紧急' : '提醒' }}
                </a-tag>
              </template>
              <template #description>
                {{ item.description }}
              </template>
            </a-list-item-meta>
            <template #actions>
              <a @click="handleReminder(item)">处理</a>
              <a @click="ignoreReminder(item)">忽略</a>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </a-card>

    <!-- 维修记录列表 -->
    <a-card title="维修记录" class="maintenance-table-card">
      <template #extra>
        <a-space>
          <a-button size="small" @click="handleBatchComplete" :disabled="selectedRowKeys.length === 0">
            <CheckOutlined />
            批量完成
          </a-button>
          <a-dropdown>
            <a-button size="small">
              更多操作
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="handleBatchExport">批量导出</a-menu-item>
                <a-menu-item key="2" @click="handleBatchPrint">批量打印</a-menu-item>
                <a-menu-item key="3" @click="handleBatchDelete">批量删除</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-space>
      </template>

      <a-table
        :columns="maintenanceColumns"
        :data-source="filteredMaintenance"
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

          <template v-else-if="column.key === 'cost'">
            ¥{{ record.cost.toLocaleString() }}
          </template>

          <template v-else-if="column.key === 'maintenanceDate'">
            {{ formatDate(record.maintenanceDate) }}
          </template>

          <template v-else-if="column.key === 'nextMaintenanceDate'">
            <span :class="{ 'text-warning': isNearMaintenance(record.nextMaintenanceDate), 'text-danger': isOverdueMaintenance(record.nextMaintenanceDate) }">
              {{ formatDate(record.nextMaintenanceDate) }}
            </span>
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a @click="editMaintenance(record)">编辑</a>
              <a @click="viewMaintenance(record)">查看</a>
              <a @click="completeMaintenance(record)" v-if="record.status !== '已完成'">完成</a>
              <a-dropdown>
                <a>
                  更多
                  <DownOutlined />
                </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="printMaintenance(record)">打印单据</a-menu-item>
                    <a-menu-item key="2" @click="copyMaintenance(record)">复制记录</a-menu-item>
                    <a-menu-item key="3" @click="addFollowUp(record)">添加跟进</a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="4" @click="deleteMaintenance(record)" style="color: #ff4d4f">删除记录</a-menu-item>
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
  ToolOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PlusOutlined,
  CalendarOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  ExclamationOutlined,
  CheckOutlined,
  DownOutlined
} from '@ant-design/icons-vue'
import { maintenanceData, vehicleData } from '@/data/mockData.js'

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

// 维修数据 - 基于maintenanceData生成
const maintenanceRecords = ref(maintenanceData.map((record, index) => ({
  ...record,
  key: record.id,
  status: index % 4 === 0 ? '已完成' : index % 4 === 1 ? '维修中' : index % 4 === 2 ? '待维修' : '已取消'
})))

// 维修统计
const maintenanceStats = ref({
  total: maintenanceRecords.value.length,
  thisMonth: maintenanceRecords.value.filter(record =>
    dayjs(record.maintenanceDate).format('YYYY-MM') === dayjs().format('YYYY-MM')
  ).length,
  totalCost: maintenanceRecords.value.reduce((sum, record) => sum + record.cost, 0),
  pending: maintenanceRecords.value.filter(record => record.status === '待维修').length
})

// 维修提醒
const reminders = ref([
  {
    id: 1,
    title: '车辆京A12345需要定期保养',
    description: '该车辆已行驶8000公里，需要进行定期保养',
    level: 'urgent',
    vehicleNumber: '京A12345'
  },
  {
    id: 2,
    title: '车辆沪C11111保险即将到期',
    description: '该车辆保险将在7天后到期，请及时续保',
    level: 'normal',
    vehicleNumber: '沪C11111'
  },
  {
    id: 3,
    title: '车辆粤B88888年检到期',
    description: '该车辆年检已到期，请尽快安排年检',
    level: 'urgent',
    vehicleNumber: '粤B88888'
  }
])

// 表格列配置
const maintenanceColumns = [
  { title: '车牌号', dataIndex: 'vehicleNumber', key: 'vehicleNumber', width: 120 },
  { title: '维修类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '维修项目', dataIndex: 'items', key: 'items', width: 200 },
  { title: '维修状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '维修费用', dataIndex: 'cost', key: 'cost', width: 120 },
  { title: '技师', dataIndex: 'technician', key: 'technician', width: 100 },
  { title: '维修日期', dataIndex: 'maintenanceDate', key: 'maintenanceDate', width: 120 },
  { title: '下次保养', dataIndex: 'nextMaintenanceDate', key: 'nextMaintenanceDate', width: 120 },
  { title: '操作', key: 'actions', width: 200, fixed: 'right' }
]

// 过滤后的维修数据
const filteredMaintenance = computed(() => {
  let result = maintenanceRecords.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(record =>
      record.vehicleNumber.toLowerCase().includes(keyword) ||
      record.items.toLowerCase().includes(keyword)
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

// 获取维修类型颜色
const getTypeColor = (type) => {
  const colorMap = {
    '定期保养': 'blue',
    '故障维修': 'orange',
    '紧急维修': 'red',
    '年检': 'green'
  }
  return colorMap[type] || 'default'
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    '待维修': 'orange',
    '维修中': 'blue',
    '已完成': 'green',
    '已取消': 'red'
  }
  return colorMap[status] || 'default'
}

// 格式化日期
const formatDate = (dateStr) => {
  return dateStr ? dayjs(dateStr).format('YYYY-MM-DD') : '-'
}

// 判断是否临近保养
const isNearMaintenance = (dateStr) => {
  if (!dateStr) return false
  const days = dayjs(dateStr).diff(dayjs(), 'day')
  return days <= 7 && days > 0
}

// 判断是否过期保养
const isOverdueMaintenance = (dateStr) => {
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
  message.success('维修数据导出成功')
}

// 显示新增弹窗
const showAddModal = () => {
  message.info('打开新增维修弹窗')
}

// 表格选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 表格变化处理
const handleTableChange = (pag) => {
  pagination.value = { ...pagination.value, ...pag }
}

// 处理提醒
const handleReminder = (item) => {
  message.info(`处理提醒: ${item.title}`)
}

// 忽略提醒
const ignoreReminder = (item) => {
  const index = reminders.value.findIndex(r => r.id === item.id)
  if (index > -1) {
    reminders.value.splice(index, 1)
    message.success('已忽略该提醒')
  }
}

// 处理全部提醒
const handleAllReminders = () => {
  reminders.value = []
  message.success('已处理全部提醒')
}

// 查看车辆详情
const viewVehicleDetail = (record) => {
  message.info(`查看车辆详情: ${record.vehicleNumber}`)
}

// 编辑维修记录
const editMaintenance = (record) => {
  message.info(`编辑维修记录: ${record.id}`)
}

// 查看维修记录
const viewMaintenance = (record) => {
  message.info(`查看维修记录: ${record.id}`)
}

// 完成维修
const completeMaintenance = (record) => {
  record.status = '已完成'
  message.success(`维修记录 ${record.id} 已完成`)
}

// 打印维修单据
const printMaintenance = (record) => {
  message.success(`维修单据 ${record.id} 打印成功`)
}

// 复制维修记录
const copyMaintenance = (record) => {
  message.success(`维修记录 ${record.id} 已复制`)
}

// 添加跟进
const addFollowUp = (record) => {
  message.info(`为维修记录 ${record.id} 添加跟进`)
}

// 删除维修记录
const deleteMaintenance = (record) => {
  const index = maintenanceRecords.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    maintenanceRecords.value.splice(index, 1)
    message.success('维修记录删除成功')
  }
}

// 批量完成
const handleBatchComplete = () => {
  selectedRowKeys.value.forEach(key => {
    const record = maintenanceRecords.value.find(item => item.key === key)
    if (record) record.status = '已完成'
  })
  message.success(`已完成 ${selectedRowKeys.value.length} 条维修记录`)
  selectedRowKeys.value = []
}

// 批量导出
const handleBatchExport = () => {
  message.success(`批量导出 ${selectedRowKeys.value.length} 条维修记录`)
  selectedRowKeys.value = []
}

// 批量打印
const handleBatchPrint = () => {
  message.success(`批量打印 ${selectedRowKeys.value.length} 条维修记录`)
  selectedRowKeys.value = []
}

// 批量删除
const handleBatchDelete = () => {
  maintenanceRecords.value = maintenanceRecords.value.filter(item => !selectedRowKeys.value.includes(item.key))
  message.success(`已删除 ${selectedRowKeys.value.length} 条维修记录`)
  selectedRowKeys.value = []
}

onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.maintenance-management {
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

.maintenance-table-card {
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
  .maintenance-management {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 20px;
  }
}
</style>
