<template>
  <div class="data-report">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <FileTextOutlined />
        数据报表
      </h1>
      <p>生成和管理各类业务报表，支持多种格式导出</p>
    </div>

    <!-- 报表控制面板 -->
    <a-card class="control-panel" title="报表生成">
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="12" :md="8">
          <a-form-item label="报表类型">
            <a-select v-model:value="reportType" style="width: 100%" @change="onReportTypeChange">
              <a-select-option value="daily">日报</a-select-option>
              <a-select-option value="weekly">周报</a-select-option>
              <a-select-option value="monthly">月报</a-select-option>
              <a-select-option value="quarterly">季报</a-select-option>
              <a-select-option value="yearly">年报</a-select-option>
              <a-select-option value="custom">自定义</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-form-item label="报表模板">
            <a-select v-model:value="reportTemplate" style="width: 100%">
              <a-select-option value="comprehensive">综合运营报表</a-select-option>
              <a-select-option value="financial">财务报表</a-select-option>
              <a-select-option value="vehicle">车辆运营报表</a-select-option>
              <a-select-option value="driver">司机绩效报表</a-select-option>
              <a-select-option value="customer">客户分析报表</a-select-option>
              <a-select-option value="route">路线分析报表</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-form-item label="时间范围">
            <a-range-picker v-model:value="dateRange" style="width: 100%" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="12" :md="8">
          <a-form-item label="导出格式">
            <a-checkbox-group v-model:value="exportFormats">
              <a-checkbox value="pdf">PDF</a-checkbox>
              <a-checkbox value="excel">Excel</a-checkbox>
              <a-checkbox value="word">Word</a-checkbox>
              <a-checkbox value="csv">CSV</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-form-item label="发送方式">
            <a-radio-group v-model:value="deliveryMethod">
              <a-radio value="download">直接下载</a-radio>
              <a-radio value="email">邮件发送</a-radio>
              <a-radio value="schedule">定时发送</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-form-item label="操作">
            <a-space>
              <a-button type="primary" @click="generateReport" :loading="generating">
                <FileAddOutlined />
                生成报表
              </a-button>
              <a-button @click="previewReport">
                <EyeOutlined />
                预览
              </a-button>
              <a-button @click="saveTemplate">
                <SaveOutlined />
                保存模板
              </a-button>
            </a-space>
          </a-form-item>
        </a-col>
      </a-row>
    </a-card>

    <!-- 报表预览 -->
    <a-card v-if="showPreview" title="报表预览" class="preview-card">
      <template #extra>
        <a-space>
          <a-button size="small" @click="editReport">
            <EditOutlined />
            编辑
          </a-button>
          <a-button size="small" type="primary" @click="confirmGenerate">
            <CheckOutlined />
            确认生成
          </a-button>
          <a-button size="small" @click="closePreview">
            <CloseOutlined />
            关闭
          </a-button>
        </a-space>
      </template>

      <div class="report-preview">
        <!-- 报表头部 -->
        <div class="report-header">
          <h2>{{ getReportTitle() }}</h2>
          <div class="report-meta">
            <span>生成时间：{{ currentDate }}</span>
            <span>报表周期：{{ getReportPeriod() }}</span>
            <span>数据来源：车辆物流管理系统</span>
          </div>
        </div>

        <!-- 报表内容 -->
        <div class="report-content">
          <!-- 执行摘要 -->
          <div class="report-section">
            <h3>执行摘要</h3>
            <a-row :gutter="[16, 16]">
              <a-col :xs="24" :sm="12" :md="6" v-for="metric in summaryMetrics" :key="metric.key">
                <div class="summary-metric">
                  <div class="metric-value">{{ metric.value }}</div>
                  <div class="metric-label">{{ metric.label }}</div>
                  <div class="metric-change" :class="metric.trend">
                    {{ metric.change }}
                  </div>
                </div>
              </a-col>
            </a-row>
          </div>

          <!-- 详细数据表格 -->
          <div class="report-section">
            <h3>详细数据</h3>
            <a-table
              :columns="reportColumns"
              :data-source="reportData"
              :pagination="{ pageSize: 10 }"
              size="small"
              bordered
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag :color="getStatusColor(record.status)">
                    {{ record.status }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'amount'">
                  ¥{{ record.amount.toLocaleString() }}
                </template>
              </template>
            </a-table>
          </div>

          <!-- 图表区域 -->
          <div class="report-section">
            <h3>数据图表</h3>
            <a-row :gutter="[16, 16]">
              <a-col :xs="24" :lg="12">
                <div ref="reportChart1" class="report-chart"></div>
              </a-col>
              <a-col :xs="24" :lg="12">
                <div ref="reportChart2" class="report-chart"></div>
              </a-col>
            </a-row>
          </div>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  FileTextOutlined,
  FileAddOutlined,
  EyeOutlined,
  SaveOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'
import { statisticsData, orderData, vehicleData } from '@/data/mockData.js'

// 报表控制参数
const reportType = ref('monthly')
const reportTemplate = ref('comprehensive')
const dateRange = ref([])
const exportFormats = ref(['pdf'])
const deliveryMethod = ref('download')
const generating = ref(false)
const showPreview = ref(false)
const searchKeyword = ref('')

// 当前日期
const currentDate = computed(() => dayjs().format('YYYY-MM-DD HH:mm:ss'))

// 图表引用
const reportChart1 = ref(null)
const reportChart2 = ref(null)

// 摘要指标
const summaryMetrics = ref([
  { key: 'orders', label: '总订单数', value: '2,456', change: '+12.5%', trend: 'up' },
  { key: 'revenue', label: '总收入', value: '¥485万', change: '+8.3%', trend: 'up' },
  { key: 'vehicles', label: '活跃车辆', value: '156辆', change: '+5.2%', trend: 'up' },
  { key: 'efficiency', label: '运输效率', value: '92.5%', change: '+2.1%', trend: 'up' }
])

// 报表数据表格列
const reportColumns = [
  { title: '日期', dataIndex: 'date', key: 'date' },
  { title: '订单数', dataIndex: 'orders', key: 'orders' },
  { title: '收入', dataIndex: 'amount', key: 'amount' },
  { title: '车辆数', dataIndex: 'vehicles', key: 'vehicles' },
  { title: '状态', dataIndex: 'status', key: 'status' }
]

// 报表数据
const reportData = ref([
  { date: '2024-06-01', orders: 89, amount: 156000, vehicles: 45, status: '正常' },
  { date: '2024-06-02', orders: 92, amount: 168000, vehicles: 48, status: '正常' },
  { date: '2024-06-03', orders: 78, amount: 142000, vehicles: 42, status: '偏低' },
  { date: '2024-06-04', orders: 105, amount: 189000, vehicles: 52, status: '优秀' },
  { date: '2024-06-05', orders: 98, amount: 175000, vehicles: 49, status: '正常' }
])

// 分析结论
const conclusions = ref([
  {
    id: 1,
    title: '订单增长趋势',
    content: '本月订单量较上月增长12.5%，主要得益于新客户的开拓和老客户订单量的增加。建议继续加强市场推广力度。'
  },
  {
    id: 2,
    title: '运营效率提升',
    content: '车辆利用率达到78%，较上月提升5.2%。通过优化调度算法和路线规划，运输效率得到显著提升。'
  },
  {
    id: 3,
    title: '成本控制效果',
    content: '单位运输成本较上月下降3.8%，主要通过燃油管理和维修成本控制实现。建议继续推进成本优化措施。'
  }
])

// 历史报表表格列
const historyColumns = [
  { title: '报表名称', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '生成时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '文件大小', dataIndex: 'size', key: 'size' },
  { title: '操作', key: 'actions' }
]

// 历史报表数据
const historyReports = ref([
  { id: 1, name: '2024年6月综合运营报表', type: '月报', createTime: '2024-06-30 18:00', status: '已完成', size: '2.5MB' },
  { id: 2, name: '2024年Q2财务报表', type: '季报', createTime: '2024-06-30 16:30', status: '已完成', size: '3.2MB' },
  { id: 3, name: '2024年6月车辆运营报表', type: '月报', createTime: '2024-06-30 15:45', status: '已完成', size: '1.8MB' },
  { id: 4, name: '2024年6月司机绩效报表', type: '月报', createTime: '2024-06-30 14:20', status: '生成中', size: '-' },
  { id: 5, name: '2024年6月客户分析报表', type: '月报', createTime: '2024-06-30 13:15', status: '已完成', size: '2.1MB' }
])

// 获取报表标题
const getReportTitle = () => {
  const typeMap = {
    daily: '日报',
    weekly: '周报',
    monthly: '月报',
    quarterly: '季报',
    yearly: '年报',
    custom: '自定义报表'
  }
  const templateMap = {
    comprehensive: '综合运营报表',
    financial: '财务报表',
    vehicle: '车辆运营报表',
    driver: '司机绩效报表',
    customer: '客户分析报表',
    route: '路线分析报表'
  }
  return `${templateMap[reportTemplate.value]} - ${typeMap[reportType.value]}`
}

// 获取报表周期
const getReportPeriod = () => {
  if (dateRange.value && dateRange.value.length === 2) {
    return `${dayjs(dateRange.value[0]).format('YYYY-MM-DD')} 至 ${dayjs(dateRange.value[1]).format('YYYY-MM-DD')}`
  }
  return '2024年6月'
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    '正常': 'blue',
    '优秀': 'green',
    '偏低': 'orange',
    '异常': 'red'
  }
  return colorMap[status] || 'default'
}

// 报表类型变化
const onReportTypeChange = (value) => {
  console.log('报表类型变化:', value)
}

// 生成报表
const generateReport = () => {
  generating.value = true
  message.loading('正在生成报表...', 3)

  setTimeout(() => {
    generating.value = false
    showPreview.value = true
    message.success('报表生成成功！')
  }, 3000)
}

// 预览报表
const previewReport = () => {
  showPreview.value = true
  message.info('正在加载预览...')
}

// 保存模板
const saveTemplate = () => {
  message.success('模板保存成功！')
}

// 编辑报表
const editReport = () => {
  message.info('进入编辑模式')
}

// 确认生成
const confirmGenerate = () => {
  message.success('报表已确认生成并保存！')
  showPreview.value = false
}

// 关闭预览
const closePreview = () => {
  showPreview.value = false
}

// 搜索报表
const searchReports = (value) => {
  console.log('搜索报表:', value)
  message.info(`搜索关键词: ${value}`)
}

// 刷新历史
const refreshHistory = () => {
  message.success('历史报表已刷新')
}

// 下载报表
const downloadReport = (record) => {
  message.success(`正在下载: ${record.name}`)
}

// 查看报表
const viewReport = (record) => {
  message.info(`正在查看: ${record.name}`)
}

// 分享报表
const shareReport = (record) => {
  message.success(`分享链接已生成: ${record.name}`)
}

// 删除报表
const deleteReport = (record) => {
  const index = historyReports.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    historyReports.value.splice(index, 1)
    message.success('报表删除成功')
  }
}
</script>

<style lang="scss" scoped>
.data-report {
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

.preview-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: none;
}

.report-preview {
  background: white;
  border-radius: 8px;

  .report-header {
    text-align: center;
    padding: 24px 0;
    border-bottom: 2px solid #f0f0f0;
    margin-bottom: 24px;

    h2 {
      font-size: 24px;
      font-weight: 600;
      color: #262626;
      margin: 0 0 16px 0;
    }

    .report-meta {
      display: flex;
      justify-content: center;
      gap: 24px;
      color: #8c8c8c;
      font-size: 14px;

      @media (max-width: 768px) {
        flex-direction: column;
        gap: 8px;
      }
    }
  }

  .report-content {
    .report-section {
      margin-bottom: 32px;

      h3 {
        font-size: 18px;
        font-weight: 600;
        color: #262626;
        margin: 0 0 16px 0;
        padding-bottom: 8px;
        border-bottom: 1px solid #f0f0f0;
      }
    }

    .summary-metric {
      text-align: center;
      padding: 20px;
      background: #fafafa;
      border-radius: 8px;
      border: 1px solid #f0f0f0;

      .metric-value {
        font-size: 24px;
        font-weight: 600;
        color: #262626;
        margin-bottom: 8px;
      }

      .metric-label {
        color: #8c8c8c;
        font-size: 14px;
        margin-bottom: 8px;
      }

      .metric-change {
        font-size: 12px;
        padding: 2px 8px;
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

    .report-chart {
      height: 300px;
      background: #fafafa;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #8c8c8c;

      &::before {
        content: '报表图表区域';
      }
    }

    .conclusions {
      .conclusion-item {
        margin-bottom: 20px;
        padding: 16px;
        background: #f6ffed;
        border: 1px solid #b7eb8f;
        border-radius: 8px;

        h4 {
          color: #389e0d;
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
        }

        p {
          color: #52c41a;
          margin: 0;
          font-size: 13px;
          line-height: 1.6;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .report-footer {
    text-align: center;
    padding: 24px 0;
    border-top: 1px solid #f0f0f0;
    margin-top: 32px;
    color: #8c8c8c;
    font-size: 12px;

    p {
      margin: 4px 0;
    }
  }
}

.history-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: none;
}

// 响应式设计
@media (max-width: 768px) {
  .data-report {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .report-preview {
    .report-header h2 {
      font-size: 20px;
    }

    .summary-metric .metric-value {
      font-size: 20px;
    }

    .report-chart {
      height: 250px;
    }
  }
}

// 打印样式
@media print {
  .data-report {
    padding: 0;
    background: white;
  }

  .control-panel,
  .history-card {
    display: none;
  }

  .preview-card {
    box-shadow: none;
    border: none;
  }

  .report-preview {
    .report-header {
      border-bottom: 2px solid #000;
    }

    .report-section h3 {
      border-bottom: 1px solid #000;
    }
  }
}
</style>
