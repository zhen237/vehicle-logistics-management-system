<template>
  <div class="attendance-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <CalendarOutlined />
        考勤管理
      </h1>
      <p>管理员工考勤记录，统计出勤情况，提升工作效率</p>
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
          <a-range-picker
            v-model:value="dateRange"
            style="width: 100%"
            @change="handleFilter"
            :presets="datePresets"
          />
        </a-col>

        <a-col :xs="24" :sm="12" :md="6">
          <a-space>
            <a-select v-model:value="filterDepartment" placeholder="部门" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部部门</a-select-option>
              <a-select-option value="调度部">调度部</a-select-option>
              <a-select-option value="运输部">运输部</a-select-option>
              <a-select-option value="维修部">维修部</a-select-option>
              <a-select-option value="财务部">财务部</a-select-option>
            </a-select>

            <a-select v-model:value="filterStatus" placeholder="考勤状态" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部状态</a-select-option>
              <a-select-option value="正常">正常</a-select-option>
              <a-select-option value="迟到">迟到</a-select-option>
              <a-select-option value="早退">早退</a-select-option>
              <a-select-option value="缺勤">缺勤</a-select-option>
              <a-select-option value="请假">请假</a-select-option>
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
            <a-button type="primary" @click="showCheckInModal">
              <ClockCircleOutlined />
              手动打卡
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 考勤统计卡片 -->
    <a-row :gutter="[16, 16]" class="stats-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="今日出勤"
            :value="attendanceStats.todayPresent"
            :total="attendanceStats.totalStaff"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <CheckCircleOutlined />
            </template>
            <template #suffix>
              <span class="total-text">/ {{ attendanceStats.totalStaff }}</span>
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="迟到人数"
            :value="attendanceStats.lateCount"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #prefix>
              <ExclamationCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="请假人数"
            :value="attendanceStats.leaveCount"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <UserDeleteOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="出勤率"
            :value="attendanceStats.attendanceRate"
            suffix="%"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <PercentageOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 考勤趋势图表 -->
    <a-row :gutter="[16, 16]" class="charts-section">
      <a-col :xs="24" :lg="12">
        <a-card title="考勤趋势分析" class="chart-card">
          <template #extra>
            <a-radio-group v-model:value="trendPeriod" size="small">
              <a-radio-button value="week">周</a-radio-button>
              <a-radio-button value="month">月</a-radio-button>
              <a-radio-button value="quarter">季</a-radio-button>
            </a-radio-group>
          </template>
          <div ref="trendChart" class="chart-container"></div>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="12">
        <a-card title="部门出勤对比" class="chart-card">
          <template #extra>
            <a-select v-model:value="compareMetric" size="small" style="width: 100px">
              <a-select-option value="rate">出勤率</a-select-option>
              <a-select-option value="late">迟到率</a-select-option>
              <a-select-option value="leave">请假率</a-select-option>
            </a-select>
          </template>
          <div ref="compareChart" class="chart-container"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 考勤记录列表 -->
    <a-card title="考勤记录" class="attendance-table-card">
      <template #extra>
        <a-space>
          <a-button size="small" @click="handleBatchApprove" :disabled="selectedRowKeys.length === 0">
            <CheckOutlined />
            批量审批
          </a-button>
          <a-dropdown>
            <a-button size="small">
              更多操作
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="handleBatchExport">批量导出</a-menu-item>
                <a-menu-item key="2" @click="handleBatchCorrect">批量修正</a-menu-item>
                <a-menu-item key="3" @click="handleBatchReport">生成报告</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-space>
      </template>

      <a-table
        :columns="attendanceColumns"
        :data-source="filteredAttendance"
        :pagination="pagination"
        :loading="loading"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
        size="small"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a @click="viewStaffDetail(record)">{{ record.name }}</a>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ record.status }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'checkInTime'">
            <span :class="{ 'text-danger': isLate(record.checkInTime) }">
              {{ formatTime(record.checkInTime) }}
            </span>
          </template>

          <template v-else-if="column.key === 'checkOutTime'">
            <span :class="{ 'text-warning': isEarlyLeave(record.checkOutTime) }">
              {{ formatTime(record.checkOutTime) }}
            </span>
          </template>

          <template v-else-if="column.key === 'workHours'">
            {{ record.workHours }}小时
          </template>

          <template v-else-if="column.key === 'date'">
            {{ formatDate(record.date) }}
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a @click="editAttendance(record)">编辑</a>
              <a @click="viewDetail(record)">详情</a>
              <a @click="correctRecord(record)" v-if="record.status !== '正常'">修正</a>
              <a-dropdown>
                <a>
                  更多
                  <DownOutlined />
                </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="approveRecord(record)">审批</a-menu-item>
                    <a-menu-item key="2" @click="addRemark(record)">添加备注</a-menu-item>
                    <a-menu-item key="3" @click="exportRecord(record)">导出记录</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 手动打卡弹窗 -->
    <a-modal
      v-model:open="checkInModalVisible"
      title="手动打卡"
      width="500px"
      @ok="handleCheckInOk"
      @cancel="handleCheckInCancel"
    >
      <a-form
        ref="checkInFormRef"
        :model="checkInFormData"
        :rules="checkInFormRules"
        layout="vertical"
      >
        <a-form-item label="员工" name="employeeId">
          <a-select v-model:value="checkInFormData.employeeId" placeholder="请选择员工">
            <a-select-option v-for="staff in staffList" :key="staff.id" :value="staff.id">
              {{ staff.name }} ({{ staff.employeeId }})
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="打卡类型" name="type">
          <a-radio-group v-model:value="checkInFormData.type">
            <a-radio value="in">上班打卡</a-radio>
            <a-radio value="out">下班打卡</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="打卡时间" name="time">
          <a-time-picker v-model:value="checkInFormData.time" style="width: 100%" />
        </a-form-item>

        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="checkInFormData.remark" placeholder="请输入备注信息" :rows="3" />
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
  CalendarOutlined,
  ReloadOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserDeleteOutlined,
  PercentageOutlined,
  CheckOutlined,
  DownOutlined
} from '@ant-design/icons-vue'

// 搜索和筛选
const searchKeyword = ref('')
const dateRange = ref([])
const filterDepartment = ref('')
const filterStatus = ref('')
const loading = ref(false)

// 图表控制
const trendPeriod = ref('week')
const compareMetric = ref('rate')

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
  { label: '本月', value: [dayjs().startOf('month'), dayjs().endOf('month')] }
]

// 员工列表（简化版）
const staffList = ref([
  { id: 'EMP001', employeeId: 'E001', name: '张师傅', department: '运输部' },
  { id: 'EMP002', employeeId: 'E002', name: '李调度', department: '调度部' },
  { id: 'EMP003', employeeId: 'E003', name: '王维修', department: '维修部' },
  { id: 'EMP004', employeeId: 'E004', name: '赵财务', department: '财务部' },
  { id: 'EMP005', employeeId: 'E005', name: '钱人事', department: '人事部' }
])

// 考勤记录数据
const attendanceRecords = ref([
  {
    id: 'ATT001',
    employeeId: 'E001',
    name: '张师傅',
    department: '运输部',
    date: '2024-07-02',
    checkInTime: '08:30:00',
    checkOutTime: '18:00:00',
    workHours: 8.5,
    status: '迟到',
    remark: '路上堵车',
    key: 'ATT001'
  },
  {
    id: 'ATT002',
    employeeId: 'E002',
    name: '李调度',
    department: '调度部',
    date: '2024-07-02',
    checkInTime: '08:00:00',
    checkOutTime: '18:00:00',
    workHours: 9,
    status: '正常',
    remark: '',
    key: 'ATT002'
  },
  {
    id: 'ATT003',
    employeeId: 'E003',
    name: '王维修',
    department: '维修部',
    date: '2024-07-02',
    checkInTime: '08:00:00',
    checkOutTime: '17:30:00',
    workHours: 8.5,
    status: '早退',
    remark: '家中有事',
    key: 'ATT003'
  },
  {
    id: 'ATT004',
    employeeId: 'E004',
    name: '赵财务',
    department: '财务部',
    date: '2024-07-02',
    checkInTime: '08:00:00',
    checkOutTime: '18:00:00',
    workHours: 9,
    status: '正常',
    remark: '',
    key: 'ATT004'
  },
  {
    id: 'ATT005',
    employeeId: 'E005',
    name: '钱人事',
    department: '人事部',
    date: '2024-07-02',
    checkInTime: null,
    checkOutTime: null,
    workHours: 0,
    status: '请假',
    remark: '病假',
    key: 'ATT005'
  }
])

// 考勤统计
const attendanceStats = ref({
  totalStaff: staffList.value.length,
  todayPresent: attendanceRecords.value.filter(record => record.status !== '缺勤' && record.status !== '请假').length,
  lateCount: attendanceRecords.value.filter(record => record.status === '迟到').length,
  leaveCount: attendanceRecords.value.filter(record => record.status === '请假').length,
  attendanceRate: Math.round((attendanceRecords.value.filter(record => record.status !== '缺勤' && record.status !== '请假').length / staffList.value.length) * 100)
})

// 表格列配置
const attendanceColumns = [
  { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
  { title: '工号', dataIndex: 'employeeId', key: 'employeeId', width: 100 },
  { title: '部门', dataIndex: 'department', key: 'department', width: 100 },
  { title: '日期', dataIndex: 'date', key: 'date', width: 120 },
  { title: '上班时间', dataIndex: 'checkInTime', key: 'checkInTime', width: 120 },
  { title: '下班时间', dataIndex: 'checkOutTime', key: 'checkOutTime', width: 120 },
  { title: '工作时长', dataIndex: 'workHours', key: 'workHours', width: 100 },
  { title: '考勤状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 150 },
  { title: '操作', key: 'actions', width: 200, fixed: 'right' }
]

// 过滤后的考勤数据
const filteredAttendance = computed(() => {
  let result = attendanceRecords.value

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

  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    result = result.filter(record => {
      const recordDate = dayjs(record.date)
      return recordDate.isAfter(dayjs(startDate).subtract(1, 'day')) &&
             recordDate.isBefore(dayjs(endDate).add(1, 'day'))
    })
  }

  pagination.value.total = result.length
  return result
})

// 手动打卡弹窗
const checkInModalVisible = ref(false)
const checkInFormRef = ref()
const checkInFormData = ref({
  employeeId: '',
  type: 'in',
  time: null,
  remark: ''
})

const checkInFormRules = {
  employeeId: [{ required: true, message: '请选择员工', trigger: 'change' }],
  type: [{ required: true, message: '请选择打卡类型', trigger: 'change' }],
  time: [{ required: true, message: '请选择打卡时间', trigger: 'change' }]
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    '正常': 'green',
    '迟到': 'orange',
    '早退': 'blue',
    '缺勤': 'red',
    '请假': 'purple'
  }
  return colorMap[status] || 'default'
}

// 判断是否迟到
const isLate = (checkInTime) => {
  if (!checkInTime) return false
  return dayjs(`2024-01-01 ${checkInTime}`).isAfter(dayjs('2024-01-01 08:00:00'))
}

// 判断是否早退
const isEarlyLeave = (checkOutTime) => {
  if (!checkOutTime) return false
  return dayjs(`2024-01-01 ${checkOutTime}`).isBefore(dayjs('2024-01-01 18:00:00'))
}

// 格式化时间
const formatTime = (timeStr) => {
  return timeStr || '-'
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
  message.success('考勤数据导出成功')
}

// 显示手动打卡弹窗
const showCheckInModal = () => {
  checkInModalVisible.value = true
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
const viewStaffDetail = (record) => {
  message.info(`查看员工详情: ${record.name}`)
}

// 编辑考勤记录
const editAttendance = (record) => {
  message.info(`编辑考勤记录: ${record.id}`)
}

// 查看详情
const viewDetail = (record) => {
  message.info(`查看考勤详情: ${record.id}`)
}

// 修正记录
const correctRecord = (record) => {
  record.status = '正常'
  message.success(`考勤记录 ${record.id} 已修正`)
}

// 审批记录
const approveRecord = (record) => {
  message.success(`考勤记录 ${record.id} 审批通过`)
}

// 添加备注
const addRemark = (record) => {
  message.info(`为考勤记录 ${record.id} 添加备注`)
}

// 导出记录
const exportRecord = (record) => {
  message.success(`考勤记录 ${record.id} 导出成功`)
}

// 批量审批
const handleBatchApprove = () => {
  message.success(`批量审批 ${selectedRowKeys.value.length} 条记录`)
  selectedRowKeys.value = []
}

// 批量导出
const handleBatchExport = () => {
  message.success(`批量导出 ${selectedRowKeys.value.length} 条记录`)
  selectedRowKeys.value = []
}

// 批量修正
const handleBatchCorrect = () => {
  selectedRowKeys.value.forEach(key => {
    const record = attendanceRecords.value.find(item => item.key === key)
    if (record) record.status = '正常'
  })
  message.success(`批量修正 ${selectedRowKeys.value.length} 条记录`)
  selectedRowKeys.value = []
}

// 批量生成报告
const handleBatchReport = () => {
  message.success(`生成 ${selectedRowKeys.value.length} 条记录的考勤报告`)
  selectedRowKeys.value = []
}

// 手动打卡确认
const handleCheckInOk = () => {
  checkInFormRef.value.validate().then(() => {
    const newRecord = {
      id: `ATT${String(attendanceRecords.value.length + 1).padStart(3, '0')}`,
      employeeId: checkInFormData.value.employeeId,
      name: staffList.value.find(s => s.id === checkInFormData.value.employeeId)?.name,
      department: staffList.value.find(s => s.id === checkInFormData.value.employeeId)?.department,
      date: dayjs().format('YYYY-MM-DD'),
      checkInTime: checkInFormData.value.type === 'in' ? checkInFormData.value.time.format('HH:mm:ss') : null,
      checkOutTime: checkInFormData.value.type === 'out' ? checkInFormData.value.time.format('HH:mm:ss') : null,
      workHours: 0,
      status: '正常',
      remark: checkInFormData.value.remark,
      key: `ATT${String(attendanceRecords.value.length + 1).padStart(3, '0')}`
    }

    attendanceRecords.value.unshift(newRecord)
    message.success('手动打卡成功')
    checkInModalVisible.value = false
    resetCheckInForm()
  }).catch(() => {
    message.error('请检查表单信息')
  })
}

// 手动打卡取消
const handleCheckInCancel = () => {
  checkInModalVisible.value = false
  resetCheckInForm()
}

// 重置打卡表单
const resetCheckInForm = () => {
  checkInFormData.value = {
    employeeId: '',
    type: 'in',
    time: null,
    remark: ''
  }
}

onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.attendance-management {
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

.attendance-table-card {
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

.text-danger {
  color: #ff4d4f;
}

.text-warning {
  color: #faad14;
}

// 响应式设计
@media (max-width: 768px) {
  .attendance-management {
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
