<template>
  <div class="salary-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <DollarOutlined />
        薪资管理
      </h1>
      <p>管理员工薪资结构、工资发放、绩效奖金，确保薪酬公平透明</p>
    </div>

    <!-- 操作工具栏 -->
    <a-card class="toolbar-card">
      <a-row :gutter="[16, 16]" align="middle">
        <a-col :xs="24" :sm="12" :md="6">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索员工姓名、工号"
            @search="handleSearch"
            style="width: 100%"
          />
        </a-col>

        <a-col :xs="24" :sm="12" :md="6">
          <a-space>
            <a-month-picker
              v-model:value="selectedMonth"
              placeholder="选择月份"
              style="width: 150px"
              @change="handleFilter"
            />

            <a-select v-model:value="filterDepartment" placeholder="部门" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部部门</a-select-option>
              <a-select-option value="调度部">调度部</a-select-option>
              <a-select-option value="运输部">运输部</a-select-option>
              <a-select-option value="维修部">维修部</a-select-option>
              <a-select-option value="财务部">财务部</a-select-option>
              <a-select-option value="人事部">人事部</a-select-option>
            </a-select>
          </a-space>
        </a-col>

        <a-col :xs="24" :sm="12" :md="6">
          <a-space>
            <a-select v-model:value="filterStatus" placeholder="发放状态" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部状态</a-select-option>
              <a-select-option value="待发放">待发放</a-select-option>
              <a-select-option value="已发放">已发放</a-select-option>
              <a-select-option value="已确认">已确认</a-select-option>
              <a-select-option value="有异议">有异议</a-select-option>
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
            <a-button type="primary" @click="showCalculateModal">
              <CalculatorOutlined />
              计算工资
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 薪资统计卡片 -->
    <a-row :gutter="[16, 16]" class="stats-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="本月总薪资"
            :value="salaryStats.totalSalary"
            :value-style="{ color: '#1890ff' }"
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
            title="已发放人数"
            :value="salaryStats.paidCount"
            :total="salaryStats.totalCount"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <CheckCircleOutlined />
            </template>
            <template #suffix>
              <span class="total-text">/ {{ salaryStats.totalCount }}</span>
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="平均薪资"
            :value="salaryStats.avgSalary"
            :value-style="{ color: '#722ed1' }"
            :formatter="(value) => `¥${value.toLocaleString()}`"
          >
            <template #prefix>
              <BarChartOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="待处理异议"
            :value="salaryStats.disputeCount"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #prefix>
              <ExclamationCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 薪资分析图表 -->
    <a-row :gutter="[16, 16]" class="charts-section">
      <a-col :xs="24" :lg="12">
        <a-card title="薪资分布分析" class="chart-card">
          <template #extra>
            <a-radio-group v-model:value="chartType" size="small">
              <a-radio-button value="department">按部门</a-radio-button>
              <a-radio-button value="position">按职位</a-radio-button>
              <a-radio-button value="range">按薪资段</a-radio-button>
            </a-radio-group>
          </template>
          <div ref="distributionChart" class="chart-container"></div>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="12">
        <a-card title="薪资趋势分析" class="chart-card">
          <template #extra>
            <a-select v-model:value="trendPeriod" size="small" style="width: 100px">
              <a-select-option value="6month">6个月</a-select-option>
              <a-select-option value="12month">12个月</a-select-option>
              <a-select-option value="24month">24个月</a-select-option>
            </a-select>
          </template>
          <div ref="trendChart" class="chart-container"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 薪资记录列表 -->
    <a-card title="薪资记录" class="salary-table-card">
      <template #extra>
        <a-space>
          <a-button size="small" @click="handleBatchPay" :disabled="selectedRowKeys.length === 0">
            <PayCircleOutlined />
            批量发放
          </a-button>
          <a-dropdown>
            <a-button size="small">
              更多操作
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="handleBatchExport">批量导出</a-menu-item>
                <a-menu-item key="2" @click="handleBatchConfirm">批量确认</a-menu-item>
                <a-menu-item key="3" @click="handleBatchSlip">生成工资条</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-space>
      </template>

      <a-table
        :columns="salaryColumns"
        :data-source="filteredSalary"
        :pagination="pagination"
        :loading="loading"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
        size="small"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a @click="viewEmployeeDetail(record)">{{ record.name }}</a>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ record.status }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'baseSalary'">
            ¥{{ record.baseSalary.toLocaleString() }}
          </template>

          <template v-else-if="column.key === 'bonus'">
            ¥{{ record.bonus.toLocaleString() }}
          </template>

          <template v-else-if="column.key === 'deduction'">
            ¥{{ record.deduction.toLocaleString() }}
          </template>

          <template v-else-if="column.key === 'netSalary'">
            <span class="net-salary">¥{{ record.netSalary.toLocaleString() }}</span>
          </template>

          <template v-else-if="column.key === 'payDate'">
            {{ formatDate(record.payDate) }}
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a @click="viewSalaryDetail(record)">详情</a>
              <a @click="editSalary(record)" v-if="record.status === '待发放'">编辑</a>
              <a @click="paySalary(record)" v-if="record.status === '待发放'">发放</a>
              <a-dropdown>
                <a>
                  更多
                  <DownOutlined />
                </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="generateSlip(record)">生成工资条</a-menu-item>
                    <a-menu-item key="2" @click="sendNotification(record)">发送通知</a-menu-item>
                    <a-menu-item key="3" @click="viewHistory(record)">历史记录</a-menu-item>
                    <a-menu-item key="4" @click="handleDispute(record)" v-if="record.status === '已发放'">申请异议</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 工资计算弹窗 -->
    <a-modal
      v-model:open="calculateModalVisible"
      title="工资计算"
      width="800px"
      @ok="handleCalculateOk"
      @cancel="handleCalculateCancel"
    >
      <a-form
        ref="calculateFormRef"
        :model="calculateFormData"
        :rules="calculateFormRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="计算月份" name="month">
              <a-month-picker v-model:value="calculateFormData.month" style="width: 100%" />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item label="计算范围" name="scope">
              <a-select v-model:value="calculateFormData.scope" placeholder="请选择计算范围">
                <a-select-option value="all">全部员工</a-select-option>
                <a-select-option value="department">指定部门</a-select-option>
                <a-select-option value="employee">指定员工</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16" v-if="calculateFormData.scope === 'department'">
          <a-col :span="24">
            <a-form-item label="选择部门" name="departments">
              <a-select v-model:value="calculateFormData.departments" mode="multiple" placeholder="请选择部门">
                <a-select-option value="调度部">调度部</a-select-option>
                <a-select-option value="运输部">运输部</a-select-option>
                <a-select-option value="维修部">维修部</a-select-option>
                <a-select-option value="财务部">财务部</a-select-option>
                <a-select-option value="人事部">人事部</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16" v-if="calculateFormData.scope === 'employee'">
          <a-col :span="24">
            <a-form-item label="选择员工" name="employees">
              <a-select v-model:value="calculateFormData.employees" mode="multiple" placeholder="请选择员工">
                <a-select-option v-for="emp in employeeList" :key="emp.id" :value="emp.id">
                  {{ emp.name }} ({{ emp.employeeId }})
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="计算规则" name="rules">
          <a-checkbox-group v-model:value="calculateFormData.rules">
            <a-row>
              <a-col :span="8">
                <a-checkbox value="attendance">考勤扣款</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="performance">绩效奖金</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="overtime">加班费</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="insurance">社保扣除</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="tax">个税计算</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="subsidy">补贴津贴</a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-form-item>

        <a-form-item label="备注说明" name="remark">
          <a-textarea v-model:value="calculateFormData.remark" placeholder="请输入计算说明" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  DollarOutlined,
  ReloadOutlined,
  DownloadOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined,
  PayCircleOutlined,
  DownOutlined
} from '@ant-design/icons-vue'

// 搜索和筛选
const searchKeyword = ref('')
const selectedMonth = ref(dayjs())
const filterDepartment = ref('')
const filterStatus = ref('')
const loading = ref(false)

// 图表控制
const chartType = ref('department')
const trendPeriod = ref('12month')

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

// 员工列表（简化版）
const employeeList = ref([
  { id: 'EMP001', employeeId: 'E001', name: '张师傅', department: '运输部' },
  { id: 'EMP002', employeeId: 'E002', name: '李调度', department: '调度部' },
  { id: 'EMP003', employeeId: 'E003', name: '王维修', department: '维修部' },
  { id: 'EMP004', employeeId: 'E004', name: '赵财务', department: '财务部' },
  { id: 'EMP005', employeeId: 'E005', name: '钱人事', department: '人事部' }
])

// 薪资记录数据
const salaryRecords = ref([
  {
    id: 'SAL001',
    employeeId: 'E001',
    name: '张师傅',
    department: '运输部',
    position: '司机',
    month: '2024-07',
    baseSalary: 8000,
    bonus: 1200,
    overtime: 800,
    subsidy: 500,
    deduction: 300,
    insurance: 800,
    tax: 150,
    netSalary: 10050,
    status: '已发放',
    payDate: '2024-07-05',
    confirmDate: '2024-07-06',
    key: 'SAL001'
  },
  {
    id: 'SAL002',
    employeeId: 'E002',
    name: '李调度',
    department: '调度部',
    position: '调度员',
    month: '2024-07',
    baseSalary: 7500,
    bonus: 1000,
    overtime: 600,
    subsidy: 300,
    deduction: 200,
    insurance: 750,
    tax: 120,
    netSalary: 8330,
    status: '已确认',
    payDate: '2024-07-05',
    confirmDate: '2024-07-06',
    key: 'SAL002'
  },
  {
    id: 'SAL003',
    employeeId: 'E003',
    name: '王维修',
    department: '维修部',
    position: '维修工',
    month: '2024-07',
    baseSalary: 6500,
    bonus: 800,
    overtime: 400,
    subsidy: 200,
    deduction: 150,
    insurance: 650,
    tax: 80,
    netSalary: 7020,
    status: '待发放',
    payDate: null,
    confirmDate: null,
    key: 'SAL003'
  },
  {
    id: 'SAL004',
    employeeId: 'E004',
    name: '赵财务',
    department: '财务部',
    position: '会计',
    month: '2024-07',
    baseSalary: 7000,
    bonus: 900,
    overtime: 300,
    subsidy: 250,
    deduction: 100,
    insurance: 700,
    tax: 100,
    netSalary: 7550,
    status: '有异议',
    payDate: '2024-07-05',
    confirmDate: null,
    key: 'SAL004'
  },
  {
    id: 'SAL005',
    employeeId: 'E005',
    name: '钱人事',
    department: '人事部',
    position: '人事专员',
    month: '2024-07',
    baseSalary: 6000,
    bonus: 600,
    overtime: 200,
    subsidy: 150,
    deduction: 50,
    insurance: 600,
    tax: 60,
    netSalary: 6240,
    status: '待发放',
    payDate: null,
    confirmDate: null,
    key: 'SAL005'
  }
])

// 薪资统计
const salaryStats = ref({
  totalSalary: salaryRecords.value.reduce((sum, record) => sum + record.netSalary, 0),
  totalCount: salaryRecords.value.length,
  paidCount: salaryRecords.value.filter(record => record.status === '已发放' || record.status === '已确认').length,
  avgSalary: Math.round(salaryRecords.value.reduce((sum, record) => sum + record.netSalary, 0) / salaryRecords.value.length),
  disputeCount: salaryRecords.value.filter(record => record.status === '有异议').length
})

// 表格列配置
const salaryColumns = [
  { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
  { title: '工号', dataIndex: 'employeeId', key: 'employeeId', width: 100 },
  { title: '部门', dataIndex: 'department', key: 'department', width: 100 },
  { title: '职位', dataIndex: 'position', key: 'position', width: 100 },
  { title: '月份', dataIndex: 'month', key: 'month', width: 100 },
  { title: '基本工资', dataIndex: 'baseSalary', key: 'baseSalary', width: 120 },
  { title: '奖金', dataIndex: 'bonus', key: 'bonus', width: 100 },
  { title: '扣款', dataIndex: 'deduction', key: 'deduction', width: 100 },
  { title: '实发工资', dataIndex: 'netSalary', key: 'netSalary', width: 120 },
  { title: '发放状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '发放日期', dataIndex: 'payDate', key: 'payDate', width: 120 },
  { title: '操作', key: 'actions', width: 200, fixed: 'right' }
]

// 过滤后的薪资数据
const filteredSalary = computed(() => {
  let result = salaryRecords.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(record =>
      record.name.toLowerCase().includes(keyword) ||
      record.employeeId.toLowerCase().includes(keyword)
    )
  }

  // 部门过滤
  if (filterDepartment.value) {
    result = result.filter(record => record.department === filterDepartment.value)
  }

  // 状态过滤
  if (filterStatus.value) {
    result = result.filter(record => record.status === filterStatus.value)
  }

  // 月份过滤
  if (selectedMonth.value) {
    const monthStr = selectedMonth.value.format('YYYY-MM')
    result = result.filter(record => record.month === monthStr)
  }

  pagination.value.total = result.length
  return result
})

// 工资计算弹窗
const calculateModalVisible = ref(false)
const calculateFormRef = ref()
const calculateFormData = ref({
  month: dayjs(),
  scope: 'all',
  departments: [],
  employees: [],
  rules: ['attendance', 'performance', 'insurance', 'tax'],
  remark: ''
})

const calculateFormRules = {
  month: [{ required: true, message: '请选择计算月份', trigger: 'change' }],
  scope: [{ required: true, message: '请选择计算范围', trigger: 'change' }]
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    '待发放': 'orange',
    '已发放': 'blue',
    '已确认': 'green',
    '有异议': 'red'
  }
  return colorMap[status] || 'default'
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
  message.success('薪资数据导出成功')
}

// 显示计算工资弹窗
const showCalculateModal = () => {
  calculateModalVisible.value = true
}

// 表格选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 表格变化处理
const handleTableChange = (pag) => {
  pagination.value = { ...pagination.value, ...pag }
}

// 查看员工详情
const viewEmployeeDetail = (record) => {
  message.info(`查看员工详情: ${record.name}`)
}

// 查看薪资详情
const viewSalaryDetail = (record) => {
  message.info(`查看薪资详情: ${record.id}`)
}

// 编辑薪资
const editSalary = (record) => {
  message.info(`编辑薪资记录: ${record.id}`)
}

// 发放工资
const paySalary = (record) => {
  record.status = '已发放'
  record.payDate = dayjs().format('YYYY-MM-DD')
  message.success(`工资发放成功: ${record.name}`)
}

// 生成工资条
const generateSlip = (record) => {
  message.success(`工资条生成成功: ${record.name}`)
}

// 发送通知
const sendNotification = (record) => {
  message.success(`通知发送成功: ${record.name}`)
}

// 查看历史记录
const viewHistory = (record) => {
  message.info(`查看历史记录: ${record.name}`)
}

// 处理异议
const handleDispute = (record) => {
  record.status = '有异议'
  message.info(`异议申请已提交: ${record.name}`)
}

// 批量发放
const handleBatchPay = () => {
  selectedRowKeys.value.forEach(key => {
    const record = salaryRecords.value.find(item => item.key === key)
    if (record && record.status === '待发放') {
      record.status = '已发放'
      record.payDate = dayjs().format('YYYY-MM-DD')
    }
  })
  message.success(`批量发放 ${selectedRowKeys.value.length} 条薪资记录`)
  selectedRowKeys.value = []
}

// 批量导出
const handleBatchExport = () => {
  message.success(`批量导出 ${selectedRowKeys.value.length} 条薪资记录`)
  selectedRowKeys.value = []
}

// 批量确认
const handleBatchConfirm = () => {
  selectedRowKeys.value.forEach(key => {
    const record = salaryRecords.value.find(item => item.key === key)
    if (record && record.status === '已发放') {
      record.status = '已确认'
      record.confirmDate = dayjs().format('YYYY-MM-DD')
    }
  })
  message.success(`批量确认 ${selectedRowKeys.value.length} 条薪资记录`)
  selectedRowKeys.value = []
}

// 批量生成工资条
const handleBatchSlip = () => {
  message.success(`批量生成 ${selectedRowKeys.value.length} 个工资条`)
  selectedRowKeys.value = []
}

// 工资计算确认
const handleCalculateOk = () => {
  calculateFormRef.value.validate().then(() => {
    const monthStr = calculateFormData.value.month.format('YYYY-MM')
    message.success(`${monthStr} 工资计算完成`)
    calculateModalVisible.value = false
    resetCalculateForm()
  }).catch(() => {
    message.error('请检查表单信息')
  })
}

// 工资计算取消
const handleCalculateCancel = () => {
  calculateModalVisible.value = false
  resetCalculateForm()
}

// 重置计算表单
const resetCalculateForm = () => {
  calculateFormData.value = {
    month: dayjs(),
    scope: 'all',
    departments: [],
    employees: [],
    rules: ['attendance', 'performance', 'insurance', 'tax'],
    remark: ''
  }
}

onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.salary-management {
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

  .total-text {
    color: #8c8c8c;
    font-size: 14px;
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

.salary-table-card {
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

.net-salary {
  font-weight: 600;
  color: #52c41a;
}

// 响应式设计
@media (max-width: 768px) {
  .salary-management {
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
