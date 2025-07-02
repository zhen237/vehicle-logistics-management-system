<template>
  <div class="dispatch-history">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <HistoryOutlined />
        调度历史
      </h1>
      <p>查看历史调度记录，分析调度效率，优化调度策略</p>
    </div>

    <!-- 查询工具栏 -->
    <a-card class="toolbar-card">
      <a-row :gutter="[16, 16]" align="middle">
        <a-col :xs="24" :sm="12" :md="6">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索订单号、车牌号"
            @search="handleSearch"
            style="width: 100%"
          />
        </a-col>

        <a-col :xs="24" :sm="12" :md="6">
          <a-range-picker
            v-model:value="dateRange"
            style="width: 100%"
            @change="handleFilter"
            :presets="datePresets"
          />
        </a-col>

        <a-col :xs="24" :sm="12" :md="6">
          <a-space>
            <a-select v-model:value="filterStatus" placeholder="调度状态" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部状态</a-select-option>
              <a-select-option value="completed">已完成</a-select-option>
              <a-select-option value="cancelled">已取消</a-select-option>
              <a-select-option value="delayed">延误</a-select-option>
            </a-select>

            <a-select v-model:value="filterDispatcher" placeholder="调度员" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部调度员</a-select-option>
              <a-select-option value="张调度">张调度</a-select-option>
              <a-select-option value="李调度">李调度</a-select-option>
              <a-select-option value="王调度">王调度</a-select-option>
            </a-select>
          </a-space>
        </a-col>

        <a-col :xs="24" :sm="24" :md="6" class="text-right">
          <a-space>
            <a-button @click="handleRefresh">
              <ReloadOutlined />
              刷新
            </a-button>
            <a-button @click="handleExport">
              <DownloadOutlined />
              导出
            </a-button>
            <a-button @click="generateReport">
              <FileTextOutlined />
              生成报告
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 统计概览 -->
    <a-row :gutter="[16, 16]" class="stats-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="总调度次数"
            :value="historyStats.totalDispatches"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <SendOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="成功率"
            :value="historyStats.successRate"
            suffix="%"
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
            title="平均响应时间"
            :value="historyStats.avgResponseTime"
            suffix="分钟"
            :value-style="{ color: '#722ed1' }"
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
            title="延误率"
            :value="historyStats.delayRate"
            suffix="%"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #prefix>
              <ExclamationCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 调度趋势图表 -->
    <a-row :gutter="[16, 16]" class="charts-section">
      <a-col :xs="24" :lg="12">
        <a-card title="调度趋势分析" class="chart-card">
          <template #extra>
            <a-radio-group v-model:value="trendPeriod" size="small">
              <a-radio-button value="day">日</a-radio-button>
              <a-radio-button value="week">周</a-radio-button>
              <a-radio-button value="month">月</a-radio-button>
            </a-radio-group>
          </template>
          <div ref="trendChart" class="chart-container"></div>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="12">
        <a-card title="调度员绩效对比" class="chart-card">
          <template #extra>
            <a-select v-model:value="performanceMetric" size="small" style="width: 100px">
              <a-select-option value="count">调度次数</a-select-option>
              <a-select-option value="success">成功率</a-select-option>
              <a-select-option value="response">响应时间</a-select-option>
            </a-select>
          </template>
          <div ref="performanceChart" class="chart-container"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 调度历史记录 -->
    <a-card title="调度记录" class="history-table-card">
      <template #extra>
        <a-space>
          <a-button size="small" @click="handleBatchAnalyze" :disabled="selectedRowKeys.length === 0">
            <BarChartOutlined />
            批量分析
          </a-button>
          <a-dropdown>
            <a-button size="small">
              更多操作
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="handleBatchExport">批量导出</a-menu-item>
                <a-menu-item key="2" @click="handleBatchReport">生成报告</a-menu-item>
                <a-menu-item key="3" @click="handleBatchArchive">批量归档</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-space>
      </template>

      <a-table
        :columns="historyColumns"
        :data-source="filteredHistory"
        :pagination="pagination"
        :loading="loading"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
        size="small"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'orderNumber'">
            <a @click="viewOrderDetail(record)">{{ record.orderNumber }}</a>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'priority'">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ record.priority }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'responseTime'">
            <span :class="{ 'text-success': record.responseTime <= 10, 'text-warning': record.responseTime > 10 && record.responseTime <= 30, 'text-danger': record.responseTime > 30 }">
              {{ record.responseTime }}分钟
            </span>
          </template>

          <template v-else-if="column.key === 'dispatchTime'">
            {{ formatDateTime(record.dispatchTime) }}
          </template>

          <template v-else-if="column.key === 'completedTime'">
            {{ formatDateTime(record.completedTime) }}
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a @click="viewDispatchDetail(record)">详情</a>
              <a @click="viewTimeline(record)">时间线</a>
              <a @click="analyzeDispatch(record)">分析</a>
              <a-dropdown>
                <a>
                  更多
                  <DownOutlined />
                </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="copyDispatch(record)">复制调度</a-menu-item>
                    <a-menu-item key="2" @click="exportDispatch(record)">导出记录</a-menu-item>
                    <a-menu-item key="3" @click="addComment(record)">添加备注</a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="4" @click="archiveDispatch(record)">归档记录</a-menu-item>
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
  HistoryOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FileTextOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  DownOutlined
} from '@ant-design/icons-vue'
import { orderData } from '@/data/mockData.js'

// 搜索和筛选
const searchKeyword = ref('')
const dateRange = ref([])
const filterStatus = ref('')
const filterDispatcher = ref('')
const loading = ref(false)

// 图表控制
const trendPeriod = ref('week')
const performanceMetric = ref('count')

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

// 日期预设
const datePresets = [
  { label: '今天', value: [dayjs(), dayjs()] },
  { label: '昨天', value: [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')] },
  { label: '最近7天', value: [dayjs().subtract(7, 'day'), dayjs()] },
  { label: '最近30天', value: [dayjs().subtract(30, 'day'), dayjs()] },
  { label: '本月', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
  { label: '上月', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] }
]

// 调度历史数据
const dispatchHistory = ref([
  {
    id: 'DISP001',
    orderNumber: 'ORD001',
    vehicleNumber: '京A12345',
    driver: '张师傅',
    dispatcher: '张调度',
    status: 'completed',
    priority: '普通',
    origin: '北京市朝阳区',
    destination: '天津市',
    dispatchTime: '2024-06-28 09:00:00',
    completedTime: '2024-06-28 15:30:00',
    responseTime: 5,
    key: 'DISP001'
  },
  {
    id: 'DISP002',
    orderNumber: 'ORD002',
    vehicleNumber: '沪C11111',
    driver: '李师傅',
    dispatcher: '李调度',
    status: 'completed',
    priority: '紧急',
    origin: '上海市浦东新区',
    destination: '杭州市',
    dispatchTime: '2024-06-27 14:00:00',
    completedTime: '2024-06-27 18:45:00',
    responseTime: 3,
    key: 'DISP002'
  },
  {
    id: 'DISP003',
    orderNumber: 'ORD003',
    vehicleNumber: '粤B88888',
    driver: '王师傅',
    dispatcher: '王调度',
    status: 'delayed',
    priority: '高',
    origin: '深圳市南山区',
    destination: '广州市',
    dispatchTime: '2024-06-26 10:30:00',
    completedTime: '2024-06-26 20:15:00',
    responseTime: 45,
    key: 'DISP003'
  },
  {
    id: 'DISP004',
    orderNumber: 'ORD004',
    vehicleNumber: '川A66666',
    driver: '赵师傅',
    dispatcher: '张调度',
    status: 'completed',
    priority: '普通',
    origin: '成都市锦江区',
    destination: '重庆市',
    dispatchTime: '2024-06-25 08:15:00',
    completedTime: '2024-06-25 14:30:00',
    responseTime: 8,
    key: 'DISP004'
  },
  {
    id: 'DISP005',
    orderNumber: 'ORD005',
    vehicleNumber: '鲁D33333',
    driver: '钱师傅',
    dispatcher: '李调度',
    status: 'cancelled',
    priority: '低',
    origin: '济南市历下区',
    destination: '青岛市',
    dispatchTime: '2024-06-24 16:00:00',
    completedTime: null,
    responseTime: 15,
    key: 'DISP005'
  }
])

// 历史统计
const historyStats = ref({
  totalDispatches: dispatchHistory.value.length,
  successRate: Math.round((dispatchHistory.value.filter(d => d.status === 'completed').length / dispatchHistory.value.length) * 100),
  avgResponseTime: Math.round(dispatchHistory.value.reduce((sum, d) => sum + d.responseTime, 0) / dispatchHistory.value.length),
  delayRate: Math.round((dispatchHistory.value.filter(d => d.status === 'delayed').length / dispatchHistory.value.length) * 100)
})

// 表格列配置
const historyColumns = [
  { title: '订单号', dataIndex: 'orderNumber', key: 'orderNumber', width: 120 },
  { title: '车牌号', dataIndex: 'vehicleNumber', key: 'vehicleNumber', width: 120 },
  { title: '司机', dataIndex: 'driver', key: 'driver', width: 100 },
  { title: '调度员', dataIndex: 'dispatcher', key: 'dispatcher', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 80 },
  { title: '起点', dataIndex: 'origin', key: 'origin', width: 150 },
  { title: '终点', dataIndex: 'destination', key: 'destination', width: 150 },
  { title: '响应时间', dataIndex: 'responseTime', key: 'responseTime', width: 100 },
  { title: '调度时间', dataIndex: 'dispatchTime', key: 'dispatchTime', width: 150 },
  { title: '完成时间', dataIndex: 'completedTime', key: 'completedTime', width: 150 },
  { title: '操作', key: 'actions', width: 200, fixed: 'right' }
]

// 过滤后的历史数据
const filteredHistory = computed(() => {
  let result = dispatchHistory.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(record =>
      record.orderNumber.toLowerCase().includes(keyword) ||
      record.vehicleNumber.toLowerCase().includes(keyword)
    )
  }

  // 状态过滤
  if (filterStatus.value) {
    result = result.filter(record => record.status === filterStatus.value)
  }

  // 调度员过滤
  if (filterDispatcher.value) {
    result = result.filter(record => record.dispatcher === filterDispatcher.value)
  }

  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    result = result.filter(record => {
      const recordDate = dayjs(record.dispatchTime)
      return recordDate.isAfter(dayjs(startDate).subtract(1, 'day')) &&
             recordDate.isBefore(dayjs(endDate).add(1, 'day'))
    })
  }

  pagination.value.total = result.length
  return result
})

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    completed: 'green',
    cancelled: 'red',
    delayed: 'orange'
  }
  return colorMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    completed: '已完成',
    cancelled: '已取消',
    delayed: '延误'
  }
  return textMap[status] || status
}

// 获取优先级颜色
const getPriorityColor = (priority) => {
  const colorMap = {
    '紧急': 'red',
    '高': 'orange',
    '普通': 'blue',
    '低': 'default'
  }
  return colorMap[priority] || 'default'
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
  message.success('调度历史数据导出成功')
}

// 生成报告
const generateReport = () => {
  message.success('调度分析报告生成成功')
}

// 表格选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 表格变化处理
const handleTableChange = (pag) => {
  pagination.value = { ...pagination.value, ...pag }
}

// 查看订单详情
const viewOrderDetail = (record) => {
  message.info(`查看订单详情: ${record.orderNumber}`)
}

// 查看调度详情
const viewDispatchDetail = (record) => {
  message.info(`查看调度详情: ${record.id}`)
}

// 查看时间线
const viewTimeline = (record) => {
  message.info(`查看调度时间线: ${record.id}`)
}

// 分析调度
const analyzeDispatch = (record) => {
  message.info(`分析调度记录: ${record.id}`)
}

// 复制调度
const copyDispatch = (record) => {
  message.success(`调度记录 ${record.id} 已复制`)
}

// 导出调度记录
const exportDispatch = (record) => {
  message.success(`调度记录 ${record.id} 导出成功`)
}

// 添加备注
const addComment = (record) => {
  message.info(`为调度记录 ${record.id} 添加备注`)
}

// 归档调度记录
const archiveDispatch = (record) => {
  message.success(`调度记录 ${record.id} 已归档`)
}

// 批量分析
const handleBatchAnalyze = () => {
  message.info(`批量分析 ${selectedRowKeys.value.length} 条记录`)
  selectedRowKeys.value = []
}

// 批量导出
const handleBatchExport = () => {
  message.success(`批量导出 ${selectedRowKeys.value.length} 条记录`)
  selectedRowKeys.value = []
}

// 批量生成报告
const handleBatchReport = () => {
  message.success(`批量生成 ${selectedRowKeys.value.length} 个调度报告`)
  selectedRowKeys.value = []
}

// 批量归档
const handleBatchArchive = () => {
  message.success(`批量归档 ${selectedRowKeys.value.length} 条记录`)
  selectedRowKeys.value = []
}

onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.dispatch-history {
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

.charts-section {
  margin-bottom: 24px;
}

.chart-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: none;

  .chart-container {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafafa;
    border-radius: 8px;
    color: #8c8c8c;

    &::before {
      content: '图表区域 (可集成 ECharts)';
    }
  }
}

.history-table-card {
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

.text-success {
  color: #52c41a;
}

.text-warning {
  color: #faad14;
}

.text-danger {
  color: #ff4d4f;
}

// 响应式设计
@media (max-width: 768px) {
  .dispatch-history {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .chart-container {
    height: 250px;
  }
}
</style>
