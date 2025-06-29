import { createRouter, createWebHashHistory } from 'vue-router';
import Login from '@/views/Login/index.vue';
import Layout from '@/views/Layout/index.vue';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

const router= createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: '布局',
      component: Layout,
      redirect: '/dashboard',
      children: [
        // 工作台
        {
          path: 'dashboard',
          name: '工作台',
          component: () => import('@/views/Dashboard/index.vue'),
          meta: {
            title: '工作台 - 车辆物流管理系统'
          }
        },

        // 数据管理
        {
          path: 'data/overview',
          name: '数据概览',
          component: () => import('@/views/Data/Overview.vue'),
          meta: {
            title: '数据概览 - 车辆物流管理系统'
          }
        },
        {
          path: 'data/analysis',
          name: '数据分析',
          component: () => import('@/views/Data/Analysis.vue'),
          meta: {
            title: '数据分析 - 车辆物流管理系统'
          }
        },
        {
          path: 'data/report',
          name: '数据报表',
          component: () => import('@/views/Data/Report.vue'),
          meta: {
            title: '数据报表 - 车辆物流管理系统'
          }
        },

        // 业务管理
        {
          path: 'business/orders',
          name: '订单管理',
          component: () => import('@/views/Business/Orders.vue'),
          meta: {
            title: '订单管理 - 车辆物流管理系统'
          }
        },
        {
          path: 'business/routes',
          name: '路线管理',
          component: () => import('@/views/Business/Routes.vue'),
          meta: {
            title: '路线管理 - 车辆物流管理系统'
          }
        },
        {
          path: 'business/customers',
          name: '客户管理',
          component: () => import('@/views/Business/Customers.vue'),
          meta: {
            title: '客户管理 - 车辆物流管理系统'
          }
        },
        {
          path: 'business/contracts',
          name: '合同管理',
          component: () => import('@/views/Business/Contracts.vue'),
          meta: {
            title: '合同管理 - 车辆物流管理系统'
          }
        },

        // 车辆管理
        {
          path: 'vehicle/list',
          name: '车辆档案',
          component: () => import('@/views/Vehicle/List.vue'),
          meta: {
            title: '车辆档案 - 车辆物流管理系统'
          }
        },
        {
          path: 'vehicle/maintenance',
          name: '维修保养',
          component: () => import('@/views/Vehicle/Maintenance.vue'),
          meta: {
            title: '维修保养 - 车辆物流管理系统'
          }
        },
        {
          path: 'vehicle/insurance',
          name: '保险管理',
          component: () => import('@/views/Vehicle/Insurance.vue'),
          meta: {
            title: '保险管理 - 车辆物流管理系统'
          }
        },
        {
          path: 'vehicle/fuel',
          name: '油耗管理',
          component: () => import('@/views/Vehicle/Fuel.vue'),
          meta: {
            title: '油耗管理 - 车辆物流管理系统'
          }
        },

        // 调度管理
        {
          path: 'dispatch/plan',
          name: '调度计划',
          component: () => import('@/views/Dispatch/Plan.vue'),
          meta: {
            title: '调度计划 - 车辆物流管理系统'
          }
        },
        {
          path: 'dispatch/monitor',
          name: '实时监控',
          component: () => import('@/views/Dispatch/Monitor.vue'),
          meta: {
            title: '实时监控 - 车辆物流管理系统'
          }
        },
        {
          path: 'dispatch/history',
          name: '调度历史',
          component: () => import('@/views/Dispatch/History.vue'),
          meta: {
            title: '调度历史 - 车辆物流管理系统'
          }
        },

        // 员工管理
        {
          path: 'staff/drivers',
          name: '司机管理',
          component: () => import('@/views/Staff/Drivers.vue'),
          meta: {
            title: '司机管理 - 车辆物流管理系统'
          }
        },
        {
          path: 'staff/list',
          name: '员工档案',
          component: () => import('@/views/Staff/List.vue'),
          meta: {
            title: '员工档案 - 车辆物流管理系统'
          }
        },
        {
          path: 'staff/attendance',
          name: '考勤管理',
          component: () => import('@/views/Staff/Attendance.vue'),
          meta: {
            title: '考勤管理 - 车辆物流管理系统'
          }
        },
        {
          path: 'staff/salary',
          name: '薪资管理',
          component: () => import('@/views/Staff/Salary.vue'),
          meta: {
            title: '薪资管理 - 车辆物流管理系统'
          }
        },

        // 系统管理
        {
          path: 'profile',
          name: '个人资料',
          component: () => import('@/views/Profile/index.vue'),
          meta: {
            title: '个人资料 - 车辆物流管理系统'
          }
        },
        {
          path: 'settings',
          name: '系统设置',
          component: () => import('@/views/Settings/index.vue'),
          meta: {
            title: '系统设置 - 车辆物流管理系统'
          }
        },
        {
          path: 'system/roles',
          name: '角色管理',
          component: () => import('@/views/System/Roles.vue'),
          meta: {
            title: '角色管理 - 车辆物流管理系统'
          }
        },
        {
          path: 'system/permissions',
          name: '权限管理',
          component: () => import('@/views/System/Permissions.vue'),
          meta: {
            title: '权限管理 - 车辆物流管理系统'
          }
        },
      ],
    },
    {
      path: '/login',
      name: '登录',
      component: Login,
      meta: {
        title: '用户登录 - 管理系统'
      }
    },
  ],
});

// 配置 NProgress
NProgress.configure({
  showSpinner: false,
  speed: 500,
  minimum: 0.3,
});

// 路由前置守卫
router.beforeEach((to, from, next) => {
  // 开始进度条
  NProgress.start();

  // 动态设置页面标题
  if (to.meta && to.meta.title) {
    document.title = to.meta.title;
  } else {
    // 默认标题
    document.title = '管理系统';
  }

  next();
});

// 路由后置守卫
router.afterEach(() => {
  // 完成进度条
  NProgress.done();
});

export default router;
