<template>
  <div class="fuel-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <ExperimentOutlined />
        油耗管理
      </h1>
      <p>管理车辆油耗数据，分析燃油效率，优化运营成本</p>
    </div>

    <!-- 操作工具栏 -->
    <a-card class="toolbar-card">
      <a-row :gutter="[16, 16]" align="middle">
        <a-col :xs="24" :sm="12" :md="8">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索车牌号、加油站"
            @search="handleSearch"
            style="width: 100%"
          />
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-space>
            <a-range-picker v-model:value="dateRange" style="width: 200px" @change="handleFilter" />

            <a-select v-model:value="filterVehicle" placeholder="选择车辆" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部车辆</a-select-option>
              <a-select-option v-for="vehicle in vehicles" :key="vehicle.plateNumber" :value="vehicle.plateNumber">
                {{ vehicle.plateNumber }}
              </a-select-option>
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
              添加加油记录
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 油耗统计卡片 -->
    <a-row :gutter="[16, 16]" class="stats-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="总加油次数"
            :value="fuelStats.totalRecords"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <ExperimentOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="总油耗量"
            :value="fuelStats.totalLiters"
            suffix="升"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <DashboardOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="总费用"
            :value="fuelStats.totalCost"
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
            title="平均油耗"
            :value="fuelStats.avgConsumption"
            suffix="L/100km"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #prefix>
              <BarChartOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 油耗分析图表 -->
    <a-row :gutter="[16, 16]" class="charts-section">
      <a-col :xs="24" :lg="12">
        <a-card title="月度油耗趋势" class="chart-card">
          <template #extra>
            <a-radio-group v-model:value="chartPeriod" size="small">
              <a-radio-button value="month">月度</a-radio-button>
              <a-radio-button value="quarter">季度</a-radio-button>
              <a-radio-button value="year">年度</a-radio-button>
            </a-radio-group>
          </template>
          <div ref="trendChart" class="chart-container"></div>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="12">
        <a-card title="车辆油耗对比" class="chart-card">
          <template #extra>
            <a-select v-model:value="compareMetric" size="small" style="width: 100px">
              <a-select-option value="consumption">油耗量</a-select-option>
              <a-select-option value="cost">费用</a-select-option>
              <a-select-option value="efficiency">效率</a-select-option>
            </a-select>
          </template>
          <div ref="compareChart" class="chart-container"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 加油记录列表 -->
    <a-card title="加油记录" class="fuel-table-card">
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
                <a-menu-item key="3" @click="handleBatchDelete">批量删除</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-space>
      </template>

      <a-table
        :columns="fuelColumns"
        :data-source="filteredFuelRecords"
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

          <template v-else-if="column.key === 'fuelType'">
            <a-tag :color="getFuelTypeColor(record.fuelType)">
              {{ record.fuelType }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'amount'">
            {{ record.amount.toFixed(2) }}升
          </template>

          <template v-else-if="column.key === 'cost'">
            ¥{{ record.cost.toLocaleString() }}
          </template>

          <template v-else-if="column.key === 'unitPrice'">
            ¥{{ record.unitPrice.toFixed(2) }}/升
          </template>

          <template v-else-if="column.key === 'consumption'">
            <span :class="{ 'text-success': record.consumption <= 8, 'text-warning': record.consumption > 8 && record.consumption <= 12, 'text-danger': record.consumption > 12 }">
              {{ record.consumption.toFixed(1) }}L/100km
            </span>
          </template>

          <template v-else-if="column.key === 'fuelDate'">
            {{ formatDate(record.fuelDate) }}
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a @click="editFuelRecord(record)">编辑</a>
              <a @click="viewFuelRecord(record)">查看</a>
              <a @click="analyzeFuel(record)">分析</a>
              <a-dropdown>
                <a>
                  更多
                  <DownOutlined />
                </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="copyFuelRecord(record)">复制记录</a-menu-item>
                    <a-menu-item key="2" @click="generateReport(record)">生成报告</a-menu-item>
                    <a-menu-item key="3" @click="exportFuelRecord(record)">导出记录</a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="4" @click="deleteFuelRecord(record)" style="color: #ff4d4f">删除记录</a-menu-item>
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
  ExperimentOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PlusOutlined,
  DashboardOutlined,
  DollarOutlined,
  BarChartOutlined,
  DownOutlined
} from '@ant-design/icons-vue'
import { vehicleData } from '@/data/mockData.js'

// 搜索和筛选
const searchKeyword = ref('')
const dateRange = ref([])
const filterVehicle = ref('')
const loading = ref(false)

// 图表控制
const chartPeriod = ref('month')
const compareMetric = ref('consumption')

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

// 车辆数据
const vehicles = ref(vehicleData)

// 加油记录数据
const fuelRecords = ref([
  {
    id: 'FUEL001',
    vehicleNumber: '京A12345',
    fuelType: '92号汽油',
    amount: 45.5,
    cost: 350,
    unitPrice: 7.69,
    consumption: 8.5,
    mileage: 12500,
    station: '中石化加油站',
    fuelDate: '2024-06-28',
    key: 'FUEL001'
  },
  {
    id: 'FUEL002',
    vehicleNumber: '沪C11111',
    fuelType: '95号汽油',
    amount: 52.0,
    cost: 420,
    unitPrice: 8.08,
    consumption: 9.2,
    mileage: 8900,
    station: '中石油加油站',
    fuelDate: '2024-06-27',
    key: 'FUEL002'
  },
  {
    id: 'FUEL003',
    vehicleNumber: '粤B88888',
    fuelType: '柴油',
    amount: 60.0,
    cost: 380,
    unitPrice: 6.33,
    consumption: 12.5,
    mileage: 15600,
    station: '壳牌加油站',
    fuelDate: '2024-06-26',
    key: 'FUEL003'
  },
  {
    id: 'FUEL004',
    vehicleNumber: '川A66666',
    fuelType: '92号汽油',
    amount: 48.0,
    cost: 370,
    unitPrice: 7.71,
    consumption: 7.8,
    mileage: 9200,
    station: '中石化加油站',
    fuelDate: '2024-06-25',
    key: 'FUEL004'
  },
  {
    id: 'FUEL005',
    vehicleNumber: '鲁D33333',
    fuelType: '95号汽油',
    amount: 55.0,
    cost: 450,
    unitPrice: 8.18,
    consumption: 10.1,
    mileage: 11800,
    station: '中石油加油站',
    fuelDate: '2024-06-24',
    key: 'FUEL005'
  }
])

// 油耗统计
const fuelStats = ref({
  totalRecords: fuelRecords.value.length,
  totalLiters: fuelRecords.value.reduce((sum, record) => sum + record.amount, 0),
  totalCost: fuelRecords.value.reduce((sum, record) => sum + record.cost, 0),
  avgConsumption: (fuelRecords.value.reduce((sum, record) => sum + record.consumption, 0) / fuelRecords.value.length).toFixed(1)
})

// 表格列配置
const fuelColumns = [
  { title: '车牌号', dataIndex: 'vehicleNumber', key: 'vehicleNumber', width: 120 },
  { title: '燃油类型', dataIndex: 'fuelType', key: 'fuelType', width: 100 },
  { title: '加油量', dataIndex: 'amount', key: 'amount', width: 100 },
  { title: '费用', dataIndex: 'cost', key: 'cost', width: 100 },
  { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 100 },
  { title: '油耗', dataIndex: 'consumption', key: 'consumption', width: 120 },
  { title: '里程', dataIndex: 'mileage', key: 'mileage', width: 100 },
  { title: '加油站', dataIndex: 'station', key: 'station', width: 150 },
  { title: '加油日期', dataIndex: 'fuelDate', key: 'fuelDate', width: 120 },
  { title: '操作', key: 'actions', width: 200, fixed: 'right' }
]

// 过滤后的加油记录
const filteredFuelRecords = computed(() => {
  let result = fuelRecords.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(record =>
      record.vehicleNumber.toLowerCase().includes(keyword) ||
      record.station.toLowerCase().includes(keyword)
    )
  }

  // 车辆过滤
  if (filterVehicle.value) {
    result = result.filter(record => record.vehicleNumber === filterVehicle.value)
  }

  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    result = result.filter(record => {
      const recordDate = dayjs(record.fuelDate)
      return recordDate.isAfter(dayjs(startDate).subtract(1, 'day')) &&
             recordDate.isBefore(dayjs(endDate).add(1, 'day'))
    })
  }

  pagination.value.total = result.length
  return result
})

// 获取燃油类型颜色
const getFuelTypeColor = (fuelType) => {
  const colorMap = {
    '92号汽油': 'blue',
    '95号汽油': 'green',
    '98号汽油': 'purple',
    '柴油': 'orange'
  }
  return colorMap[fuelType] || 'default'
}

// 格式化日期
const formatDate = (dateStr) => {
  return dateStr ? dayjs(dateStr).format('YYYY-MM-DD') : '-'
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
  message.success('油耗数据导出成功')
}

// 显示新增弹窗
const showAddModal = () => {
  message.info('打开添加加油记录弹窗')
}

// 表格选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 表格变化处理
const handleTableChange = (pag) => {
  pagination.value = { ...pagination.value, ...pag }
}

// 查看车辆详情
const viewVehicleDetail = (record) => {
  message.info(`查看车辆详情: ${record.vehicleNumber}`)
}

// 编辑加油记录
const editFuelRecord = (record) => {
  message.info(`编辑加油记录: ${record.id}`)
}

// 查看加油记录
const viewFuelRecord = (record) => {
  message.info(`查看加油记录: ${record.id}`)
}

// 分析油耗
const analyzeFuel = (record) => {
  message.info(`分析车辆 ${record.vehicleNumber} 的油耗数据`)
}

// 复制加油记录
const copyFuelRecord = (record) => {
  message.success(`加油记录 ${record.id} 已复制`)
}

// 生成报告
const generateReport = (record) => {
  message.success(`车辆 ${record.vehicleNumber} 油耗报告生成成功`)
}

// 导出加油记录
const exportFuelRecord = (record) => {
  message.success(`加油记录 ${record.id} 导出成功`)
}

// 删除加油记录
const deleteFuelRecord = (record) => {
  const index = fuelRecords.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    fuelRecords.value.splice(index, 1)
    message.success('加油记录删除成功')
  }
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
  message.success(`批量生成 ${selectedRowKeys.value.length} 个油耗报告`)
  selectedRowKeys.value = []
}

// 批量删除
const handleBatchDelete = () => {
  fuelRecords.value = fuelRecords.value.filter(item => !selectedRowKeys.value.includes(item.key))
  message.success(`已删除 ${selectedRowKeys.value.length} 条记录`)
  selectedRowKeys.value = []
}

onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.fuel-management {
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

.fuel-table-card {
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
  .fuel-management {
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
