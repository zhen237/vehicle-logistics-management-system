<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="logo" />
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline" @click="handleMenuClick">
        <a-menu-item key="dashboard">
          <DashboardOutlined />
          <span>工作台</span>
        </a-menu-item>

        <a-sub-menu key="data-management">
          <template #title>
            <span>
              <DatabaseOutlined />
              <span>数据管理</span>
            </span>
          </template>
          <a-menu-item key="data-overview">
            <LineChartOutlined />
            数据概览
          </a-menu-item>
          <a-menu-item key="data-analysis">
            <LineChartOutlined />
            数据分析
          </a-menu-item>
          <a-menu-item key="data-report">
            <FileTextOutlined />
            数据报表
          </a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="business-management">
          <template #title>
            <span>
              <ShopOutlined />
              <span>业务管理</span>
            </span>
          </template>
          <a-menu-item key="orders">
            <ShoppingCartOutlined />
            订单管理
          </a-menu-item>
          <a-menu-item key="routes">
            <EnvironmentOutlined />
            路线管理
          </a-menu-item>
          <a-menu-item key="customers">
            <UserOutlined />
            客户管理
          </a-menu-item>
          <a-menu-item key="contracts">
            <FileProtectOutlined />
            合同管理
          </a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="vehicle-management">
          <template #title>
            <span>
              <CarOutlined />
              <span>车辆管理</span>
            </span>
          </template>
          <a-menu-item key="vehicles">
            <CarOutlined />
            车辆档案
          </a-menu-item>
          <a-menu-item key="vehicle-maintenance">
            <ToolOutlined />
            维修保养
          </a-menu-item>
          <a-menu-item key="vehicle-insurance">
            <SafetyOutlined />
            保险管理
          </a-menu-item>
          <a-menu-item key="vehicle-fuel">
            <DashboardOutlined />
            油耗管理
          </a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="dispatch-management">
          <template #title>
            <span>
              <DeploymentUnitOutlined />
              <span>调度管理</span>
            </span>
          </template>
          <a-menu-item key="dispatch-plan">
            <CalendarOutlined />
            调度计划
          </a-menu-item>
          <a-menu-item key="dispatch-monitor">
            <MonitorOutlined />
            实时监控
          </a-menu-item>
          <a-menu-item key="dispatch-history">
            <HistoryOutlined />
            调度历史
          </a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="staff-management">
          <template #title>
            <span>
              <TeamOutlined />
              <span>员工管理</span>
            </span>
          </template>
          <a-menu-item key="drivers">
            <CarOutlined />
            司机管理
          </a-menu-item>
          <a-menu-item key="staff">
            <IdcardOutlined />
            员工档案
          </a-menu-item>
          <a-menu-item key="attendance">
            <ClockCircleOutlined />
            考勤管理
          </a-menu-item>
          <a-menu-item key="salary">
            <DollarOutlined />
            薪资管理
          </a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="system-management">
          <template #title>
            <span>
              <SettingOutlined />
              <span>系统管理</span>
            </span>
          </template>
          <a-menu-item key="profile">
            <UserOutlined />
            个人资料
          </a-menu-item>
          <a-menu-item key="settings">
            <SettingOutlined />
            系统设置
          </a-menu-item>
          <a-menu-item key="roles">
            <KeyOutlined />
            角色管理
          </a-menu-item>
          <a-menu-item key="permissions">
            <LockOutlined />
            权限管理
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0; box-shadow: 0 1px 4px rgba(0,21,41,.08)">
        <div style="padding: 0 24px; display: flex; align-items: center; justify-content: space-between; height: 64px;">
          <h3 style="margin: 0; color: #1890ff;">🚛 车辆物流管理系统</h3>
          <div style="display: flex; align-items: center; gap: 16px;">
            <span style="color: #666;">欢迎您，管理员</span>
            <a-button type="text" @click="handleLogout">退出登录</a-button>
          </div>
        </div>
      </a-layout-header>
      <a-layout-content style="margin: 0 16px">
        <a-breadcrumb style="margin: 16px 0">
          <a-breadcrumb-item>{{ currentBreadcrumb.parent }}</a-breadcrumb-item>
          <a-breadcrumb-item>{{ currentBreadcrumb.current }}</a-breadcrumb-item>
        </a-breadcrumb>
        <div :style="{ padding: '24px', background: '#fff', minHeight: '360px', borderRadius: '6px' }">
          <router-view />
        </div>
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        Vue3 + Ant Design Vue ©2024 管理系统
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
<script setup>
import {
  DashboardOutlined,
  DatabaseOutlined,
  ShopOutlined,
  CarOutlined,
  DeploymentUnitOutlined,
  TeamOutlined,
  SettingOutlined,
  LineChartOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  EnvironmentOutlined,
  UserOutlined,
  FileProtectOutlined,
  ToolOutlined,
  SafetyOutlined,
  CalendarOutlined,
  MonitorOutlined,
  HistoryOutlined,
  IdcardOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  KeyOutlined,
  LockOutlined
} from '@ant-design/icons-vue';
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// 配置 NProgress
NProgress.configure({
  showSpinner: false, // 不显示加载图标
  speed: 500, // 动画速度
  minimum: 0.3, // 最小百分比
});

const router = useRouter();
const route = useRoute();

const collapsed = ref(false);
const selectedKeys = ref(['dashboard']);

// 面包屑导航
const breadcrumbMap = {
  // 工作台
  dashboard: { parent: '工作台', current: '数据概览' },

  // 数据管理
  'data-overview': { parent: '数据管理', current: '数据概览' },
  'data-analysis': { parent: '数据管理', current: '数据分析' },
  'data-report': { parent: '数据管理', current: '数据报表' },

  // 业务管理
  orders: { parent: '业务管理', current: '订单管理' },
  routes: { parent: '业务管理', current: '路线管理' },
  customers: { parent: '业务管理', current: '客户管理' },
  contracts: { parent: '业务管理', current: '合同管理' },

  // 车辆管理
  vehicles: { parent: '车辆管理', current: '车辆档案' },
  'vehicle-maintenance': { parent: '车辆管理', current: '维修保养' },
  'vehicle-insurance': { parent: '车辆管理', current: '保险管理' },
  'vehicle-fuel': { parent: '车辆管理', current: '油耗管理' },

  // 调度管理
  'dispatch-plan': { parent: '调度管理', current: '调度计划' },
  'dispatch-monitor': { parent: '调度管理', current: '实时监控' },
  'dispatch-history': { parent: '调度管理', current: '调度历史' },

  // 员工管理
  drivers: { parent: '员工管理', current: '司机管理' },
  staff: { parent: '员工管理', current: '员工档案' },
  attendance: { parent: '员工管理', current: '考勤管理' },
  salary: { parent: '员工管理', current: '薪资管理' },

  // 系统管理
  profile: { parent: '系统管理', current: '个人资料' },
  settings: { parent: '系统管理', current: '系统设置' },
  roles: { parent: '系统管理', current: '角色管理' },
  permissions: { parent: '系统管理', current: '权限管理' },
};

const currentBreadcrumb = computed(() => {
  const routeName = route.name?.toLowerCase();
  return breadcrumbMap[routeName] || { parent: '系统', current: '页面' };
});

// 菜单点击处理
const handleMenuClick = ({ key }) => {
  selectedKeys.value = [key];

  // 路由跳转
  const routeMap = {
    // 工作台
    dashboard: '/dashboard',

    // 数据管理
    'data-overview': '/data/overview',
    'data-analysis': '/data/analysis',
    'data-report': '/data/report',

    // 业务管理
    orders: '/business/orders',
    routes: '/business/routes',
    customers: '/business/customers',
    contracts: '/business/contracts',

    // 车辆管理
    vehicles: '/vehicle/list',
    'vehicle-maintenance': '/vehicle/maintenance',
    'vehicle-insurance': '/vehicle/insurance',
    'vehicle-fuel': '/vehicle/fuel',

    // 调度管理
    'dispatch-plan': '/dispatch/plan',
    'dispatch-monitor': '/dispatch/monitor',
    'dispatch-history': '/dispatch/history',

    // 员工管理
    drivers: '/staff/drivers',
    staff: '/staff/list',
    attendance: '/staff/attendance',
    salary: '/staff/salary',

    // 系统管理
    profile: '/profile',
    settings: '/settings',
    roles: '/system/roles',
    permissions: '/system/permissions',
  };

  if (routeMap[key]) {
    router.push(routeMap[key]);
  }
};

// 监听路由变化更新选中的菜单项
watch(route, (newRoute) => {
  const path = newRoute.path;

  // 根据路由路径设置选中的菜单项
  if (path === '/dashboard') {
    selectedKeys.value = ['dashboard'];
  } else if (path.startsWith('/data/')) {
    const dataRoutes = {
      '/data/overview': 'data-overview',
      '/data/analysis': 'data-analysis',
      '/data/report': 'data-report',
    };
    selectedKeys.value = [dataRoutes[path] || 'data-overview'];
  } else if (path.startsWith('/business/')) {
    const businessRoutes = {
      '/business/orders': 'orders',
      '/business/routes': 'routes',
      '/business/customers': 'customers',
      '/business/contracts': 'contracts',
    };
    selectedKeys.value = [businessRoutes[path] || 'orders'];
  } else if (path.startsWith('/vehicle/')) {
    const vehicleRoutes = {
      '/vehicle/list': 'vehicles',
      '/vehicle/maintenance': 'vehicle-maintenance',
      '/vehicle/insurance': 'vehicle-insurance',
      '/vehicle/fuel': 'vehicle-fuel',
    };
    selectedKeys.value = [vehicleRoutes[path] || 'vehicles'];
  } else if (path.startsWith('/dispatch/')) {
    const dispatchRoutes = {
      '/dispatch/plan': 'dispatch-plan',
      '/dispatch/monitor': 'dispatch-monitor',
      '/dispatch/history': 'dispatch-history',
    };
    selectedKeys.value = [dispatchRoutes[path] || 'dispatch-plan'];
  } else if (path.startsWith('/staff/')) {
    const staffRoutes = {
      '/staff/drivers': 'drivers',
      '/staff/list': 'staff',
      '/staff/attendance': 'attendance',
      '/staff/salary': 'salary',
    };
    selectedKeys.value = [staffRoutes[path] || 'staff'];
  } else if (path === '/profile') {
    selectedKeys.value = ['profile'];
  } else if (path === '/settings') {
    selectedKeys.value = ['settings'];
  } else if (path.startsWith('/system/')) {
    const systemRoutes = {
      '/system/roles': 'roles',
      '/system/permissions': 'permissions',
    };
    selectedKeys.value = [systemRoutes[path] || 'roles'];
  } else {
    selectedKeys.value = ['dashboard'];
  }
}, { immediate: true });

// 退出登录处理
const handleLogout = () => {
  // 清除本地存储的用户信息
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');

  // 跳转到登录页
  router.push('/login');
};
</script>
<style scoped>
.logo {
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 6px;
}

.ant-layout-sider {
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
}

.ant-menu-dark {
  background: transparent;
}

.ant-menu-dark .ant-menu-item-selected {
  background-color: #1890ff;
}

.ant-menu-dark .ant-menu-item:hover {
  background-color: rgba(24, 144, 255, 0.2);
}
</style>

<style>
/* NProgress 自定义样式 */
#nprogress .bar {
  background: #1890ff !important;
  height: 3px !important;
}

#nprogress .peg {
  box-shadow: 0 0 10px #1890ff, 0 0 5px #1890ff !important;
}

#nprogress .spinner-icon {
  border-top-color: #1890ff !important;
  border-left-color: #1890ff !important;
}
</style>
