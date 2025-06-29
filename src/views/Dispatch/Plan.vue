<template>
  <div>
    <h1>📅 调度计划</h1>
    
    <!-- 操作栏 -->
    <a-card style="margin-bottom: 16px;">
      <a-row :gutter="16" align="middle">
        <a-col :span="6">
          <a-date-picker
            v-model:value="selectedDate"
            style="width: 100%"
            @change="handleDateChange"
            placeholder="选择日期"
          />
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="statusFilter"
            placeholder="任务状态"
            style="width: 100%"
            @change="handleStatusFilter"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="pending">待执行</a-select-option>
            <a-select-option value="executing">执行中</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
            <a-select-option value="cancelled">已取消</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="14" style="text-align: right;">
          <a-space>
            <a-button @click="handleRefresh">
              <reload-outlined />
              刷新
            </a-button>
            <a-button type="primary" @click="handleCreatePlan">
              <plus-outlined />
              新建调度
            </a-button>
            <a-button @click="handleOptimize">
              <thunderbolt-outlined />
              智能优化
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 调度概览 -->
    <a-row :gutter="16" style="margin-bottom: 16px;">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="今日任务"
            :value="statistics.todayTasks"
            suffix="个"
            :value-style="{ color: '#1890ff' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="执行中"
            :value="statistics.executingTasks"
            suffix="个"
            :value-style="{ color: '#52c41a' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="已完成"
            :value="statistics.completedTasks"
            suffix="个"
            :value-style="{ color: '#722ed1' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="车辆利用率"
            :value="statistics.vehicleUtilization"
            suffix="%"
            :value-style="{ color: '#fa8c16' }"
          />
        </a-card>
      </a-col>
    </a-row>

    <!-- 调度任务列表 -->
    <a-card>
      <a-table
        :columns="columns"
        :data-source="dispatchTasks"
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
          <template v-else-if="column.key === 'progress'">
            <a-progress
              :percent="record.progress"
              size="small"
              :status="record.progress === 100 ? 'success' : 'active'"
            />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="handleView(record)">查看</a>
              <a @click="handleEdit(record)" v-if="record.status === 'pending'">编辑</a>
              <a @click="handleTrack(record)" v-if="record.status === 'executing'">跟踪</a>
              <a @click="handleAssign(record)" v-if="!record.vehicle">分配车辆</a>
              <a-popconfirm
                title="确定要取消这个任务吗？"
                @confirm="handleCancel(record)"
                v-if="['pending'].includes(record.status)"
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
  ThunderboltOutlined 
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';

// 响应式数据
const selectedDate = ref(dayjs());
const statusFilter = ref('');
const loading = ref(false);

// 统计数据
const statistics = ref({
  todayTasks: 24,
  executingTasks: 8,
  completedTasks: 12,
  vehicleUtilization: 75,
});

// 表格列定义
const columns = [
  {
    title: '任务编号',
    dataIndex: 'taskNo',
    key: 'taskNo',
    width: 120,
  },
  {
    title: '订单号',
    dataIndex: 'orderNo',
    key: 'orderNo',
    width: 120,
  },
  {
    title: '路线',
    dataIndex: 'route',
    key: 'route',
    width: 200,
  },
  {
    title: '车辆',
    dataIndex: 'vehicle',
    key: 'vehicle',
    width: 100,
  },
  {
    title: '司机',
    dataIndex: 'driver',
    key: 'driver',
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
    title: '进度',
    dataIndex: 'progress',
    key: 'progress',
    width: 120,
  },
  {
    title: '计划时间',
    dataIndex: 'plannedTime',
    key: 'plannedTime',
    width: 150,
  },
  {
    title: '操作',
    key: 'action',
    width: 180,
    fixed: 'right',
  },
];

// 调度任务数据
const dispatchTasks = ref([
  {
    id: 1,
    taskNo: 'TASK2024001',
    orderNo: 'ORD2024001',
    route: '北京 → 上海',
    vehicle: '京A12345',
    driver: '张师傅',
    priority: '高',
    status: 'executing',
    progress: 65,
    plannedTime: '2024-01-15 08:00',
  },
  {
    id: 2,
    taskNo: 'TASK2024002',
    orderNo: 'ORD2024002',
    route: '广州 → 深圳',
    vehicle: '粤B67890',
    driver: '李师傅',
    priority: '中',
    status: 'completed',
    progress: 100,
    plannedTime: '2024-01-15 09:30',
  },
  {
    id: 3,
    taskNo: 'TASK2024003',
    orderNo: 'ORD2024003',
    route: '杭州 → 南京',
    vehicle: '',
    driver: '',
    priority: '低',
    status: 'pending',
    progress: 0,
    plannedTime: '2024-01-15 14:00',
  },
]);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: dispatchTasks.value.length,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
});

// 状态相关方法
const getStatusColor = (status) => {
  const colorMap = {
    pending: 'orange',
    executing: 'blue',
    completed: 'green',
    cancelled: 'red',
  };
  return colorMap[status] || 'default';
};

const getStatusText = (status) => {
  const textMap = {
    pending: '待执行',
    executing: '执行中',
    completed: '已完成',
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
const handleDateChange = (date) => {
  console.log('日期变更:', date);
  message.info('日期筛选功能开发中...');
};

const handleStatusFilter = () => {
  console.log('状态筛选:', statusFilter.value);
  message.info('筛选功能开发中...');
};

const handleRefresh = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    message.success('数据已刷新');
  }, 1000);
};

const handleCreatePlan = () => {
  message.info('新建调度功能开发中...');
};

const handleOptimize = () => {
  message.info('智能优化功能开发中...');
};

const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
};

const handleView = (record) => {
  message.info(`查看任务: ${record.taskNo}`);
};

const handleEdit = (record) => {
  message.info(`编辑任务: ${record.taskNo}`);
};

const handleTrack = (record) => {
  message.info(`跟踪任务: ${record.taskNo}`);
};

const handleAssign = (record) => {
  message.info(`分配车辆给任务: ${record.taskNo}`);
};

const handleCancel = (record) => {
  message.success(`任务 ${record.taskNo} 已取消`);
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

.ant-statistic {
  text-align: center;
}
</style>
