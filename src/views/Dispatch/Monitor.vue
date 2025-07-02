<template>
  <div class="real-time-monitor">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <RadarChartOutlined />
        实时监控
      </h1>
      <p>实时监控车辆位置、运输状态，确保运输安全高效</p>
      <div class="header-actions">
        <a-space>
          <a-switch v-model:checked="autoRefresh" checked-children="自动刷新" un-checked-children="手动刷新" />
          <a-select v-model:value="refreshInterval" style="width: 120px" :disabled="!autoRefresh">
            <a-select-option :value="5">5秒</a-select-option>
            <a-select-option :value="10">10秒</a-select-option>
            <a-select-option :value="30">30秒</a-select-option>
            <a-select-option :value="60">1分钟</a-select-option>
          </a-select>
          <a-button @click="handleRefresh" :loading="refreshing">
            <ReloadOutlined />
            刷新
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 监控概览 -->
    <a-row :gutter="[16, 16]" class="overview-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="overview-card">
          <a-statistic
            title="在线车辆"
            :value="monitorStats.onlineVehicles"
            :total="monitorStats.totalVehicles"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <CarOutlined />
            </template>
            <template #suffix>
              <span class="total-text">/ {{ monitorStats.totalVehicles }}</span>
            </template>
          </a-statistic>
          <div class="progress-bar">
            <a-progress
              :percent="Math.round((monitorStats.onlineVehicles / monitorStats.totalVehicles) * 100)"
              size="small"
              :show-info="false"
              stroke-color="#52c41a"
            />
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="overview-card">
          <a-statistic
            title="运输中"
            :value="monitorStats.inTransit"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <SendOutlined />
            </template>
          </a-statistic>
          <div class="status-indicator">
            <a-badge status="processing" text="正在运输" />
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="overview-card">
          <a-statistic
            title="异常车辆"
            :value="monitorStats.abnormalVehicles"
            :value-style="{ color: '#ff4d4f' }"
          >
            <template #prefix>
              <ExclamationCircleOutlined />
            </template>
          </a-statistic>
          <div class="status-indicator">
            <a-badge status="error" text="需要关注" />
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="overview-card">
          <a-statistic
            title="平均速度"
            :value="monitorStats.avgSpeed"
            suffix="km/h"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <DashboardOutlined />
            </template>
          </a-statistic>
          <div class="speed-indicator">
            <a-progress
              type="circle"
              :percent="Math.round((monitorStats.avgSpeed / 120) * 100)"
              :width="40"
              :stroke-width="8"
              :show-info="false"
            />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 地图和车辆列表 -->
    <a-row :gutter="[16, 16]" class="main-content">
      <!-- 地图区域 -->
      <a-col :xs="24" :lg="16">
        <a-card title="实时地图" class="map-card">
          <template #extra>
            <a-space>
              <a-select v-model:value="mapView" size="small" style="width: 100px">
                <a-select-option value="all">全部</a-select-option>
                <a-select-option value="transit">运输中</a-select-option>
                <a-select-option value="abnormal">异常</a-select-option>
              </a-select>
              <a-button size="small" @click="centerMap">
                <AimOutlined />
                居中
              </a-button>
              <a-button size="small" @click="toggleFullscreen">
                <FullscreenOutlined />
                全屏
              </a-button>
            </a-space>
          </template>

          <div ref="mapContainer" class="map-container">
            <!-- 地图占位区域 -->
            <div class="map-placeholder">
              <EnvironmentOutlined style="font-size: 48px; color: #d9d9d9;" />
              <p>地图区域 (可集成百度地图/高德地图)</p>

              <!-- 模拟车辆位置点 -->
              <div class="vehicle-markers">
                <div
                  v-for="vehicle in filteredVehicles"
                  :key="vehicle.id"
                  class="vehicle-marker"
                  :class="getVehicleMarkerClass(vehicle.status)"
                  :style="getVehiclePosition(vehicle)"
                  @click="selectVehicle(vehicle)"
                >
                  <CarOutlined />
                  <span class="vehicle-label">{{ vehicle.plateNumber }}</span>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 车辆列表 -->
      <a-col :xs="24" :lg="8">
        <a-card title="车辆状态" class="vehicle-list-card">
          <template #extra>
            <a-input-search
              v-model:value="vehicleSearch"
              placeholder="搜索车牌号"
              size="small"
              style="width: 150px"
            />
          </template>

          <div class="vehicle-list">
            <a-list
              :data-source="filteredVehicleList"
              size="small"
            >
              <template #renderItem="{ item }">
                <a-list-item
                  class="vehicle-item"
                  :class="{ active: selectedVehicle?.id === item.id }"
                  @click="selectVehicle(item)"
                >
                  <a-list-item-meta>
                    <template #avatar>
                      <a-avatar :style="{ backgroundColor: getStatusColor(item.status) }">
                        <CarOutlined />
                      </a-avatar>
                    </template>
                    <template #title>
                      <div class="vehicle-title">
                        <span>{{ item.plateNumber }}</span>
                        <a-tag :color="getStatusColor(item.status)" size="small">
                          {{ getStatusText(item.status) }}
                        </a-tag>
                      </div>
                    </template>
                    <template #description>
                      <div class="vehicle-info">
                        <div>司机：{{ item.driver }}</div>
                        <div>位置：{{ item.location }}</div>
                        <div>速度：{{ item.speed }}km/h</div>
                        <div>更新：{{ formatTime(item.lastUpdate) }}</div>
                      </div>
                    </template>
                  </a-list-item-meta>

                  <template #actions>
                    <a @click.stop="trackVehicle(item)">跟踪</a>
                    <a @click.stop="contactDriver(item)">联系</a>
                  </template>
                </a-list-item>
              </template>
            </a-list>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 车辆详情面板 -->
    <a-card v-if="selectedVehicle" title="车辆详情" class="vehicle-detail-card">
      <template #extra>
        <a-button size="small" @click="closeVehicleDetail">
          <CloseOutlined />
          关闭
        </a-button>
      </template>

      <a-row :gutter="[24, 16]">
        <a-col :xs="24" :md="8">
          <a-descriptions title="基本信息" :column="1" size="small">
            <a-descriptions-item label="车牌号">{{ selectedVehicle.plateNumber }}</a-descriptions-item>
            <a-descriptions-item label="司机">{{ selectedVehicle.driver }}</a-descriptions-item>
            <a-descriptions-item label="联系电话">{{ selectedVehicle.phone }}</a-descriptions-item>
            <a-descriptions-item label="车辆状态">
              <a-tag :color="getStatusColor(selectedVehicle.status)">
                {{ getStatusText(selectedVehicle.status) }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </a-col>

        <a-col :xs="24" :md="8">
          <a-descriptions title="位置信息" :column="1" size="small">
            <a-descriptions-item label="当前位置">{{ selectedVehicle.location }}</a-descriptions-item>
            <a-descriptions-item label="经纬度">{{ selectedVehicle.coordinates }}</a-descriptions-item>
            <a-descriptions-item label="当前速度">{{ selectedVehicle.speed }}km/h</a-descriptions-item>
            <a-descriptions-item label="最后更新">{{ formatTime(selectedVehicle.lastUpdate) }}</a-descriptions-item>
          </a-descriptions>
        </a-col>

        <a-col :xs="24" :md="8">
          <a-descriptions title="运输信息" :column="1" size="small">
            <a-descriptions-item label="当前订单">{{ selectedVehicle.currentOrder || '无' }}</a-descriptions-item>
            <a-descriptions-item label="目的地">{{ selectedVehicle.destination || '无' }}</a-descriptions-item>
            <a-descriptions-item label="预计到达">{{ selectedVehicle.eta || '无' }}</a-descriptions-item>
            <a-descriptions-item label="运输进度">
              <a-progress :percent="selectedVehicle.progress || 0" size="small" />
            </a-descriptions-item>
          </a-descriptions>
        </a-col>
      </a-row>

      <a-divider />

      <a-row :gutter="16">
        <a-col :span="24">
          <a-space>
            <a-button type="primary" @click="trackVehicle(selectedVehicle)">
              <AimOutlined />
              实时跟踪
            </a-button>
            <a-button @click="contactDriver(selectedVehicle)">
              <PhoneOutlined />
              联系司机
            </a-button>
            <a-button @click="viewHistory(selectedVehicle)">
              <HistoryOutlined />
              历史轨迹
            </a-button>
            <a-button @click="sendMessage(selectedVehicle)">
              <MessageOutlined />
              发送消息
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  RadarChartOutlined,
  ReloadOutlined,
  CarOutlined,
  SendOutlined,
  ExclamationCircleOutlined,
  DashboardOutlined,
  AimOutlined,
  FullscreenOutlined,
  EnvironmentOutlined,
  CloseOutlined,
  PhoneOutlined,
  HistoryOutlined,
  MessageOutlined
} from '@ant-design/icons-vue'
import { vehicleData } from '@/data/mockData.js'

// 自动刷新控制
const autoRefresh = ref(true)
const refreshInterval = ref(10)
const refreshing = ref(false)
let refreshTimer = null

// 地图控制
const mapView = ref('all')
const mapContainer = ref(null)

// 车辆搜索
const vehicleSearch = ref('')

// 选中的车辆
const selectedVehicle = ref(null)

// 监控统计数据
const monitorStats = ref({
  totalVehicles: 25,
  onlineVehicles: 22,
  inTransit: 15,
  abnormalVehicles: 2,
  avgSpeed: 65
})

// 实时车辆数据
const vehicles = ref([
  {
    id: 'V001',
    plateNumber: '京A12345',
    driver: '张师傅',
    phone: '13800138001',
    status: 'transit',
    location: '北京市朝阳区',
    coordinates: '116.4074, 39.9042',
    speed: 60,
    lastUpdate: new Date(),
    currentOrder: 'ORD001',
    destination: '天津市',
    eta: '2024-07-02 15:30',
    progress: 65,
    x: 20,
    y: 30
  },
  {
    id: 'V002',
    plateNumber: '沪C11111',
    driver: '李师傅',
    phone: '13800138002',
    status: 'online',
    location: '上海市浦东新区',
    coordinates: '121.4737, 31.2304',
    speed: 0,
    lastUpdate: new Date(),
    currentOrder: null,
    destination: null,
    eta: null,
    progress: 0,
    x: 60,
    y: 70
  },
  {
    id: 'V003',
    plateNumber: '粤B88888',
    driver: '王师傅',
    phone: '13800138003',
    status: 'abnormal',
    location: '深圳市南山区',
    coordinates: '113.9308, 22.5329',
    speed: 0,
    lastUpdate: dayjs().subtract(30, 'minute').toDate(),
    currentOrder: 'ORD003',
    destination: '广州市',
    eta: '2024-07-02 16:00',
    progress: 30,
    x: 80,
    y: 20
  },
  {
    id: 'V004',
    plateNumber: '川A66666',
    driver: '赵师傅',
    phone: '13800138004',
    status: 'transit',
    location: '成都市锦江区',
    coordinates: '104.0665, 30.5728',
    speed: 75,
    lastUpdate: new Date(),
    currentOrder: 'ORD004',
    destination: '重庆市',
    eta: '2024-07-02 17:30',
    progress: 80,
    x: 40,
    y: 50
  },
  {
    id: 'V005',
    plateNumber: '鲁D33333',
    driver: '钱师傅',
    phone: '13800138005',
    status: 'offline',
    location: '济南市历下区',
    coordinates: '117.0009, 36.6758',
    speed: 0,
    lastUpdate: dayjs().subtract(2, 'hour').toDate(),
    currentOrder: null,
    destination: null,
    eta: null,
    progress: 0,
    x: 30,
    y: 80
  }
])

// 过滤后的车辆（地图显示）
const filteredVehicles = computed(() => {
  let result = vehicles.value

  if (mapView.value === 'transit') {
    result = result.filter(v => v.status === 'transit')
  } else if (mapView.value === 'abnormal') {
    result = result.filter(v => v.status === 'abnormal')
  }

  return result
})

// 过滤后的车辆列表
const filteredVehicleList = computed(() => {
  let result = vehicles.value

  if (vehicleSearch.value) {
    const keyword = vehicleSearch.value.toLowerCase()
    result = result.filter(v =>
      v.plateNumber.toLowerCase().includes(keyword) ||
      v.driver.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 获取车辆状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    online: '#52c41a',
    transit: '#1890ff',
    abnormal: '#ff4d4f',
    offline: '#d9d9d9'
  }
  return colorMap[status] || '#d9d9d9'
}

// 获取车辆状态文本
const getStatusText = (status) => {
  const textMap = {
    online: '在线',
    transit: '运输中',
    abnormal: '异常',
    offline: '离线'
  }
  return textMap[status] || '未知'
}

// 获取车辆标记样式类
const getVehicleMarkerClass = (status) => {
  return `marker-${status}`
}

// 获取车辆在地图上的位置
const getVehiclePosition = (vehicle) => {
  return {
    left: `${vehicle.x}%`,
    top: `${vehicle.y}%`
  }
}

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).format('HH:mm:ss')
}

// 刷新数据
const handleRefresh = () => {
  refreshing.value = true

  // 模拟数据更新
  vehicles.value.forEach(vehicle => {
    if (vehicle.status === 'transit') {
      vehicle.speed = Math.floor(Math.random() * 40) + 40 // 40-80 km/h
      vehicle.progress = Math.min(vehicle.progress + Math.random() * 5, 100)
    }
    vehicle.lastUpdate = new Date()
  })

  setTimeout(() => {
    refreshing.value = false
    message.success('数据已刷新')
  }, 1000)
}

// 选择车辆
const selectVehicle = (vehicle) => {
  selectedVehicle.value = vehicle
}

// 关闭车辆详情
const closeVehicleDetail = () => {
  selectedVehicle.value = null
}

// 跟踪车辆
const trackVehicle = (vehicle) => {
  message.info(`开始跟踪车辆 ${vehicle.plateNumber}`)
}

// 联系司机
const contactDriver = (vehicle) => {
  message.info(`拨打电话 ${vehicle.phone}`)
}

// 查看历史轨迹
const viewHistory = (vehicle) => {
  message.info(`查看车辆 ${vehicle.plateNumber} 的历史轨迹`)
}

// 发送消息
const sendMessage = (vehicle) => {
  message.info(`向司机 ${vehicle.driver} 发送消息`)
}

// 地图居中
const centerMap = () => {
  message.info('地图已居中')
}

// 切换全屏
const toggleFullscreen = () => {
  message.info('切换全屏模式')
}

// 启动自动刷新
const startAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }

  if (autoRefresh.value) {
    refreshTimer = setInterval(() => {
      handleRefresh()
    }, refreshInterval.value * 1000)
  }
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 监听自动刷新设置变化
const watchAutoRefresh = () => {
  if (autoRefresh.value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

onMounted(() => {
  // 初始化自动刷新
  if (autoRefresh.value) {
    startAutoRefresh()
  }
})

onUnmounted(() => {
  // 清理定时器
  stopAutoRefresh()
})
</script>

<style lang="scss" scoped>
.real-time-monitor {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

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

  .header-actions {
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;

    .header-actions {
      width: 100%;
    }
  }
}

.overview-cards {
  margin-bottom: 24px;
}

.overview-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: none;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  .total-text {
    color: #8c8c8c;
    font-size: 14px;
  }

  .progress-bar {
    margin-top: 12px;
  }

  .status-indicator {
    margin-top: 12px;
  }

  .speed-indicator {
    margin-top: 12px;
    display: flex;
    justify-content: center;
  }
}

.main-content {
  margin-bottom: 24px;
}

.map-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: none;

  .map-container {
    height: 500px;
    position: relative;
    border-radius: 8px;
    overflow: hidden;

    .map-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;

      p {
        margin: 16px 0 0 0;
        color: #8c8c8c;
        font-size: 16px;
      }
    }

    .vehicle-markers {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;

      .vehicle-marker {
        position: absolute;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        cursor: pointer;
        pointer-events: auto;
        transition: all 0.3s;

        &:hover {
          transform: scale(1.2);
          z-index: 10;

          .vehicle-label {
            opacity: 1;
            transform: translateY(-100%);
          }
        }

        &.marker-online {
          background: #52c41a;
        }

        &.marker-transit {
          background: #1890ff;
          animation: pulse 2s infinite;
        }

        &.marker-abnormal {
          background: #ff4d4f;
          animation: blink 1s infinite;
        }

        &.marker-offline {
          background: #d9d9d9;
        }

        .vehicle-label {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          white-space: nowrap;
          opacity: 0;
          transition: all 0.3s;
          pointer-events: none;
        }
      }
    }
  }
}

.vehicle-list-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: none;

  .vehicle-list {
    max-height: 500px;
    overflow-y: auto;

    .vehicle-item {
      cursor: pointer;
      transition: all 0.3s;
      border-radius: 8px;
      margin-bottom: 8px;
      padding: 8px;

      &:hover {
        background: #f5f5f5;
      }

      &.active {
        background: #e6f7ff;
        border: 1px solid #91d5ff;
      }

      .vehicle-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 4px;
      }

      .vehicle-info {
        font-size: 12px;
        color: #8c8c8c;
        line-height: 1.4;

        div {
          margin-bottom: 2px;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }
}

.vehicle-detail-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: none;
}

// 动画效果
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(24, 144, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
  }
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0.5;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .real-time-monitor {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .map-container {
    height: 300px;
  }

  .vehicle-list {
    max-height: 300px;
  }
}
</style>
