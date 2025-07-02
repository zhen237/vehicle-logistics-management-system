<template>
  <div>
    <h1>🚛 车辆物流工作台</h1>

    <!-- 数据概览卡片 -->
    <a-row :gutter="16" style="margin-bottom: 24px;">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="总车辆数"
            :value="statistics.totalVehicles"
            :value-style="{ color: '#3f8600' }"
            suffix="辆"
          >
            <template #prefix>
              <CarOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="在途车辆"
            :value="statistics.activeVehicles"
            :value-style="{ color: '#1890ff' }"
            suffix="辆"
          >
            <template #prefix>
              <DeploymentUnitOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="今日订单"
            :value="statistics.todayOrders"
            :value-style="{ color: '#cf1322' }"
            suffix="单"
          >
            <template #prefix>
              <ShopOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="司机总数"
            :value="statistics.totalDrivers"
            :value-style="{ color: '#722ed1' }"
            suffix="人"
          >
            <template #prefix>
              <TeamOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 快捷操作 -->
    <a-row :gutter="16" style="margin-bottom: 24px;">
      <a-col :span="24">
        <a-card title="快捷操作">
          <a-space size="large">
            <a-button type="primary" size="large" @click="handleQuickAction('new-order')">
              <PlusOutlined />
              新建订单
            </a-button>
            <a-button size="large" @click="handleQuickAction('dispatch')">
              <DeploymentUnitOutlined />
              车辆调度
            </a-button>
            <a-button size="large" @click="handleQuickAction('monitor')">
              <EyeOutlined />
              实时监控
            </a-button>
            <a-button size="large" @click="handleQuickAction('report')">
              <BarChartOutlined />
              数据报表
            </a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>

    <!-- 数据图表 -->
    <a-row :gutter="16" style="margin-bottom: 24px;">
      <a-col :span="12">
        <a-card title="车辆状态分布">
          <div ref="vehicleChart" style="height: 300px;"></div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="本月订单趋势">
          <div ref="orderChart" style="height: 300px;"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 实时数据表格 -->
    <a-row :gutter="16" style="margin-bottom: 24px;">
      <a-col :span="24">
        <a-card title="实时车辆状态">
          <template #extra>
            <a-button size="small" @click="refreshVehicleData">刷新</a-button>
          </template>
          <a-table
            :columns="vehicleColumns"
            :data-source="realTimeVehicles"
            :pagination="{ pageSize: 5 }"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="getVehicleStatusColor(record.status)">
                  {{ record.status }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'location'">
                <a @click="showLocation(record)">{{ record.location }}</a>
              </template>
              <template v-else-if="column.key === 'progress'">
                <a-progress :percent="record.progress" size="small" />
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <!-- 最新动态和待办事项 -->
    <a-row :gutter="16" style="margin-bottom: 24px;">
      <a-col :span="8">
        <a-card title="最新动态" :body-style="{ padding: '12px' }">
          <a-list
            :data-source="recentActivities"
            size="small"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar :style="{ backgroundColor: item.color }">
                      {{ item.type }}
                    </a-avatar>
                  </template>
                  <template #title>
                    {{ item.title }}
                  </template>
                  <template #description>
                    {{ item.time }}
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <a-col :span="8">
        <a-card title="待办事项" :body-style="{ padding: '12px' }">
          <a-list
            :data-source="todoList"
            size="small"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <a-badge :status="item.status" />
                  </template>
                  <template #title>
                    {{ item.title }}
                  </template>
                  <template #description>
                    优先级: {{ item.priority }} | 截止: {{ item.deadline }}
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <a @click="handleTodoAction(item.id)">处理</a>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <a-col :span="8">
        <a-card title="异常告警" :body-style="{ padding: '12px' }">
          <a-list
            :data-source="alerts"
            size="small"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar :style="{ backgroundColor: item.color }">
                      <ExclamationOutlined />
                    </a-avatar>
                  </template>
                  <template #title>
                    {{ item.title }}
                  </template>
                  <template #description>
                    {{ item.description }}
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <a @click="handleAlert(item.id)">查看</a>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>

    <!-- 天气和系统信息 -->
    <a-row :gutter="16">
      <a-col :span="8">
        <a-card title="今日天气">
          <div style="text-align: center;">
            <div style="font-size: 48px; color: #1890ff; margin-bottom: 16px;">
              <CloudOutlined />
            </div>
            <h2 style="margin: 0;">{{ weather.temperature }}°C</h2>
            <p style="margin: 8px 0; color: #666;">{{ weather.description }}</p>
            <p style="margin: 0; font-size: 12px; color: #999;">
              湿度: {{ weather.humidity }}% | 风速: {{ weather.windSpeed }}km/h
            </p>
          </div>
        </a-card>
      </a-col>

      <a-col :span="8">
        <a-card title="系统状态">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-statistic
                title="CPU使用率"
                :value="systemStatus.cpu"
                suffix="%"
                :value-style="{ color: systemStatus.cpu > 80 ? '#cf1322' : '#3f8600' }"
              />
            </a-col>
            <a-col :span="12">
              <a-statistic
                title="内存使用率"
                :value="systemStatus.memory"
                suffix="%"
                :value-style="{ color: systemStatus.memory > 80 ? '#cf1322' : '#3f8600' }"
              />
            </a-col>
          </a-row>
          <a-divider />
          <a-row :gutter="16">
            <a-col :span="12">
              <a-statistic
                title="在线用户"
                :value="systemStatus.onlineUsers"
                suffix="人"
              />
            </a-col>
            <a-col :span="12">
              <a-statistic
                title="系统运行"
                :value="systemStatus.uptime"
                suffix="天"
              />
            </a-col>
          </a-row>
        </a-card>
      </a-col>

      <a-col :span="8">
        <a-card title="快速统计">
          <a-descriptions :column="1" size="small">
            <a-descriptions-item label="今日新增订单">
              <a-tag color="blue">{{ quickStats.newOrders }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="完成订单">
              <a-tag color="green">{{ quickStats.completedOrders }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="运输中订单">
              <a-tag color="orange">{{ quickStats.shippingOrders }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="异常订单">
              <a-tag color="red">{{ quickStats.errorOrders }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="今日收入">
              <span style="color: #52c41a; font-weight: bold;">
                ¥{{ quickStats.todayRevenue.toLocaleString() }}
              </span>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  CarOutlined,
  DeploymentUnitOutlined,
  ShopOutlined,
  TeamOutlined,
  PlusOutlined,
  EyeOutlined,
  BarChartOutlined,
  ExclamationOutlined,
  CloudOutlined
} from '@ant-design/icons-vue';
import {
  vehicleData,
  driverData,
  orderData,
  statisticsData,
  monitoringData
} from '@/data/mockData.js';

const router = useRouter();

// 图表引用
const vehicleChart = ref(null);
const orderChart = ref(null);

// 统计数据 - 使用导入的模拟数据
const statistics = ref({
  totalVehicles: statisticsData.overview.totalVehicles,
  activeVehicles: statisticsData.overview.activeVehicles,
  todayOrders: statisticsData.overview.todayOrders,
  totalDrivers: statisticsData.overview.totalDrivers,
});

// 实时车辆数据表格列
const vehicleColumns = [
  { title: '车牌号', dataIndex: 'plateNumber', key: 'plateNumber' },
  { title: '司机', dataIndex: 'driver', key: 'driver' },
  { title: '当前位置', dataIndex: 'location', key: 'location' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '运输进度', dataIndex: 'progress', key: 'progress' },
];

// 实时车辆数据 - 使用导入的真实数据
const realTimeVehicles = ref(
  vehicleData.map((vehicle, index) => ({
    id: index + 1,
    plateNumber: vehicle.plateNumber,
    driver: vehicle.driver,
    location: vehicle.location,
    status: vehicle.status,
    progress: getProgressByStatus(vehicle.status),
  }))
);

// 根据状态计算进度
function getProgressByStatus(status) {
  const progressMap = {
    '运输中': Math.floor(Math.random() * 40) + 40, // 40-80%
    '装货中': Math.floor(Math.random() * 30) + 10, // 10-40%
    '待发车': 0,
    '已到达': 100,
    '返程中': Math.floor(Math.random() * 30) + 70, // 70-100%
  };
  return progressMap[status] || 0;
}

// 最新动态 - 使用真实数据生成
const recentActivities = ref([
  {
    type: '订',
    title: `新订单 ${orderData[0].id} 已创建`,
    time: '5分钟前',
    color: '#1890ff'
  },
  {
    type: '车',
    title: `车辆 ${vehicleData[0].plateNumber} 正在运输中`,
    time: '15分钟前',
    color: '#52c41a'
  },
  {
    type: '维',
    title: `车辆 ${vehicleData[1].plateNumber} 需要保养`,
    time: '1小时前',
    color: '#faad14'
  },
  {
    type: '司',
    title: `司机${driverData[0].name}已上线`,
    time: '2小时前',
    color: '#722ed1'
  },
  {
    type: '订',
    title: `订单 ${orderData[2].id} 已完成`,
    time: '3小时前',
    color: '#52c41a'
  },
]);

// 待办事项 - 使用真实数据生成
const todoList = ref([
  {
    id: 1,
    title: `审核订单 ${orderData[0].id}`,
    priority: '高',
    deadline: '今天 18:00',
    status: 'error'
  },
  {
    id: 2,
    title: `安排车辆 ${vehicleData[2].plateNumber} 维修`,
    priority: '中',
    deadline: '明天 10:00',
    status: 'warning'
  },
  {
    id: 3,
    title: `更新司机 ${driverData[3].name} 档案`,
    priority: '低',
    deadline: '本周五',
    status: 'default'
  },
  {
    id: 4,
    title: `处理客户 ${orderData[1].customerName} 投诉`,
    priority: '高',
    deadline: '今天 20:00',
    status: 'error'
  },
]);

// 异常告警 - 使用真实数据生成
const alerts = ref([
  {
    id: 1,
    title: '车辆超速告警',
    description: `${vehicleData[0].plateNumber} 在${vehicleData[0].location}超速行驶`,
    color: '#ff4d4f'
  },
  {
    id: 2,
    title: '路线偏离',
    description: `${vehicleData[1].plateNumber} 偏离预定路线`,
    color: '#faad14'
  },
  {
    id: 3,
    title: '车辆故障',
    description: `${vehicleData[2].plateNumber} 发动机温度过高`,
    color: '#ff7875'
  },
  {
    id: 4,
    title: '延迟送达',
    description: `订单 ${orderData[2].id} 预计延迟2小时`,
    color: '#ffa940'
  },
]);

// 天气信息
const weather = ref({
  temperature: 22,
  description: '多云转晴',
  humidity: 65,
  windSpeed: 12,
});

// 系统状态
const systemStatus = ref({
  cpu: 45,
  memory: 68,
  onlineUsers: 23,
  uptime: 127,
});

// 快速统计 - 使用真实统计数据
const quickStats = ref({
  newOrders: orderData.filter(order => order.createDate === '2024-06-30').length,
  completedOrders: statisticsData.overview.completedOrders,
  shippingOrders: orderData.filter(order => order.status === '运输中').length,
  errorOrders: orderData.filter(order => order.status === '异常').length,
  todayRevenue: statisticsData.overview.monthlyRevenue,
});

// 车辆状态颜色
const getVehicleStatusColor = (status) => {
  const colorMap = {
    '运输中': 'blue',
    '装货中': 'orange',
    '待发车': 'default',
    '已到达': 'green',
    '返程中': 'purple',
    '维修中': 'red',
  };
  return colorMap[status] || 'default';
};

// 刷新车辆数据
const refreshVehicleData = () => {
  message.loading('正在刷新数据...', 1);
  // 模拟数据刷新
  setTimeout(() => {
    // 随机更新进度
    realTimeVehicles.value.forEach(vehicle => {
      if (vehicle.status === '运输中') {
        vehicle.progress = Math.min(100, vehicle.progress + Math.floor(Math.random() * 10));
      }
    });
    message.success('数据刷新成功');
  }, 1000);
};

// 显示位置
const showLocation = (record) => {
  message.info(`车辆 ${record.plateNumber} 当前位置：${record.location}`);
};

// 快捷操作处理
const handleQuickAction = (action) => {
  const actionMap = {
    'new-order': '/business/orders',
    'dispatch': '/dispatch/plan',
    'monitor': '/dispatch/monitor',
    'report': '/data/report'
  };

  if (actionMap[action]) {
    router.push(actionMap[action]);
  }
};

// 待办事项处理
const handleTodoAction = (id) => {
  const todo = todoList.value.find(item => item.id === id);
  if (todo) {
    message.success(`开始处理：${todo.title}`);
  }
};

// 告警处理
const handleAlert = (id) => {
  const alert = alerts.value.find(item => item.id === id);
  if (alert) {
    message.warning(`查看告警：${alert.title}`);
  }
};

// 初始化图表
const initCharts = () => {
  // 这里可以集成 ECharts 或其他图表库
  // 由于没有安装图表库，这里只是占位
  console.log('初始化图表');
};

// 组件挂载后初始化
onMounted(() => {
  nextTick(() => {
    initCharts();
  });

  // 模拟实时数据更新
  setInterval(() => {
    // 更新系统状态
    systemStatus.value.cpu = Math.floor(Math.random() * 100);
    systemStatus.value.memory = Math.floor(Math.random() * 100);

    // 更新在线用户数
    systemStatus.value.onlineUsers = Math.floor(Math.random() * 50) + 10;
  }, 30000); // 30秒更新一次
});
</script>

<style lang="scss" scoped>
.ant-statistic {
  text-align: center;
}

.ant-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ant-list-item {
  padding: 8px 16px;
}

.ant-list-item:hover {
  background-color: #f5f5f5;
}
</style>
