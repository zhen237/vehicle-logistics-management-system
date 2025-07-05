<template>
  <div class="staff-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <TeamOutlined />
        员工管理
      </h1>
      <p>管理员工信息，维护组织架构，提升团队效率</p>
    </div>

    <!-- 操作工具栏 -->
    <a-card class="toolbar-card">
      <a-row :gutter="[16, 16]" align="middle">
        <a-col :xs="24" :sm="12" :md="8">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索员工姓名、工号、部门"
            @search="handleSearch"
            style="width: 100%"
          />
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-space>
            <a-select v-model:value="filterDepartment" placeholder="部门" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部部门</a-select-option>
              <a-select-option value="调度部">调度部</a-select-option>
              <a-select-option value="运输部">运输部</a-select-option>
              <a-select-option value="维修部">维修部</a-select-option>
              <a-select-option value="财务部">财务部</a-select-option>
              <a-select-option value="人事部">人事部</a-select-option>
            </a-select>

            <a-select v-model:value="filterPosition" placeholder="职位" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部职位</a-select-option>
              <a-select-option value="司机">司机</a-select-option>
              <a-select-option value="调度员">调度员</a-select-option>
              <a-select-option value="维修工">维修工</a-select-option>
              <a-select-option value="管理员">管理员</a-select-option>
            </a-select>

            <a-select v-model:value="filterStatus" placeholder="状态" style="width: 100px" @change="handleFilter">
              <a-select-option value="">全部状态</a-select-option>
              <a-select-option value="在职">在职</a-select-option>
              <a-select-option value="离职">离职</a-select-option>
              <a-select-option value="休假">休假</a-select-option>
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
              新增员工
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 员工统计卡片 -->
    <a-row :gutter="[16, 16]" class="stats-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="总员工数"
            :value="staffStats.total"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <TeamOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="在职员工"
            :value="staffStats.active"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="本月新增"
            :value="staffStats.newThisMonth"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <UserAddOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="平均工龄"
            :value="staffStats.avgWorkYears"
            suffix="年"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #prefix>
              <CalendarOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 部门分布图表 -->
    <a-row :gutter="[16, 16]" class="charts-section">
      <a-col :xs="24" :lg="12">
        <a-card title="部门人员分布" class="chart-card">
          <template #extra>
            <a-radio-group v-model:value="chartType" size="small">
              <a-radio-button value="pie">饼图</a-radio-button>
              <a-radio-button value="bar">柱图</a-radio-button>
            </a-radio-group>
          </template>
          <div ref="departmentChart" class="chart-container"></div>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="12">
        <a-card title="年龄结构分析" class="chart-card">
          <template #extra>
            <a-select v-model:value="ageGroupType" size="small" style="width: 100px">
              <a-select-option value="5year">5年</a-select-option>
              <a-select-option value="10year">10年</a-select-option>
            </a-select>
          </template>
          <div ref="ageChart" class="chart-container"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 员工列表 -->
    <a-card title="员工列表" class="staff-table-card">
      <template #extra>
        <a-space>
          <a-button size="small" @click="handleBatchTransfer" :disabled="selectedRowKeys.length === 0">
            <SwapOutlined />
            批量调岗
          </a-button>
          <a-dropdown>
            <a-button size="small">
              更多操作
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="handleBatchExport">批量导出</a-menu-item>
                <a-menu-item key="2" @click="handleBatchSalary">批量调薪</a-menu-item>
                <a-menu-item key="3" @click="handleBatchLeave">批量请假</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-space>
      </template>

      <a-table
        :columns="staffColumns"
        :data-source="filteredStaff"
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
            <a @click="viewStaffDetail(record)">{{ record.name }}</a>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ record.status }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'workYears'">
            {{ record.workYears }}年
          </template>

          <template v-else-if="column.key === 'salary'">
            ¥{{ record.salary.toLocaleString() }}
          </template>

          <template v-else-if="column.key === 'hireDate'">
            {{ formatDate(record.hireDate) }}
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a @click="editStaff(record)">编辑</a>
              <a @click="viewProfile(record)">档案</a>
              <a @click="contactStaff(record)">联系</a>
              <a-dropdown>
                <a>
                  更多
                  <DownOutlined />
                </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="transferStaff(record)">调岗</a-menu-item>
                    <a-menu-item key="2" @click="adjustSalary(record)">调薪</a-menu-item>
                    <a-menu-item key="3" @click="grantLeave(record)">请假</a-menu-item>
                    <a-menu-item key="4" @click="viewAttendance(record)">考勤</a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="5" @click="resignStaff(record)" style="color: #ff4d4f">离职</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑员工弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      width="800px"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="姓名" name="name">
              <a-input v-model:value="formData.name" placeholder="请输入员工姓名" />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item label="工号" name="employeeId">
              <a-input v-model:value="formData.employeeId" placeholder="请输入工号" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="性别" name="gender">
              <a-select v-model:value="formData.gender" placeholder="请选择性别">
                <a-select-option value="男">男</a-select-option>
                <a-select-option value="女">女</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="8">
            <a-form-item label="年龄" name="age">
              <a-input-number v-model:value="formData.age" :min="18" :max="65" style="width: 100%" />
            </a-form-item>
          </a-col>

          <a-col :span="8">
            <a-form-item label="联系电话" name="phone">
              <a-input v-model:value="formData.phone" placeholder="请输入联系电话" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="部门" name="department">
              <a-select v-model:value="formData.department" placeholder="请选择部门">
                <a-select-option value="调度部">调度部</a-select-option>
                <a-select-option value="运输部">运输部</a-select-option>
                <a-select-option value="维修部">维修部</a-select-option>
                <a-select-option value="财务部">财务部</a-select-option>
                <a-select-option value="人事部">人事部</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="8">
            <a-form-item label="职位" name="position">
              <a-select v-model:value="formData.position" placeholder="请选择职位">
                <a-select-option value="司机">司机</a-select-option>
                <a-select-option value="调度员">调度员</a-select-option>
                <a-select-option value="维修工">维修工</a-select-option>
                <a-select-option value="管理员">管理员</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="8">
            <a-form-item label="入职日期" name="hireDate">
              <a-date-picker v-model:value="formData.hireDate" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="基本工资" name="salary">
              <a-input-number v-model:value="formData.salary" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item label="员工状态" name="status">
              <a-select v-model:value="formData.status" placeholder="请选择状态">
                <a-select-option value="在职">在职</a-select-option>
                <a-select-option value="休假">休假</a-select-option>
                <a-select-option value="离职">离职</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="家庭地址" name="address">
          <a-textarea v-model:value="formData.address" placeholder="请输入家庭地址" :rows="2" />
        </a-form-item>

        <a-form-item label="备注" name="notes">
          <a-textarea v-model:value="formData.notes" placeholder="请输入备注信息" :rows="3" />
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
  TeamOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PlusOutlined,
  UserOutlined,
  UserAddOutlined,
  CalendarOutlined,
  SwapOutlined,
  DownOutlined
} from '@ant-design/icons-vue'

// 搜索和筛选
const searchKeyword = ref('')
const filterDepartment = ref('')
const filterPosition = ref('')
const filterStatus = ref('')
const loading = ref(false)

// 图表控制
const chartType = ref('pie')
const ageGroupType = ref('5year')

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

// 员工数据
const staffList = ref([
  {
    id: 'EMP001',
    employeeId: 'E001',
    name: '张师傅',
    gender: '男',
    age: 35,
    phone: '13800138001',
    department: '运输部',
    position: '司机',
    status: '在职',
    salary: 8000,
    workYears: 5,
    hireDate: '2019-03-15',
    address: '北京市朝阳区',
    notes: '驾驶技术娴熟，工作认真负责',
    avatar: '',
    key: 'EMP001'
  },
  {
    id: 'EMP002',
    employeeId: 'E002',
    name: '李调度',
    gender: '女',
    age: 28,
    phone: '13800138002',
    department: '调度部',
    position: '调度员',
    status: '在职',
    salary: 7500,
    workYears: 3,
    hireDate: '2021-06-01',
    address: '北京市海淀区',
    notes: '调度经验丰富，沟通能力强',
    avatar: '',
    key: 'EMP002'
  },
  {
    id: 'EMP003',
    employeeId: 'E003',
    name: '王维修',
    gender: '男',
    age: 42,
    phone: '13800138003',
    department: '维修部',
    position: '维修工',
    status: '在职',
    salary: 6500,
    workYears: 8,
    hireDate: '2016-09-20',
    address: '北京市丰台区',
    notes: '维修技术精湛，经验丰富',
    avatar: '',
    key: 'EMP003'
  },
  {
    id: 'EMP004',
    employeeId: 'E004',
    name: '赵财务',
    gender: '女',
    age: 30,
    phone: '13800138004',
    department: '财务部',
    position: '会计',
    status: '在职',
    salary: 7000,
    workYears: 4,
    hireDate: '2020-01-10',
    address: '北京市西城区',
    notes: '财务工作细致，责任心强',
    avatar: '',
    key: 'EMP004'
  },
  {
    id: 'EMP005',
    employeeId: 'E005',
    name: '钱人事',
    gender: '女',
    age: 26,
    phone: '13800138005',
    department: '人事部',
    position: '人事专员',
    status: '休假',
    salary: 6000,
    workYears: 2,
    hireDate: '2022-04-15',
    address: '北京市东城区',
    notes: '人事工作认真，服务态度好',
    avatar: '',
    key: 'EMP005'
  }
])

// 员工统计
const staffStats = ref({
  total: staffList.value.length,
  active: staffList.value.filter(staff => staff.status === '在职').length,
  newThisMonth: 2,
  avgWorkYears: Math.round(staffList.value.reduce((sum, staff) => sum + staff.workYears, 0) / staffList.value.length)
})

// 表格列配置
const staffColumns = [
  { title: '头像', dataIndex: 'avatar', key: 'avatar', width: 80 },
  { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
  { title: '工号', dataIndex: 'employeeId', key: 'employeeId', width: 100 },
  { title: '性别', dataIndex: 'gender', key: 'gender', width: 80 },
  { title: '年龄', dataIndex: 'age', key: 'age', width: 80 },
  { title: '部门', dataIndex: 'department', key: 'department', width: 100 },
  { title: '职位', dataIndex: 'position', key: 'position', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '工龄', dataIndex: 'workYears', key: 'workYears', width: 80 },
  { title: '工资', dataIndex: 'salary', key: 'salary', width: 100 },
  { title: '入职日期', dataIndex: 'hireDate', key: 'hireDate', width: 120 },
  { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 130 },
  { title: '操作', key: 'actions', width: 200, fixed: 'right' }
]

// 过滤后的员工数据
const filteredStaff = computed(() => {
  let result = staffList.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(staff =>
      staff.name.toLowerCase().includes(keyword) ||
      staff.employeeId.toLowerCase().includes(keyword) ||
      staff.department.toLowerCase().includes(keyword)
    )
  }

  // 部门过滤
  if (filterDepartment.value) {
    result = result.filter(staff => staff.department === filterDepartment.value)
  }

  // 职位过滤
  if (filterPosition.value) {
    result = result.filter(staff => staff.position === filterPosition.value)
  }

  // 状态过滤
  if (filterStatus.value) {
    result = result.filter(staff => staff.status === filterStatus.value)
  }

  pagination.value.total = result.length
  return result
})

// 弹窗相关
const modalVisible = ref(false)
const modalTitle = ref('')
const formRef = ref()
const isEdit = ref(false)
const editingId = ref(null)

// 表单数据
const formData = ref({
  name: '',
  employeeId: '',
  gender: '',
  age: null,
  phone: '',
  department: '',
  position: '',
  status: '在职',
  salary: null,
  hireDate: null,
  address: '',
  notes: ''
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入员工姓名', trigger: 'blur' }],
  employeeId: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  position: [{ required: true, message: '请选择职位', trigger: 'change' }],
  salary: [{ required: true, message: '请输入基本工资', trigger: 'blur' }],
  hireDate: [{ required: true, message: '请选择入职日期', trigger: 'change' }]
}

// 获取头像颜色
const getAvatarColor = (name) => {
  const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#87d068']
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    '在职': 'green',
    '离职': 'red',
    '休假': 'orange'
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
  message.success('员工数据导出成功')
}

// 显示新增弹窗
const showAddModal = () => {
  modalTitle.value = '新增员工'
  isEdit.value = false
  editingId.value = null
  resetForm()
  modalVisible.value = true
}

// 重置表单
const resetForm = () => {
  formData.value = {
    name: '',
    employeeId: '',
    gender: '',
    age: null,
    phone: '',
    department: '',
    position: '',
    status: '在职',
    salary: null,
    hireDate: null,
    address: '',
    notes: ''
  }
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

// 编辑员工
const editStaff = (record) => {
  modalTitle.value = '编辑员工'
  isEdit.value = true
  editingId.value = record.id
  formData.value = { ...record, hireDate: dayjs(record.hireDate) }
  modalVisible.value = true
}

// 查看档案
const viewProfile = (record) => {
  message.info(`查看员工档案: ${record.name}`)
}

// 联系员工
const contactStaff = (record) => {
  message.info(`拨打电话: ${record.phone}`)
}

// 调岗
const transferStaff = (record) => {
  message.info(`为员工 ${record.name} 办理调岗`)
}

// 调薪
const adjustSalary = (record) => {
  message.info(`为员工 ${record.name} 调整薪资`)
}

// 请假
const grantLeave = (record) => {
  message.info(`为员工 ${record.name} 办理请假`)
}

// 查看考勤
const viewAttendance = (record) => {
  message.info(`查看员工 ${record.name} 的考勤记录`)
}

// 离职
const resignStaff = (record) => {
  record.status = '离职'
  message.success(`员工 ${record.name} 离职手续已办理`)
}

// 批量调岗
const handleBatchTransfer = () => {
  message.info(`批量调岗 ${selectedRowKeys.value.length} 名员工`)
  selectedRowKeys.value = []
}

// 批量导出
const handleBatchExport = () => {
  message.success(`批量导出 ${selectedRowKeys.value.length} 名员工信息`)
  selectedRowKeys.value = []
}

// 批量调薪
const handleBatchSalary = () => {
  message.info(`批量调薪 ${selectedRowKeys.value.length} 名员工`)
  selectedRowKeys.value = []
}

// 批量请假
const handleBatchLeave = () => {
  message.info(`批量请假 ${selectedRowKeys.value.length} 名员工`)
  selectedRowKeys.value = []
}

// 弹窗确认
const handleModalOk = () => {
  formRef.value.validate().then(() => {
    if (isEdit.value) {
      // 编辑逻辑
      const index = staffList.value.findIndex(item => item.id === editingId.value)
      if (index > -1) {
        staffList.value[index] = {
          ...staffList.value[index],
          ...formData.value,
          hireDate: formData.value.hireDate.format('YYYY-MM-DD')
        }
        message.success('员工信息更新成功')
      }
    } else {
      // 新增逻辑
      const newStaff = {
        ...formData.value,
        id: `EMP${String(staffList.value.length + 1).padStart(3, '0')}`,
        key: `EMP${String(staffList.value.length + 1).padStart(3, '0')}`,
        workYears: dayjs().diff(dayjs(formData.value.hireDate), 'year'),
        hireDate: formData.value.hireDate.format('YYYY-MM-DD'),
        avatar: ''
      }
      staffList.value.unshift(newStaff)
      message.success('员工添加成功')
    }
    modalVisible.value = false
    resetForm()
  }).catch(() => {
    message.error('请检查表单信息')
  })
}

// 弹窗取消
const handleModalCancel = () => {
  modalVisible.value = false
  resetForm()
}

onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.staff-management {
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

.staff-table-card {
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

// 响应式设计
@media (max-width: 768px) {
  .staff-management {
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
