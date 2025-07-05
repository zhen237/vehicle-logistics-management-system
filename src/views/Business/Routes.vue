 <template>
  <div class="routes-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <EnvironmentOutlined />
        路线管理
      </h1>
      <p>管理运输路线，优化配送效率，降低运营成本</p>
    </div>

    <!-- 操作工具栏 -->
    <a-card class="toolbar-card">
      <a-row :gutter="[16, 16]" align="middle">
        <a-col :xs="24" :sm="12" :md="8">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索路线名称、起点、终点"
            @search="handleSearch"
            style="width: 100%"
          />
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-space>
            <a-select v-model:value="filterStatus" placeholder="路线状态" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部状态</a-select-option>
              <a-select-option value="active">启用中</a-select-option>
              <a-select-option value="inactive">已停用</a-select-option>
              <a-select-option value="maintenance">维护中</a-select-option>
            </a-select>

            <a-select v-model:value="filterDifficulty" placeholder="难度等级" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部难度</a-select-option>
              <a-select-option value="简单">简单</a-select-option>
              <a-select-option value="中等">中等</a-select-option>
              <a-select-option value="困难">困难</a-select-option>
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
              新增路线
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 路线统计卡片 -->
    <a-row :gutter="[16, 16]" class="stats-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="总路线数"
            :value="routeStats.total"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <EnvironmentOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="启用路线"
            :value="routeStats.active"
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
            title="平均距离"
            :value="routeStats.avgDistance"
            suffix="公里"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <RoadOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="本月使用"
            :value="routeStats.monthlyUsage"
            suffix="次"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #prefix>
              <CarOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 路线列表 -->
    <a-card title="路线列表" class="routes-table-card">
      <template #extra>
        <a-space>
          <a-button size="small" @click="handleBatchOptimize" :disabled="selectedRowKeys.length === 0">
            <ThunderboltOutlined />
            批量优化
          </a-button>
          <a-dropdown>
            <a-button size="small">
              更多操作
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="handleBatchEnable">批量启用</a-menu-item>
                <a-menu-item key="2" @click="handleBatchDisable">批量停用</a-menu-item>
                <a-menu-item key="3" @click="handleBatchDelete">批量删除</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-space>
      </template>

      <a-table
        :columns="routeColumns"
        :data-source="filteredRoutes"
        :pagination="pagination"
        :loading="loading"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
        size="small"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a @click="viewRouteDetail(record)">{{ record.name }}</a>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'difficulty'">
            <a-tag :color="getDifficultyColor(record.difficulty)">
              {{ record.difficulty }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'trafficLevel'">
            <a-progress
              :percent="getTrafficPercent(record.trafficLevel)"
              :status="getTrafficStatus(record.trafficLevel)"
              size="small"
            />
            <span class="ml-1">{{ record.trafficLevel }}</span>
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a @click="editRoute(record)">编辑</a>
              <a @click="optimizeRoute(record)">优化</a>
              <a @click="viewMap(record)">地图</a>
              <a-dropdown>
                <a>
                  更多
                  <DownOutlined />
                </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="copyRoute(record)">复制路线</a-menu-item>
                    <a-menu-item key="2" @click="shareRoute(record)">分享路线</a-menu-item>
                    <a-menu-item key="3" @click="exportRoute(record)">导出路线</a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="4" @click="deleteRoute(record)" style="color: #ff4d4f">删除路线</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑路线弹窗 -->
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
            <a-form-item label="路线名称" name="name">
              <a-input v-model:value="formData.name" placeholder="请输入路线名称" />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item label="路线编码" name="code">
              <a-input v-model:value="formData.code" placeholder="自动生成或手动输入" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="起点" name="origin">
              <a-input v-model:value="formData.origin" placeholder="请输入起点" />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item label="终点" name="destination">
              <a-input v-model:value="formData.destination" placeholder="请输入终点" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="距离(公里)" name="distance">
              <a-input-number v-model:value="formData.distance" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>

          <a-col :span="8">
            <a-form-item label="预计时间(小时)" name="estimatedTime">
              <a-input-number v-model:value="formData.estimatedTime" :min="0" :step="0.5" style="width: 100%" />
            </a-form-item>
          </a-col>

          <a-col :span="8">
            <a-form-item label="过路费(元)" name="tollFee">
              <a-input-number v-model:value="formData.tollFee" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="难度等级" name="difficulty">
              <a-select v-model:value="formData.difficulty" placeholder="请选择难度等级">
                <a-select-option value="简单">简单</a-select-option>
                <a-select-option value="中等">中等</a-select-option>
                <a-select-option value="困难">困难</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="8">
            <a-form-item label="交通状况" name="trafficLevel">
              <a-select v-model:value="formData.trafficLevel" placeholder="请选择交通状况">
                <a-select-option value="畅通">畅通</a-select-option>
                <a-select-option value="中等">中等</a-select-option>
                <a-select-option value="繁忙">繁忙</a-select-option>
                <a-select-option value="拥堵">拥堵</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="8">
            <a-form-item label="路况" name="roadCondition">
              <a-select v-model:value="formData.roadCondition" placeholder="请选择路况">
                <a-select-option value="优秀">优秀</a-select-option>
                <a-select-option value="良好">良好</a-select-option>
                <a-select-option value="一般">一般</a-select-option>
                <a-select-option value="较差">较差</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="途经点" name="waypoints">
          <a-select
            v-model:value="formData.waypoints"
            mode="tags"
            placeholder="请输入途经点，按回车添加"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="限制条件" name="restrictions">
          <a-textarea v-model:value="formData.restrictions" placeholder="请输入限制条件" :rows="3" />
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
import {
  EnvironmentOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  RoadOutlined,
  CarOutlined,
  ThunderboltOutlined,
  DownOutlined
} from '@ant-design/icons-vue'
import { routeData } from '@/data/mockData.js'

// 搜索和筛选
const searchKeyword = ref('')
const filterStatus = ref('')
const filterDifficulty = ref('')
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

// 路线数据 - 先添加状态字段
const routes = ref(routeData.map((route, index) => ({
  ...route,
  key: route.id,
  status: index % 3 === 0 ? 'active' : index % 3 === 1 ? 'inactive' : 'maintenance'
})))

// 路线统计
const routeStats = ref({
  total: routes.value.length,
  active: routes.value.filter(route => route.status === 'active').length,
  avgDistance: Math.round(routeData.reduce((sum, route) => sum + route.distance, 0) / routeData.length),
  monthlyUsage: 1250
})

// 表格列配置
const routeColumns = [
  { title: '路线名称', dataIndex: 'name', key: 'name', width: 150 },
  { title: '起点', dataIndex: 'origin', key: 'origin', width: 120 },
  { title: '终点', dataIndex: 'destination', key: 'destination', width: 120 },
  { title: '距离(km)', dataIndex: 'distance', key: 'distance', width: 100 },
  { title: '预计时间(h)', dataIndex: 'estimatedTime', key: 'estimatedTime', width: 120 },
  { title: '过路费(¥)', dataIndex: 'tollFee', key: 'tollFee', width: 100 },
  { title: '难度', dataIndex: 'difficulty', key: 'difficulty', width: 80 },
  { title: '交通状况', dataIndex: 'trafficLevel', key: 'trafficLevel', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'actions', width: 200, fixed: 'right' }
]

// 过滤后的路线数据
const filteredRoutes = computed(() => {
  let result = routes.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(route =>
      route.name.toLowerCase().includes(keyword) ||
      route.origin.toLowerCase().includes(keyword) ||
      route.destination.toLowerCase().includes(keyword)
    )
  }

  // 状态过滤
  if (filterStatus.value) {
    result = result.filter(route => route.status === filterStatus.value)
  }

  // 难度过滤
  if (filterDifficulty.value) {
    result = result.filter(route => route.difficulty === filterDifficulty.value)
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
  code: '',
  origin: '',
  destination: '',
  distance: null,
  estimatedTime: null,
  tollFee: null,
  difficulty: '',
  trafficLevel: '',
  roadCondition: '',
  waypoints: [],
  restrictions: '',
  notes: ''
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入路线名称', trigger: 'blur' }],
  origin: [{ required: true, message: '请输入起点', trigger: 'blur' }],
  destination: [{ required: true, message: '请输入终点', trigger: 'blur' }],
  distance: [{ required: true, message: '请输入距离', trigger: 'blur' }],
  estimatedTime: [{ required: true, message: '请输入预计时间', trigger: 'blur' }],
  difficulty: [{ required: true, message: '请选择难度等级', trigger: 'change' }],
  trafficLevel: [{ required: true, message: '请选择交通状况', trigger: 'change' }],
  roadCondition: [{ required: true, message: '请选择路况', trigger: 'change' }]
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    active: 'green',
    inactive: 'red',
    maintenance: 'orange'
  }
  return colorMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    active: '启用中',
    inactive: '已停用',
    maintenance: '维护中'
  }
  return textMap[status] || status
}

// 获取难度颜色
const getDifficultyColor = (difficulty) => {
  const colorMap = {
    '简单': 'green',
    '中等': 'orange',
    '困难': 'red'
  }
  return colorMap[difficulty] || 'default'
}

// 获取交通状况颜色
const getTrafficColor = (traffic) => {
  const colorMap = {
    '畅通': 'green',
    '中等': 'blue',
    '繁忙': 'orange',
    '拥堵': 'red'
  }
  return colorMap[traffic] || 'default'
}

// 获取交通状况百分比
const getTrafficPercent = (trafficLevel) => {
  const percentMap = {
    '畅通': 25,
    '中等': 50,
    '繁忙': 75,
    '拥堵': 100
  }
  return percentMap[trafficLevel] || 0
}

// 获取交通状况状态
const getTrafficStatus = (trafficLevel) => {
  const statusMap = {
    '畅通': 'success',
    '中等': 'normal',
    '繁忙': 'active',
    '拥堵': 'exception'
  }
  return statusMap[trafficLevel] || 'normal'
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
  message.success('路线数据导出成功')
}

// 显示新增弹窗
const showAddModal = () => {
  modalTitle.value = '新增路线'
  isEdit.value = false
  editingId.value = null
  resetForm()
  modalVisible.value = true
}

// 重置表单
const resetForm = () => {
  formData.value = {
    name: '',
    code: '',
    origin: '',
    destination: '',
    distance: null,
    estimatedTime: null,
    tollFee: null,
    difficulty: '',
    trafficLevel: '',
    roadCondition: '',
    waypoints: [],
    restrictions: '',
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

// 查看路线详情
const viewRouteDetail = (record) => {
  message.info(`查看路线详情: ${record.name}`)
}

// 编辑路线
const editRoute = (record) => {
  modalTitle.value = '编辑路线'
  isEdit.value = true
  editingId.value = record.id
  formData.value = { ...record }
  modalVisible.value = true
}

// 优化路线
const optimizeRoute = (record) => {
  message.loading('正在优化路线...', 2)
  setTimeout(() => {
    message.success(`路线 ${record.name} 优化完成`)
  }, 2000)
}

// 查看地图
const viewMap = (record) => {
  message.info(`打开地图查看路线: ${record.name}`)
}

// 复制路线
const copyRoute = (record) => {
  message.success(`路线 ${record.name} 已复制`)
}

// 分享路线
const shareRoute = (record) => {
  message.success(`路线 ${record.name} 分享链接已生成`)
}

// 导出路线
const exportRoute = (record) => {
  message.success(`路线 ${record.name} 导出成功`)
}

// 删除路线
const deleteRoute = (record) => {
  const index = routes.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    routes.value.splice(index, 1)
    message.success('路线删除成功')
  }
}

// 批量优化
const handleBatchOptimize = () => {
  message.loading(`正在优化 ${selectedRowKeys.value.length} 条路线...`, 3)
  setTimeout(() => {
    message.success('批量优化完成')
    selectedRowKeys.value = []
  }, 3000)
}

// 批量启用
const handleBatchEnable = () => {
  selectedRowKeys.value.forEach(key => {
    const route = routes.value.find(item => item.key === key)
    if (route) route.status = 'active'
  })
  message.success(`已启用 ${selectedRowKeys.value.length} 条路线`)
  selectedRowKeys.value = []
}

// 批量停用
const handleBatchDisable = () => {
  selectedRowKeys.value.forEach(key => {
    const route = routes.value.find(item => item.key === key)
    if (route) route.status = 'inactive'
  })
  message.success(`已停用 ${selectedRowKeys.value.length} 条路线`)
  selectedRowKeys.value = []
}

// 批量删除
const handleBatchDelete = () => {
  routes.value = routes.value.filter(item => !selectedRowKeys.value.includes(item.key))
  message.success(`已删除 ${selectedRowKeys.value.length} 条路线`)
  selectedRowKeys.value = []
}

// 弹窗确认
const handleModalOk = () => {
  formRef.value.validate().then(() => {
    if (isEdit.value) {
      // 编辑逻辑
      const index = routes.value.findIndex(item => item.id === editingId.value)
      if (index > -1) {
        routes.value[index] = { ...routes.value[index], ...formData.value }
        message.success('路线更新成功')
      }
    } else {
      // 新增逻辑
      const newRoute = {
        ...formData.value,
        id: `R${String(routes.value.length + 1).padStart(3, '0')}`,
        key: `R${String(routes.value.length + 1).padStart(3, '0')}`,
        status: 'active'
      }
      routes.value.unshift(newRoute)
      message.success('路线添加成功')
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
.routes-management {
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

.routes-table-card {
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

.ml-1 {
  margin-left: 4px;
}

// 响应式设计
@media (max-width: 768px) {
  .routes-management {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 20px;
  }
}
</style>
