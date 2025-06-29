<template>
  <div>
    <h1>🚛 车辆档案</h1>
    
    <!-- 搜索和操作栏 -->
    <a-card style="margin-bottom: 16px;">
      <a-row :gutter="16" align="middle">
        <a-col :span="6">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索车牌号、司机姓名"
            @search="handleSearch"
          />
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="statusFilter"
            placeholder="车辆状态"
            style="width: 100%"
            @change="handleStatusFilter"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="available">可用</a-select-option>
            <a-select-option value="busy">使用中</a-select-option>
            <a-select-option value="maintenance">维修中</a-select-option>
            <a-select-option value="retired">已退役</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="typeFilter"
            placeholder="车辆类型"
            style="width: 100%"
            @change="handleTypeFilter"
          >
            <a-select-option value="">全部类型</a-select-option>
            <a-select-option value="truck">货车</a-select-option>
            <a-select-option value="van">面包车</a-select-option>
            <a-select-option value="trailer">拖车</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="10" style="text-align: right;">
          <a-space>
            <a-button @click="handleRefresh">
              <reload-outlined />
              刷新
            </a-button>
            <a-button type="primary" @click="handleAddVehicle">
              <plus-outlined />
              添加车辆
            </a-button>
            <a-button @click="handleExport">
              <download-outlined />
              导出
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 车辆列表 -->
    <a-card>
      <a-table
        :columns="columns"
        :data-source="vehicles"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'loadCapacity'">
            {{ record.loadCapacity }}吨
          </template>
          <template v-else-if="column.key === 'mileage'">
            {{ record.mileage.toLocaleString() }}km
          </template>
          <template v-else-if="column.key === 'insuranceExpiry'">
            <span :style="{ color: isExpiringSoon(record.insuranceExpiry) ? '#ff4d4f' : '#000' }">
              {{ record.insuranceExpiry }}
            </span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="handleView(record)">查看</a>
              <a @click="handleEdit(record)">编辑</a>
              <a @click="handleMaintenance(record)" v-if="record.status === 'available'">维修</a>
              <a @click="handleLocation(record)" v-if="record.status === 'busy'">定位</a>
              <a-popconfirm
                title="确定要删除这辆车吗？"
                @confirm="handleDelete(record)"
              >
                <a style="color: #ff4d4f;">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { 
  ReloadOutlined, 
  PlusOutlined, 
  DownloadOutlined 
} from '@ant-design/icons-vue';

// 响应式数据
const searchText = ref('');
const statusFilter = ref('');
const typeFilter = ref('');
const loading = ref(false);

// 表格列定义
const columns = [
  {
    title: '车牌号',
    dataIndex: 'plateNumber',
    key: 'plateNumber',
    width: 120,
  },
  {
    title: '车辆类型',
    dataIndex: 'type',
    key: 'type',
    width: 100,
  },
  {
    title: '品牌型号',
    dataIndex: 'model',
    key: 'model',
    width: 150,
  },
  {
    title: '载重量',
    dataIndex: 'loadCapacity',
    key: 'loadCapacity',
    width: 100,
  },
  {
    title: '司机',
    dataIndex: 'driver',
    key: 'driver',
    width: 100,
  },
  {
    title: '里程数',
    dataIndex: 'mileage',
    key: 'mileage',
    width: 120,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '保险到期',
    dataIndex: 'insuranceExpiry',
    key: 'insuranceExpiry',
    width: 120,
  },
  {
    title: '购买日期',
    dataIndex: 'purchaseDate',
    key: 'purchaseDate',
    width: 120,
  },
  {
    title: '操作',
    key: 'action',
    width: 180,
    fixed: 'right',
  },
];

// 车辆数据
const vehicles = ref([
  {
    id: 1,
    plateNumber: '京A12345',
    type: '货车',
    model: '东风天龙 DFL4251',
    loadCapacity: 25,
    driver: '张师傅',
    mileage: 156000,
    status: 'busy',
    insuranceExpiry: '2024-06-15',
    purchaseDate: '2020-03-10',
  },
  {
    id: 2,
    plateNumber: '京B67890',
    type: '面包车',
    model: '福田风景 G7',
    loadCapacity: 2,
    driver: '李师傅',
    mileage: 89000,
    status: 'available',
    insuranceExpiry: '2024-12-20',
    purchaseDate: '2021-07-22',
  },
  {
    id: 3,
    plateNumber: '京C11111',
    type: '拖车',
    model: '解放J6P',
    loadCapacity: 40,
    driver: '王师傅',
    mileage: 234000,
    status: 'maintenance',
    insuranceExpiry: '2024-03-08',
    purchaseDate: '2019-11-15',
  },
]);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: vehicles.value.length,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
});

// 状态相关方法
const getStatusColor = (status) => {
  const colorMap = {
    available: 'green',
    busy: 'blue',
    maintenance: 'orange',
    retired: 'red',
  };
  return colorMap[status] || 'default';
};

const getStatusText = (status) => {
  const textMap = {
    available: '可用',
    busy: '使用中',
    maintenance: '维修中',
    retired: '已退役',
  };
  return textMap[status] || status;
};

// 检查保险是否即将到期
const isExpiringSoon = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 30; // 30天内到期显示红色
};

// 事件处理方法
const handleSearch = () => {
  console.log('搜索:', searchText.value);
  message.info('搜索功能开发中...');
};

const handleStatusFilter = () => {
  console.log('状态筛选:', statusFilter.value);
  message.info('筛选功能开发中...');
};

const handleTypeFilter = () => {
  console.log('类型筛选:', typeFilter.value);
  message.info('筛选功能开发中...');
};

const handleRefresh = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    message.success('数据已刷新');
  }, 1000);
};

const handleAddVehicle = () => {
  message.info('添加车辆功能开发中...');
};

const handleExport = () => {
  message.info('导出功能开发中...');
};

const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
};

const handleView = (record) => {
  message.info(`查看车辆: ${record.plateNumber}`);
};

const handleEdit = (record) => {
  message.info(`编辑车辆: ${record.plateNumber}`);
};

const handleMaintenance = (record) => {
  message.success(`车辆 ${record.plateNumber} 已安排维修`);
  record.status = 'maintenance';
};

const handleLocation = (record) => {
  message.info(`定位车辆: ${record.plateNumber}`);
};

const handleDelete = (record) => {
  const index = vehicles.value.findIndex(v => v.id === record.id);
  if (index > -1) {
    vehicles.value.splice(index, 1);
    message.success(`车辆 ${record.plateNumber} 已删除`);
    pagination.total = vehicles.value.length;
  }
};

onMounted(() => {
  // 组件挂载后的初始化操作
});
</script>

<style lang="scss" scoped>
.ant-card {
  border-radius: 8px;
}

.ant-table {
  font-size: 14px;
}
</style>
