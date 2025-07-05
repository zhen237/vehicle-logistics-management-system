<template>
  <div class="driver-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <CarOutlined />
        司机管理
      </h1>
      <p>管理司机信息、驾驶证、违章记录，确保运输安全合规</p>
    </div>

    <!-- 操作工具栏 -->
    <a-card class="toolbar-card">
      <a-row :gutter="[16, 16]" align="middle">
        <a-col :xs="24" :sm="12" :md="8">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索司机姓名、工号、车牌号"
            @search="handleSearch"
            style="width: 100%"
          />
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-space>
            <a-select v-model:value="filterStatus" placeholder="司机状态" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部状态</a-select-option>
              <a-select-option value="在岗">在岗</a-select-option>
              <a-select-option value="休假">休假</a-select-option>
              <a-select-option value="停岗">停岗</a-select-option>
              <a-select-option value="离职">离职</a-select-option>
            </a-select>

            <a-select v-model:value="filterLicenseType" placeholder="驾照类型" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部类型</a-select-option>
              <a-select-option value="A1">A1</a-select-option>
              <a-select-option value="A2">A2</a-select-option>
              <a-select-option value="B1">B1</a-select-option>
              <a-select-option value="B2">B2</a-select-option>
              <a-select-option value="C1">C1</a-select-option>
            </a-select>

            <a-select v-model:value="filterVehicle" placeholder="分配车辆" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部车辆</a-select-option>
              <a-select-option value="已分配">已分配</a-select-option>
              <a-select-option value="未分配">未分配</a-select-option>
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
              新增司机
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 司机统计卡片 -->
    <a-row :gutter="[16, 16]" class="stats-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="总司机数"
            :value="driverStats.total"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <CarOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="在岗司机"
            :value="driverStats.active"
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
            title="违章待处理"
            :value="driverStats.violations"
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
            title="证件即将到期"
            :value="driverStats.expiring"
            :value-style="{ color: '#ff4d4f' }"
          >
            <template #prefix>
              <ClockCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 证件到期提醒 -->
    <a-card title="证件到期提醒" class="reminder-card" v-if="expiringLicenses.length > 0">
      <template #extra>
        <a-button size="small" @click="handleAllReminders">
          处理全部
        </a-button>
      </template>

      <a-list
        :data-source="expiringLicenses"
        size="small"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #avatar>
                <a-avatar :style="{ backgroundColor: item.daysLeft <= 30 ? '#ff4d4f' : '#faad14' }">
                  <IdcardOutlined />
                </a-avatar>
              </template>
              <template #title>
                <span>{{ item.driverName }} - {{ item.licenseType }}驾驶证</span>
                <a-tag :color="item.daysLeft <= 30 ? 'red' : 'orange'" class="ml-2">
                  {{ item.daysLeft <= 0 ? '已过期' : `${item.daysLeft}天后到期` }}
                </a-tag>
              </template>
              <template #description>
                驾驶证号：{{ item.licenseNumber }} | 到期日期：{{ formatDate(item.expiryDate) }}
              </template>
            </a-list-item-meta>
            <template #actions>
              <a @click="renewLicense(item)">续期</a>
              <a @click="viewLicense(item)">查看</a>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </a-card>

    <!-- 司机列表 -->
    <a-card title="司机列表" class="driver-table-card">
      <template #extra>
        <a-space>
          <a-button size="small" @click="handleBatchAssign" :disabled="selectedRowKeys.length === 0">
            <SwapOutlined />
            批量分配车辆
          </a-button>
          <a-dropdown>
            <a-button size="small">
              更多操作
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="handleBatchExport">批量导出</a-menu-item>
                <a-menu-item key="2" @click="handleBatchTraining">批量培训</a-menu-item>
                <a-menu-item key="3" @click="handleBatchCheck">批量体检</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-space>
      </template>

      <a-table
        :columns="driverColumns"
        :data-source="filteredDrivers"
        :pagination="pagination"
        :loading="loading"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
        size="small"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'avatar'">
            <a-avatar :src="record.avatar" :style="{ backgroundColor: getAvatarColor(record.name) }">
              {{ record.name.charAt(0) }}
            </a-avatar>
          </template>

          <template v-else-if="column.key === 'name'">
            <a @click="viewDriverDetail(record)">{{ record.name }}</a>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ record.status }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'licenseType'">
            <a-tag color="blue">{{ record.licenseType }}</a-tag>
          </template>

          <template v-else-if="column.key === 'licenseExpiry'">
            <span :class="{ 'text-warning': isExpiringSoon(record.licenseExpiry), 'text-danger': isExpired(record.licenseExpiry) }">
              {{ formatDate(record.licenseExpiry) }}
            </span>
          </template>

          <template v-else-if="column.key === 'assignedVehicle'">
            <a v-if="record.assignedVehicle" @click="viewVehicleDetail(record.assignedVehicle)">
              {{ record.assignedVehicle }}
            </a>
            <span v-else class="text-muted">未分配</span>
          </template>

          <template v-else-if="column.key === 'drivingYears'">
            {{ record.drivingYears }}年
          </template>

          <template v-else-if="column.key === 'violationCount'">
            <span :class="{ 'text-danger': record.violationCount > 0 }">
              {{ record.violationCount }}
            </span>
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a @click="editDriver(record)">编辑</a>
              <a @click="viewProfile(record)">档案</a>
              <a @click="assignVehicle(record)">分配车辆</a>
              <a-dropdown>
                <a>
                  更多
                  <DownOutlined />
                </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="viewViolations(record)">违章记录</a-menu-item>
                    <a-menu-item key="2" @click="viewTraining(record)">培训记录</a-menu-item>
                    <a-menu-item key="3" @click="scheduleCheck(record)">安排体检</a-menu-item>
                    <a-menu-item key="4" @click="viewPerformance(record)">绩效评估</a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="5" @click="suspendDriver(record)" style="color: #ff4d4f">停岗处理</a-menu-item>
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
  CarOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  IdcardOutlined,
  SwapOutlined,
  DownOutlined
} from '@ant-design/icons-vue'

// 搜索和筛选
const searchKeyword = ref('')
const filterStatus = ref('')
const filterLicenseType = ref('')
const filterVehicle = ref('')
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

// 司机数据
const driverList = ref([
  {
    id: 'DRV001',
    employeeId: 'E001',
    name: '张师傅',
    phone: '13800138001',
    status: '在岗',
    licenseType: 'A2',
    licenseNumber: '110101199001011234',
    licenseExpiry: '2025-03-15',
    assignedVehicle: '京A12345',
    drivingYears: 15,
    violationCount: 0,
    lastCheckDate: '2024-01-15',
    emergencyContact: '李女士',
    emergencyPhone: '13800138002',
    avatar: '',
    key: 'DRV001'
  },
  {
    id: 'DRV002',
    employeeId: 'E006',
    name: '李师傅',
    phone: '13800138003',
    status: '在岗',
    licenseType: 'B2',
    licenseNumber: '110101198501011234',
    licenseExpiry: '2024-08-20',
    assignedVehicle: '沪C11111',
    drivingYears: 12,
    violationCount: 1,
    lastCheckDate: '2024-02-10',
    emergencyContact: '王先生',
    emergencyPhone: '13800138004',
    avatar: '',
    key: 'DRV002'
  },
  {
    id: 'DRV003',
    employeeId: 'E007',
    name: '王师傅',
    phone: '13800138005',
    status: '休假',
    licenseType: 'A1',
    licenseNumber: '110101197801011234',
    licenseExpiry: '2024-12-30',
    assignedVehicle: null,
    drivingYears: 20,
    violationCount: 0,
    lastCheckDate: '2023-12-05',
    emergencyContact: '张女士',
    emergencyPhone: '13800138006',
    avatar: '',
    key: 'DRV003'
  },
  {
    id: 'DRV004',
    employeeId: 'E008',
    name: '赵师傅',
    phone: '13800138007',
    status: '在岗',
    licenseType: 'B1',
    licenseNumber: '110101199201011234',
    licenseExpiry: '2025-06-10',
    assignedVehicle: '粤B88888',
    drivingYears: 8,
    violationCount: 2,
    lastCheckDate: '2024-03-20',
    emergencyContact: '刘先生',
    emergencyPhone: '13800138008',
    avatar: '',
    key: 'DRV004'
  },
  {
    id: 'DRV005',
    employeeId: 'E009',
    name: '钱师傅',
    phone: '13800138009',
    status: '停岗',
    licenseType: 'C1',
    licenseNumber: '110101199501011234',
    licenseExpiry: '2024-07-15',
    assignedVehicle: null,
    drivingYears: 6,
    violationCount: 3,
    lastCheckDate: '2024-01-30',
    emergencyContact: '孙女士',
    emergencyPhone: '13800138010',
    avatar: '',
    key: 'DRV005'
  }
])

// 司机统计
const driverStats = ref({
  total: driverList.value.length,
  active: driverList.value.filter(driver => driver.status === '在岗').length,
  violations: driverList.value.reduce((sum, driver) => sum + driver.violationCount, 0),
  expiring: driverList.value.filter(driver => {
    const daysLeft = dayjs(driver.licenseExpiry).diff(dayjs(), 'day')
    return daysLeft <= 60
  }).length
})

// 即将到期的驾驶证
const expiringLicenses = computed(() => {
  return driverList.value
    .filter(driver => {
      const daysLeft = dayjs(driver.licenseExpiry).diff(dayjs(), 'day')
      return daysLeft <= 60
    })
    .map(driver => ({
      ...driver,
      driverName: driver.name,
      daysLeft: dayjs(driver.licenseExpiry).diff(dayjs(), 'day'),
      expiryDate: driver.licenseExpiry
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
})

// 表格列配置
const driverColumns = [
  { title: '头像', dataIndex: 'avatar', key: 'avatar', width: 80 },
  { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
  { title: '工号', dataIndex: 'employeeId', key: 'employeeId', width: 100 },
  { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 130 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '驾照类型', dataIndex: 'licenseType', key: 'licenseType', width: 100 },
  { title: '驾照到期', dataIndex: 'licenseExpiry', key: 'licenseExpiry', width: 120 },
  { title: '分配车辆', dataIndex: 'assignedVehicle', key: 'assignedVehicle', width: 120 },
  { title: '驾龄', dataIndex: 'drivingYears', key: 'drivingYears', width: 80 },
  { title: '违章次数', dataIndex: 'violationCount', key: 'violationCount', width: 100 },
  { title: '操作', key: 'actions', width: 250, fixed: 'right' }
]

// 过滤后的司机数据
const filteredDrivers = computed(() => {
  let result = driverList.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(driver =>
      driver.name.toLowerCase().includes(keyword) ||
      driver.employeeId.toLowerCase().includes(keyword) ||
      (driver.assignedVehicle && driver.assignedVehicle.toLowerCase().includes(keyword))
    )
  }

  // 状态过滤
  if (filterStatus.value) {
    result = result.filter(driver => driver.status === filterStatus.value)
  }

  // 驾照类型过滤
  if (filterLicenseType.value) {
    result = result.filter(driver => driver.licenseType === filterLicenseType.value)
  }

  // 车辆分配过滤
  if (filterVehicle.value) {
    if (filterVehicle.value === '已分配') {
      result = result.filter(driver => driver.assignedVehicle)
    } else if (filterVehicle.value === '未分配') {
      result = result.filter(driver => !driver.assignedVehicle)
    }
  }

  pagination.value.total = result.length
  return result
})

// 获取头像颜色
const getAvatarColor = (name) => {
  const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#87d068']
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    '在岗': 'green',
    '休假': 'blue',
    '停岗': 'red',
    '离职': 'default'
  }
  return colorMap[status] || 'default'
}

// 判断是否即将到期
const isExpiringSoon = (dateStr) => {
  if (!dateStr) return false
  const days = dayjs(dateStr).diff(dayjs(), 'day')
  return days <= 60 && days > 0
}

// 判断是否已过期
const isExpired = (dateStr) => {
  if (!dateStr) return false
  return dayjs(dateStr).isBefore(dayjs())
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
  message.success('司机数据导出成功')
}

// 显示新增弹窗
const showAddModal = () => {
  message.info('打开新增司机弹窗')
}

// 表格选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 表格变化处理
const handleTableChange = (pag) => {
  pagination.value = { ...pagination.value, ...pag }
}

// 处理全部提醒
const handleAllReminders = () => {
  message.info('处理全部证件到期提醒')
}

// 续期驾驶证
const renewLicense = (item) => {
  message.info(`为司机 ${item.driverName} 办理驾驶证续期`)
}

// 查看驾驶证
const viewLicense = (item) => {
  message.info(`查看司机 ${item.driverName} 的驾驶证信息`)
}

// 查看司机详情
const viewDriverDetail = (record) => {
  message.info(`查看司机详情: ${record.name}`)
}

// 编辑司机
const editDriver = (record) => {
  message.info(`编辑司机信息: ${record.name}`)
}

// 查看档案
const viewProfile = (record) => {
  message.info(`查看司机档案: ${record.name}`)
}

// 分配车辆
const assignVehicle = (record) => {
  message.info(`为司机 ${record.name} 分配车辆`)
}

// 查看违章记录
const viewViolations = (record) => {
  message.info(`查看司机 ${record.name} 的违章记录`)
}

// 查看培训记录
const viewTraining = (record) => {
  message.info(`查看司机 ${record.name} 的培训记录`)
}

// 安排体检
const scheduleCheck = (record) => {
  message.info(`为司机 ${record.name} 安排体检`)
}

// 查看绩效评估
const viewPerformance = (record) => {
  message.info(`查看司机 ${record.name} 的绩效评估`)
}

// 停岗处理
const suspendDriver = (record) => {
  record.status = '停岗'
  record.assignedVehicle = null
  message.success(`司机 ${record.name} 已停岗`)
}

// 查看车辆详情
const viewVehicleDetail = (vehicleNumber) => {
  message.info(`查看车辆详情: ${vehicleNumber}`)
}

// 批量分配车辆
const handleBatchAssign = () => {
  message.info(`批量分配车辆给 ${selectedRowKeys.value.length} 名司机`)
  selectedRowKeys.value = []
}

// 批量导出
const handleBatchExport = () => {
  message.success(`批量导出 ${selectedRowKeys.value.length} 名司机信息`)
  selectedRowKeys.value = []
}

// 批量培训
const handleBatchTraining = () => {
  message.info(`安排 ${selectedRowKeys.value.length} 名司机参加培训`)
  selectedRowKeys.value = []
}

// 批量体检
const handleBatchCheck = () => {
  message.info(`安排 ${selectedRowKeys.value.length} 名司机进行体检`)
  selectedRowKeys.value = []
}

onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.driver-management {
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

.driver-table-card {
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

.text-muted {
  color: #8c8c8c;
}

.ml-2 {
  margin-left: 8px;
}

// 响应式设计
@media (max-width: 768px) {
  .driver-management {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 20px;
  }
}
</style>
