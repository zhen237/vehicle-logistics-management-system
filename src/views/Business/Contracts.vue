<template>
  <div class="contracts-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <FileProtectOutlined />
        合同管理
      </h1>
      <p>管理运输合同，跟踪合同执行，确保业务合规</p>
    </div>

    <!-- 操作工具栏 -->
    <a-card class="toolbar-card">
      <a-row :gutter="[16, 16]" align="middle">
        <a-col :xs="24" :sm="12" :md="8">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索合同编号、客户名称"
            @search="handleSearch"
            style="width: 100%"
          />
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-space>
            <a-select v-model:value="filterStatus" placeholder="合同状态" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部状态</a-select-option>
              <a-select-option value="draft">草稿</a-select-option>
              <a-select-option value="pending">待签署</a-select-option>
              <a-select-option value="active">执行中</a-select-option>
              <a-select-option value="completed">已完成</a-select-option>
              <a-select-option value="terminated">已终止</a-select-option>
            </a-select>

            <a-select v-model:value="filterType" placeholder="合同类型" style="width: 120px" @change="handleFilter">
              <a-select-option value="">全部类型</a-select-option>
              <a-select-option value="transport">运输合同</a-select-option>
              <a-select-option value="service">服务合同</a-select-option>
              <a-select-option value="lease">租赁合同</a-select-option>
              <a-select-option value="maintenance">维修合同</a-select-option>
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
              新建合同
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 合同统计卡片 -->
    <a-row :gutter="[16, 16]" class="stats-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="总合同数"
            :value="contractStats.total"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <FileProtectOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="执行中"
            :value="contractStats.active"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <PlayCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="待签署"
            :value="contractStats.pending"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #prefix>
              <EditOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="合同总额"
            :value="contractStats.totalAmount"
            :value-style="{ color: '#722ed1' }"
            :formatter="(value) => `¥${(value / 10000).toFixed(0)}万`"
          >
            <template #prefix>
              <DollarOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 合同列表 -->
    <a-card title="合同列表" class="contracts-table-card">
      <template #extra>
        <a-space>
          <a-button size="small" @click="handleBatchSign" :disabled="selectedRowKeys.length === 0">
            <EditOutlined />
            批量签署
          </a-button>
          <a-dropdown>
            <a-button size="small">
              更多操作
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="handleBatchExport">批量导出</a-menu-item>
                <a-menu-item key="2" @click="handleBatchArchive">批量归档</a-menu-item>
                <a-menu-item key="3" @click="handleBatchDelete">批量删除</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-space>
      </template>

      <a-table
        :columns="contractColumns"
        :data-source="filteredContracts"
        :pagination="pagination"
        :loading="loading"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
        size="small"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'contractNo'">
            <a @click="viewContractDetail(record)">{{ record.contractNo }}</a>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'amount'">
            ¥{{ record.amount.toLocaleString() }}
          </template>

          <template v-else-if="column.key === 'progress'">
            <a-progress
              :percent="record.progress"
              size="small"
              :status="getProgressStatus(record.progress)"
            />
          </template>

          <template v-else-if="column.key === 'signDate'">
            {{ formatDate(record.signDate) }}
          </template>

          <template v-else-if="column.key === 'endDate'">
            {{ formatDate(record.endDate) }}
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a @click="editContract(record)">编辑</a>
              <a @click="signContract(record)" v-if="record.status === 'pending'">签署</a>
              <a @click="viewContract(record)">查看</a>
              <a-dropdown>
                <a>
                  更多
                  <DownOutlined />
                </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="downloadContract(record)">下载合同</a-menu-item>
                    <a-menu-item key="2" @click="copyContract(record)">复制合同</a-menu-item>
                    <a-menu-item key="3" @click="archiveContract(record)">归档合同</a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="4" @click="terminateContract(record)" style="color: #ff4d4f">终止合同</a-menu-item>
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
import { ref, computed, h, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  FileProtectOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  EditOutlined,
  DollarOutlined,
  DownOutlined
} from '@ant-design/icons-vue'
import { customerData } from '@/data/mockData.js'

// 搜索和筛选
const searchKeyword = ref('')
const filterStatus = ref('')
const filterType = ref('')
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

// 合同数据 - 基于客户数据生成
const contracts = ref([
  {
    id: 'CT001',
    contractNo: 'HT2024001',
    customerName: '北京华联超市',
    type: 'transport',
    status: 'active',
    amount: 850000,
    signDate: '2024-01-15',
    startDate: '2024-02-01',
    endDate: '2024-12-31',
    progress: 65,
    key: 'CT001'
  },
  {
    id: 'CT002',
    contractNo: 'HT2024002',
    customerName: '上海物流集团',
    type: 'service',
    status: 'pending',
    amount: 1200000,
    signDate: '',
    startDate: '2024-07-01',
    endDate: '2025-06-30',
    progress: 0,
    key: 'CT002'
  },
  {
    id: 'CT003',
    contractNo: 'HT2024003',
    customerName: '深圳科技园区',
    type: 'transport',
    status: 'active',
    amount: 680000,
    signDate: '2024-03-20',
    startDate: '2024-04-01',
    endDate: '2024-10-31',
    progress: 80,
    key: 'CT003'
  },
  {
    id: 'CT004',
    contractNo: 'HT2024004',
    customerName: '广州制造有限公司',
    type: 'lease',
    status: 'completed',
    amount: 450000,
    signDate: '2023-12-10',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    progress: 100,
    key: 'CT004'
  },
  {
    id: 'CT005',
    contractNo: 'HT2024005',
    customerName: '成都商贸中心',
    type: 'maintenance',
    status: 'draft',
    amount: 320000,
    signDate: '',
    startDate: '2024-08-01',
    endDate: '2025-07-31',
    progress: 0,
    key: 'CT005'
  }
])

// 合同统计
const contractStats = ref({
  total: contracts.value.length,
  active: contracts.value.filter(contract => contract.status === 'active').length,
  pending: contracts.value.filter(contract => contract.status === 'pending').length,
  totalAmount: contracts.value.reduce((sum, contract) => sum + contract.amount, 0)
})

// 表格列配置
const contractColumns = [
  { title: '合同编号', dataIndex: 'contractNo', key: 'contractNo', width: 120 },
  { title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 180 },
  { title: '合同类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '合同状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '合同金额', dataIndex: 'amount', key: 'amount', width: 120 },
  { title: '签署日期', dataIndex: 'signDate', key: 'signDate', width: 120 },
  { title: '结束日期', dataIndex: 'endDate', key: 'endDate', width: 120 },
  { title: '执行进度', dataIndex: 'progress', key: 'progress', width: 120 },
  { title: '操作', key: 'actions', width: 200, fixed: 'right' }
]

// 过滤后的合同数据
const filteredContracts = computed(() => {
  let result = contracts.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(contract =>
      contract.contractNo.toLowerCase().includes(keyword) ||
      contract.customerName.toLowerCase().includes(keyword)
    )
  }

  // 状态过滤
  if (filterStatus.value) {
    result = result.filter(contract => contract.status === filterStatus.value)
  }

  // 类型过滤
  if (filterType.value) {
    result = result.filter(contract => contract.type === filterType.value)
  }

  pagination.value.total = result.length
  return result
})

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    draft: 'default',
    pending: 'orange',
    active: 'blue',
    completed: 'green',
    terminated: 'red'
  }
  return colorMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    draft: '草稿',
    pending: '待签署',
    active: '执行中',
    completed: '已完成',
    terminated: '已终止'
  }
  return textMap[status] || status
}

// 获取进度状态
const getProgressStatus = (progress) => {
  if (progress === 0) return 'normal'
  if (progress < 50) return 'active'
  if (progress < 100) return 'normal'
  return 'success'
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
  message.success('合同数据导出成功')
}

// 显示新增弹窗
const showAddModal = () => {
  message.info('打开新建合同弹窗')
}

// 表格选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 表格变化处理
const handleTableChange = (pag) => {
  pagination.value = { ...pagination.value, ...pag }
}

// 查看合同详情
const viewContractDetail = (record) => {
  message.info(`查看合同详情: ${record.contractNo}`)
}

// 编辑合同
const editContract = (record) => {
  message.info(`编辑合同: ${record.contractNo}`)
}

// 签署合同
const signContract = (record) => {
  record.status = 'active'
  record.signDate = dayjs().format('YYYY-MM-DD')
  message.success(`合同 ${record.contractNo} 签署成功`)
}

// 查看合同
const viewContract = (record) => {
  message.info(`查看合同: ${record.contractNo}`)
}

// 下载合同
const downloadContract = (record) => {
  message.success(`合同 ${record.contractNo} 下载成功`)
}

// 复制合同
const copyContract = (record) => {
  message.success(`合同 ${record.contractNo} 已复制`)
}

// 归档合同
const archiveContract = (record) => {
  message.success(`合同 ${record.contractNo} 已归档`)
}

// 终止合同
const terminateContract = (record) => {
  record.status = 'terminated'
  message.success(`合同 ${record.contractNo} 已终止`)
}

// 批量签署
const handleBatchSign = () => {
  selectedRowKeys.value.forEach(key => {
    const contract = contracts.value.find(item => item.key === key)
    if (contract && contract.status === 'pending') {
      contract.status = 'active'
      contract.signDate = dayjs().format('YYYY-MM-DD')
    }
  })
  message.success(`已签署 ${selectedRowKeys.value.length} 个合同`)
  selectedRowKeys.value = []
}

// 批量导出
const handleBatchExport = () => {
  message.success(`批量导出 ${selectedRowKeys.value.length} 个合同`)
  selectedRowKeys.value = []
}

// 批量归档
const handleBatchArchive = () => {
  message.success(`批量归档 ${selectedRowKeys.value.length} 个合同`)
  selectedRowKeys.value = []
}

// 批量删除
const handleBatchDelete = () => {
  contracts.value = contracts.value.filter(item => !selectedRowKeys.value.includes(item.key))
  message.success(`已删除 ${selectedRowKeys.value.length} 个合同`)
  selectedRowKeys.value = []
}

onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.contracts-management {
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

.contracts-table-card {
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
  .contracts-management {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 20px;
  }
}
</style>
