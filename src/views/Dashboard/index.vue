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
              <car-outlined />
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
              <deployment-unit-outlined />
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
              <shop-outlined />
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
              <team-outlined />
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
              <plus-outlined />
              新建订单
            </a-button>
            <a-button size="large" @click="handleQuickAction('dispatch')">
              <deployment-unit-outlined />
              车辆调度
            </a-button>
            <a-button size="large" @click="handleQuickAction('monitor')">
              <eye-outlined />
              实时监控
            </a-button>
            <a-button size="large" @click="handleQuickAction('report')">
              <bar-chart-outlined />
              数据报表
            </a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>

    <!-- 最新动态和待办事项 -->
    <a-row :gutter="16">
      <a-col :span="12">
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
      
      <a-col :span="12">
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
    </a-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  CarOutlined, 
  DeploymentUnitOutlined, 
  ShopOutlined, 
  TeamOutlined,
  PlusOutlined,
  EyeOutlined,
  BarChartOutlined
} from '@ant-design/icons-vue';

const router = useRouter();

// 统计数据
const statistics = ref({
  totalVehicles: 156,
  activeVehicles: 89,
  todayOrders: 234,
  totalDrivers: 128,
});

// 最新动态
const recentActivities = ref([
  {
    type: '订',
    title: '新订单 #2024001 已创建',
    time: '5分钟前',
    color: '#1890ff'
  },
  {
    type: '车',
    title: '车辆 京A12345 已到达目的地',
    time: '15分钟前',
    color: '#52c41a'
  },
  {
    type: '维',
    title: '车辆 京B67890 需要保养',
    time: '1小时前',
    color: '#faad14'
  },
  {
    type: '司',
    title: '司机张师傅已上线',
    time: '2小时前',
    color: '#722ed1'
  },
]);

// 待办事项
const todoList = ref([
  {
    id: 1,
    title: '审核订单 #2024001',
    priority: '高',
    deadline: '今天 18:00',
    status: 'error'
  },
  {
    id: 2,
    title: '安排车辆维修',
    priority: '中',
    deadline: '明天 10:00',
    status: 'warning'
  },
  {
    id: 3,
    title: '更新司机档案',
    priority: '低',
    deadline: '本周五',
    status: 'default'
  },
]);

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
  console.log('处理待办事项:', id);
  // 这里可以添加具体的处理逻辑
};
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
