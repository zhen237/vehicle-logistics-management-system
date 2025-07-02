<template>
  <div class="data-analysis">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <LineChartOutlined />
        数据分析
      </h1>
      <p>深度分析业务数据，发现趋势和规律，为决策提供支持</p>
    </div>

    <!-- 分析控制面板 -->
    <a-card class="control-panel" title="分析控制面板">
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="12" :md="6">
          <a-form-item label="分析维度">
            <a-select v-model:value="analysisDimension" style="width: 100%">
              <a-select-option value="time">时间维度</a-select-option>
              <a-select-option value="region">地区维度</a-select-option>
              <a-select-option value="vehicle">车辆维度</a-select-option>
              <a-select-option value="driver">司机维度</a-select-option>
              <a-select-option value="customer">客户维度</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="12" :md="6">
          <a-form-item label="时间范围">
            <a-range-picker v-model:value="dateRange" style="width: 100%" />
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="12" :md="6">
          <a-form-item label="对比类型">
            <a-select v-model:value="compareType" style="width: 100%">
              <a-select-option value="none">无对比</a-select-option>
              <a-select-option value="period">同期对比</a-select-option>
              <a-select-option value="target">目标对比</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="12" :md="6">
          <a-form-item label="操作">
            <a-space>
              <a-button type="primary" @click="runAnalysis">
                <SearchOutlined />
                开始分析
              </a-button>
              <a-button @click="exportData">
                <DownloadOutlined />
                导出数据
              </a-button>
            </a-space>
          </a-form-item>
        </a-col>
      </a-row>
    </a-card>

    <!-- 分析结果 -->
    <a-row :gutter="[16, 16]" class="analysis-results">
      <!-- 趋势分析 -->
      <a-col :xs="24" :lg="12">
        <a-card title="趋势分析" class="analysis-card">
          <template #extra>
            <a-dropdown>
              <a-button size="small">
                更多选项
                <DownOutlined />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="1">切换图表类型</a-menu-item>
                  <a-menu-item key="2">设置预警线</a-menu-item>
                  <a-menu-item key="3">添加注释</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
          <div ref="trendChart" class="chart-container"></div>

          <!-- 趋势分析结论 -->
          <div class="analysis-conclusion">
            <h4>分析结论：</h4>
            <ul>
              <li>订单量呈现稳定增长趋势，月增长率约12.5%</li>
              <li>周末订单量明显高于工作日，建议增加周末运力</li>
              <li>6月份订单量达到峰值，可能与季节性因素相关</li>
            </ul>
          </div>
        </a-card>
      </a-col>

      <!-- 对比分析 -->
      <a-col :xs="24" :lg="12">
        <a-card title="对比分析" class="analysis-card">
          <template #extra>
            <a-radio-group v-model:value="compareMetric" size="small">
              <a-radio-button value="orders">订单量</a-radio-button>
              <a-radio-button value="revenue">收入</a-radio-button>
              <a-radio-button value="efficiency">效率</a-radio-button>
            </a-radio-group>
          </template>
          <div ref="compareChart" class="chart-container"></div>

          <!-- 对比分析结论 -->
          <div class="analysis-conclusion">
            <h4>对比结论：</h4>
            <ul>
              <li>本月订单量较上月增长15.3%，超出预期目标</li>
              <li>华东地区表现最佳，订单量占总量的35%</li>
              <li>重点客户贡献度提升，大客户订单占比达到60%</li>
            </ul>
          </div>
        </a-card>
      </a-col>

      <!-- 相关性分析 -->
      <a-col :xs="24" :lg="12">
        <a-card title="相关性分析" class="analysis-card">
          <div ref="correlationChart" class="chart-container"></div>

          <!-- 相关性分析表格 -->
          <a-table
            :columns="correlationColumns"
            :data-source="correlationData"
            :pagination="false"
            size="small"
            class="correlation-table"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'correlation'">
                <a-progress
                  :percent="Math.abs(record.correlation) * 100"
                  :status="record.correlation > 0.7 ? 'success' : record.correlation > 0.3 ? 'normal' : 'exception'"
                  size="small"
                />
                <span class="ml-2">{{ record.correlation.toFixed(3) }}</span>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>

      <!-- 异常检测 -->
      <a-col :xs="24" :lg="12">
        <a-card title="异常检测" class="analysis-card">
          <template #extra>
            <a-badge :count="anomalies.length" :offset="[10, 0]">
              <a-button size="small" type="primary" ghost>
                <AlertOutlined />
                异常告警
              </a-button>
            </a-badge>
          </template>

          <!-- 异常列表 -->
          <a-list
            :data-source="anomalies"
            size="small"
            class="anomaly-list"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar :style="{ backgroundColor: item.level === 'high' ? '#ff4d4f' : item.level === 'medium' ? '#faad14' : '#52c41a' }">
                      <ExclamationOutlined />
                    </a-avatar>
                  </template>
                  <template #title>
                    <span>{{ item.title }}</span>
                    <a-tag :color="item.level === 'high' ? 'red' : item.level === 'medium' ? 'orange' : 'green'" class="ml-2">
                      {{ item.level === 'high' ? '高' : item.level === 'medium' ? '中' : '低' }}
                    </a-tag>
                  </template>
                  <template #description>
                    {{ item.description }}
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <a @click="handleAnomaly(item)">处理</a>
                  <a @click="ignoreAnomaly(item)">忽略</a>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>

    <!-- 预测分析 -->
    <a-card title="预测分析" class="prediction-card">
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :lg="16">
          <div ref="predictionChart" class="chart-container large"></div>
        </a-col>

        <a-col :xs="24" :lg="8">
          <div class="prediction-summary">
            <h4>预测摘要</h4>
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="预测模型">ARIMA + 机器学习</a-descriptions-item>
              <a-descriptions-item label="预测精度">92.5%</a-descriptions-item>
              <a-descriptions-item label="置信区间">95%</a-descriptions-item>
              <a-descriptions-item label="预测周期">未来30天</a-descriptions-item>
            </a-descriptions>

            <a-divider />

            <h4>关键预测</h4>
            <div class="prediction-metrics">
              <div class="metric-item">
                <span class="label">下月订单量预测：</span>
                <span class="value">2,850 单</span>
                <span class="trend up">↗ +18%</span>
              </div>
              <div class="metric-item">
                <span class="label">收入预测：</span>
                <span class="value">¥485万</span>
                <span class="trend up">↗ +12%</span>
              </div>
              <div class="metric-item">
                <span class="label">车辆需求：</span>
                <span class="value">165 辆</span>
                <span class="trend up">↗ +6%</span>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  LineChartOutlined,
  SearchOutlined,
  DownloadOutlined,
  DownOutlined,
  AlertOutlined,
  ExclamationOutlined
} from '@ant-design/icons-vue'
import { statisticsData } from '@/data/mockData.js'

// 分析控制参数
const analysisDimension = ref('time')
const dateRange = ref([])
const compareType = ref('none')
const compareMetric = ref('orders')

// 图表引用
const trendChart = ref(null)
const compareChart = ref(null)
const correlationChart = ref(null)
const predictionChart = ref(null)

// 相关性分析表格列
const correlationColumns = [
  { title: '指标1', dataIndex: 'metric1', key: 'metric1' },
  { title: '指标2', dataIndex: 'metric2', key: 'metric2' },
  { title: '相关系数', dataIndex: 'correlation', key: 'correlation' },
  { title: '显著性', dataIndex: 'significance', key: 'significance' }
]

// 相关性分析数据
const correlationData = ref([
  { metric1: '订单量', metric2: '收入', correlation: 0.892, significance: '高' },
  { metric1: '车辆数', metric2: '订单量', correlation: 0.756, significance: '高' },
  { metric1: '司机数', metric2: '完成率', correlation: 0.634, significance: '中' },
  { metric1: '天气', metric2: '延误率', correlation: -0.423, significance: '中' },
  { metric1: '油价', metric2: '成本', correlation: 0.789, significance: '高' }
])

// 异常检测数据
const anomalies = ref([
  {
    id: 1,
    title: '订单量异常下降',
    description: '6月25日订单量较前一日下降35%，超出正常波动范围',
    level: 'high',
    date: '2024-06-25'
  },
  {
    id: 2,
    title: '车辆利用率偏低',
    description: '华南地区车辆利用率连续3天低于60%',
    level: 'medium',
    date: '2024-06-28'
  },
  {
    id: 3,
    title: '客户投诉率上升',
    description: '本周客户投诉率较上周上升15%',
    level: 'medium',
    date: '2024-06-30'
  },
  {
    id: 4,
    title: '燃油成本异常',
    description: '单位运输燃油成本较历史均值偏高8%',
    level: 'low',
    date: '2024-06-29'
  }
])

// 开始分析
const runAnalysis = () => {
  message.loading('正在进行数据分析...', 2)
  setTimeout(() => {
    message.success('分析完成！')
    // 这里可以触发图表更新
    updateCharts()
  }, 2000)
}

// 导出数据
const exportData = () => {
  message.success('数据导出成功！')
  // 这里可以实现数据导出功能
}

// 处理异常
const handleAnomaly = (anomaly) => {
  message.info(`正在处理异常：${anomaly.title}`)
}

// 忽略异常
const ignoreAnomaly = (anomaly) => {
  const index = anomalies.value.findIndex(item => item.id === anomaly.id)
  if (index > -1) {
    anomalies.value.splice(index, 1)
    message.success('已忽略该异常')
  }
}

// 更新图表
const updateCharts = () => {
  console.log('更新分析图表...')
  // 这里可以集成 ECharts 或其他图表库
}

// 初始化图表
const initCharts = () => {
  console.log('初始化分析图表...')
}

onMounted(() => {
  initCharts()
})
</script>

<style lang="scss" scoped>
.data-analysis {
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

.control-panel {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: none;
}

.analysis-results {
  margin-bottom: 24px;
}

.analysis-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: none;
  margin-bottom: 16px;

  .chart-container {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafafa;
    border-radius: 8px;
    color: #8c8c8c;
    margin-bottom: 16px;

    &::before {
      content: '分析图表区域 (可集成 ECharts)';
    }

    &.large {
      height: 400px;
    }
  }

  .analysis-conclusion {
    background: #f6ffed;
    border: 1px solid #b7eb8f;
    border-radius: 8px;
    padding: 16px;

    h4 {
      color: #389e0d;
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
    }

    ul {
      margin: 0;
      padding-left: 20px;

      li {
        color: #52c41a;
        margin-bottom: 8px;
        font-size: 13px;
        line-height: 1.5;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

.correlation-table {
  margin-top: 16px;
}

.anomaly-list {
  max-height: 400px;
  overflow-y: auto;

  .ant-list-item {
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }
}

.prediction-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: none;
}

.prediction-summary {
  h4 {
    color: #262626;
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
  }
}

.prediction-metrics {
  .metric-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    padding: 12px;
    background: #fafafa;
    border-radius: 8px;

    .label {
      color: #8c8c8c;
      font-size: 13px;
      flex: 1;
    }

    .value {
      color: #262626;
      font-weight: 600;
      margin-right: 8px;
    }

    .trend {
      font-size: 12px;
      padding: 2px 6px;
      border-radius: 4px;

      &.up {
        color: #52c41a;
        background: #f6ffed;
      }

      &.down {
        color: #ff4d4f;
        background: #fff2f0;
      }
    }
  }
}

.ml-2 {
  margin-left: 8px;
}

// 响应式设计
@media (max-width: 768px) {
  .data-analysis {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .chart-container {
    height: 250px;

    &.large {
      height: 300px;
    }
  }
}
</style>
