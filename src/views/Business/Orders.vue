<template>
  <div>
    <h1>📋 订单管理</h1>
    
    <!-- 搜索和操作栏 -->
    <a-card style="margin-bottom: 16px;">
      <a-row :gutter="16" align="middle">
        <a-col :span="6">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索订单号、客户名称"
            @search="handleSearch"
          />
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="statusFilter"
            placeholder="订单状态"
            style="width: 100%"
            @change="handleStatusFilter"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="pending">待确认</a-select-option>
            <a-select-option value="confirmed">已确认</a-select-option>
            <a-select-option value="shipping">运输中</a-select-option>
            <a-select-option value="delivered">已送达</a-select-option>
            <a-select-option value="cancelled">已取消</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-range-picker
            v-model:value="dateRange"
            style="width: 100%"
            @change="handleDateFilter"
          />
        </a-col>
        <a-col :span="10" style="text-align: right;">
          <a-space>
            <a-button @click="handleRefresh">
              <reload-outlined />
              刷新
            </a-button>
            <a-button type="primary" @click="handleCreateOrder">
              <plus-outlined />
              新建订单
            </a-button>
            <a-button @click="handleExport">
              <download-outlined />
              导出
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 订单列表 -->
    <a-card>
      <a-table
        :columns="columns"
        :data-source="orders"
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
          <template v-else-if="column.key === 'priority'">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ record.priority }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'amount'">
            ¥{{ record.amount.toLocaleString() }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="handleView(record)">查看</a>
              <a @click="handleEdit(record)" v-if="record.status === 'pending'">编辑</a>
              <a @click="handleTrack(record)" v-if="record.status === 'shipping'">跟踪</a>
              <a-popconfirm
                title="确定要取消这个订单吗？"
                @confirm="handleCancel(record)"
                v-if="['pending', 'confirmed'].includes(record.status)"
              >
                <a style="color: #ff4d4f;">取消</a>
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
const dateRange = ref([]);
const loading = ref(false);

// 表格列定义
const columns = [
  {
    title: '订单号',
    dataIndex: 'orderNo',
    key: 'orderNo',
    width: 120,
  },
  {
    title: '客户名称',
    dataIndex: 'customerName',
    key: 'customerName',
    width: 120,
  },
  {
    title: '起始地',
    dataIndex: 'origin',
    key: 'origin',
    width: 100,
  },
  {
    title: '目的地',
    dataIndex: 'destination',
    key: 'destination',
    width: 100,
  },
  {
    title: '货物类型',
    dataIndex: 'cargoType',
    key: 'cargoType',
    width: 100,
  },
  {
    title: '重量(吨)',
    dataIndex: 'weight',
    key: 'weight',
    width: 80,
  },
  {
    title: '金额',
    dataIndex: 'amount',
    key: 'amount',
    width: 100,
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 80,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 120,
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right',
  },
];

// 订单数据
const orders = ref([
  {
    id: 1,
    orderNo: 'ORD2024001',
    customerName: '顺丰速运',
    origin: '北京',
    destination: '上海',
    cargoType: '电子产品',
    weight: 2.5,
    amount: 3500,
    priority: '高',
    status: 'shipping',
    createTime: '2024-01-15 09:30',
  },
  {
    id: 2,
    orderNo: 'ORD2024002',
    customerName: '京东物流',
    origin: '广州',
    destination: '深圳',
    cargoType: '日用品',
    weight: 1.8,
    amount: 2200,
    priority: '中',
    status: 'confirmed',
    createTime: '2024-01-15 10:15',
  },
  {
    id: 3,
    orderNo: 'ORD2024003',
    customerName: '中通快递',
    origin: '杭州',
    destination: '南京',
    cargoType: '服装',
    weight: 3.2,
    amount: 4100,
    priority: '低',
    status: 'pending',
    createTime: '2024-01-15 11:20',
  },
]);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: orders.value.length,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
});

// 状态相关方法
const getStatusColor = (status) => {
  const colorMap = {
    pending: 'orange',
    confirmed: 'blue',
    shipping: 'green',
    delivered: 'success',
    cancelled: 'red',
  };
  return colorMap[status] || 'default';
};

const getStatusText = (status) => {
  const textMap = {
    pending: '待确认',
    confirmed: '已确认',
    shipping: '运输中',
    delivered: '已送达',
    cancelled: '已取消',
  };
  return textMap[status] || status;
};

const getPriorityColor = (priority) => {
  const colorMap = {
    高: 'red',
    中: 'orange',
    低: 'green',
  };
  return colorMap[priority] || 'default';
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

const handleDateFilter = () => {
  console.log('日期筛选:', dateRange.value);
  message.info('日期筛选功能开发中...');
};

const handleRefresh = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    message.success('数据已刷新');
  }, 1000);
};

const handleCreateOrder = () => {
  message.info('新建订单功能开发中...');
};

const handleExport = () => {
  message.info('导出功能开发中...');
};

const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
};

const handleView = (record) => {
  message.info(`查看订单: ${record.orderNo}`);
};

const handleEdit = (record) => {
  message.info(`编辑订单: ${record.orderNo}`);
};

const handleTrack = (record) => {
  message.info(`跟踪订单: ${record.orderNo}`);
};

const handleCancel = (record) => {
  message.success(`订单 ${record.orderNo} 已取消`);
  record.status = 'cancelled';
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
