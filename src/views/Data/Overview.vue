<template>
  <div class="data-overview">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <BarChartOutlined />
        数据概览
      </h1>
      <p>全面掌握业务运营数据，实时监控关键指标</p>
    </div>

    <!-- 核心指标卡片 -->
    <a-row :gutter="[16, 16]" class="metrics-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="metric-card">
          <a-statistic
            title="总订单数"
            :value="overviewData.totalOrders"
            :prefix="h(ShoppingCartOutlined)"
            :value-style="{ color: '#1890ff' }"
          />
          <div class="metric-trend">
            <span class="trend-up">
              <ArrowUpOutlined />
              +12.5%
            </span>
            <span class="trend-text">较上月</span>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="metric-card">
          <a-statistic
            title="总收入"
            :value="overviewData.totalRevenue"
            :prefix="h(DollarOutlined)"
            :value-style="{ color: '#52c41a' }"
            :formatter="(value) => `¥${(value / 10000).toFixed(1)}万`"
          />
          <div class="metric-trend">
            <span class="trend-up">
              <ArrowUpOutlined />
              +8.3%
            </span>
            <span class="trend-text">较上月</span>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="metric-card">
          <a-statistic
            title="活跃车辆"
            :value="overviewData.activeVehicles"
            :prefix="h(CarOutlined)"
            :value-style="{ color: '#722ed1' }"
            suffix="辆"
          />
          <div class="metric-trend">
            <span class="trend-up">
              <ArrowUpOutlined />
              +5.2%
            </span>
            <span class="trend-text">较上月</span>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="metric-card">
          <a-statistic
            title="客户满意度"
            :value="overviewData.satisfaction"
            :prefix="h(SmileOutlined)"
            :value-style="{ color: '#fa8c16' }"
            suffix="%"
          />
          <div class="metric-trend">
            <span class="trend-up">
              <ArrowUpOutlined />
              +2.1%
            </span>
            <span class="trend-text">较上月</span>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 数据图表区域 -->
    <a-row :gutter="[16, 16]" class="charts-section">
      <!-- 订单趋势图 -->
      <a-col :xs="24" :lg="12">
        <a-card title="订单趋势" class="chart-card">
          <template #extra>
            <a-radio-group v-model:value="orderTrendPeriod" size="small">
              <a-radio-button value="week">本周</a-radio-button>
              <a-radio-button value="month">本月</a-radio-button>
              <a-radio-button value="year">本年</a-radio-button>
            </a-radio-group>
          </template>
          <div ref="orderTrendChart" class="chart-container"></div>
        </a-card>
      </a-col>

      <!-- 收入分析图 -->
      <a-col :xs="24" :lg="12">
        <a-card title="收入分析" class="chart-card">
          <template #extra>
            <a-select v-model:value="revenueType" size="small" style="width: 100px">
              <a-select-option value="monthly">月度</a-select-option>
              <a-select-option value="quarterly">季度</a-select-option>
              <a-select-option value="yearly">年度</a-select-option>
            </a-select>
          </template>
          <div ref="revenueChart" class="chart-container"></div>
        </a-card>
      </a-col>

      <!-- 车辆利用率 -->
      <a-col :xs="24" :lg="12">
        <a-card title="车辆利用率" class="chart-card">
          <div ref="vehicleUtilizationChart" class="chart-container"></div>
        </a-card>
      </a-col>

      <!-- 客户分布 -->
      <a-col :xs="24" :lg="12">
        <a-card title="客户分布" class="chart-card">
          <div ref="customerDistributionChart" class="chart-container"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 详细数据表格 -->
    <a-row :gutter="[16, 16]" class="tables-section">
      <!-- 热门路线 -->
      <a-col :xs="24" :lg="12">
        <a-card title="热门路线 TOP 10" class="table-card">
          <template #extra>
            <a-button type="link" size="small">
              查看全部
              <RightOutlined />
            </a-button>
          </template>
          <a-table
            :columns="routeColumns"
            :data-source="topRoutes"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'rank'">
                <a-tag :color="getRankColor(index + 1)">{{ index + 1 }}</a-tag>
              </template>
              <template v-else-if="column.key === 'orders'">
                <a-progress
                  :percent="(record.orders / topRoutes[0].orders) * 100"
                  size="small"
                  :show-info="false"
                />
                <span class="ml-2">{{ record.orders }}</span>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>

      <!-- 司机绩效 -->
      <a-col :xs="24" :lg="12">
        <a-card title="司机绩效 TOP 10" class="table-card">
          <template #extra>
            <a-button type="link" size="small">
              查看全部
              <RightOutlined />
            </a-button>
          </template>
          <a-table
            :columns="driverColumns"
            :data-source="topDrivers"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'rank'">
                <a-tag :color="getRankColor(index + 1)">{{ index + 1 }}</a-tag>
              </template>
              <template v-else-if="column.key === 'score'">
                <a-rate :value="record.score / 20" disabled allow-half />
                <span class="ml-2">{{ record.score }}</span>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, h, onMounted } from 'vue'
import {
  BarChartOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CarOutlined,
  SmileOutlined,
  ArrowUpOutlined,
  RightOutlined
} from '@ant-design/icons-vue'
import { statisticsData, orderData, vehicleData, driverData, routeData } from '@/data/mockData.js'

// 概览数据
const overviewData = ref({
  totalOrders: statisticsData.overview.todayOrders + statisticsData.overview.completedOrders,
  totalRevenue: statisticsData.overview.totalRevenue,
  activeVehicles: statisticsData.overview.activeVehicles,
  satisfaction: Math.round(statisticsData.performance.customerSatisfaction * 100)
})

// 图表控制
const orderTrendPeriod = ref('month')
const revenueType = ref('monthly')

// 图表引用
const orderTrendChart = ref(null)
const revenueChart = ref(null)
const vehicleUtilizationChart = ref(null)
const customerDistributionChart = ref(null)

// 热门路线表格列
const routeColumns = [
  { title: '排名', key: 'rank', width: 80 },
  { title: '路线名称', dataIndex: 'name', key: 'name' },
  { title: '起点', dataIndex: 'origin', key: 'origin' },
  { title: '终点', dataIndex: 'destination', key: 'destination' },
  { title: '订单数', dataIndex: 'orders', key: 'orders' }
]

// 热门路线数据
const topRoutes = ref([
  { name: '京津线', origin: '北京', destination: '天津', orders: 156 },
  { name: '沪杭线', origin: '上海', destination: '杭州', orders: 142 },
  { name: '深广线', origin: '深圳', destination: '广州', orders: 128 },
  { name: '成渝线', origin: '成都', destination: '重庆', orders: 115 },
  { name: '济青线', origin: '济南', destination: '青岛', orders: 98 },
  { name: '京沪线', origin: '北京', destination: '上海', orders: 87 },
  { name: '广深线', origin: '广州', destination: '深圳', orders: 76 },
  { name: '沪宁线', origin: '上海', destination: '南京', orders: 65 },
  { name: '京广线', origin: '北京', destination: '广州', orders: 54 },
  { name: '沪深线', origin: '上海', destination: '深圳', orders: 43 }
])

// 司机绩效表格列
const driverColumns = [
  { title: '排名', key: 'rank', width: 80 },
  { title: '司机姓名', dataIndex: 'name', key: 'name' },
  { title: '完成订单', dataIndex: 'completedOrders', key: 'completedOrders' },
  { title: '准时率', dataIndex: 'onTimeRate', key: 'onTimeRate' },
  { title: '综合评分', dataIndex: 'score', key: 'score' }
]

// 司机绩效数据
const topDrivers = ref([
  { name: '张师傅', completedOrders: 89, onTimeRate: '98%', score: 95 },
  { name: '李师傅', completedOrders: 82, onTimeRate: '96%', score: 92 },
  { name: '王师傅', completedOrders: 78, onTimeRate: '94%', score: 89 },
  { name: '赵师傅', completedOrders: 75, onTimeRate: '97%', score: 88 },
  { name: '刘师傅', completedOrders: 71, onTimeRate: '93%', score: 85 },
  { name: '陈师傅', completedOrders: 68, onTimeRate: '95%', score: 84 },
  { name: '杨师傅', completedOrders: 65, onTimeRate: '92%', score: 82 },
  { name: '周师傅', completedOrders: 62, onTimeRate: '94%', score: 81 },
  { name: '吴师傅', completedOrders: 59, onTimeRate: '91%', score: 79 },
  { name: '郑师傅', completedOrders: 56, onTimeRate: '93%', score: 78 }
])

// 获取排名颜色
const getRankColor = (rank) => {
  if (rank === 1) return 'gold'
  if (rank === 2) return 'orange'
  if (rank === 3) return 'red'
  if (rank <= 5) return 'blue'
  return 'default'
}

// 初始化图表
const initCharts = () => {
  // 这里可以集成 ECharts 或其他图表库
  console.log('初始化图表...')
}

onMounted(() => {
  initCharts()
})
</script>

<style lang="scss" scoped>
.data-overview {
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

.metrics-cards {
  margin-bottom: 24px;
}

.metric-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: none;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  .metric-trend {
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 8px;

    .trend-up {
      color: #52c41a;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .trend-text {
      color: #8c8c8c;
      font-size: 12px;
    }
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

.tables-section {
  .table-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: none;
  }
}

.ml-2 {
  margin-left: 8px;
}

// 响应式设计
@media (max-width: 768px) {
  .data-overview {
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
