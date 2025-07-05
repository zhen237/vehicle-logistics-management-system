# 车辆物流管理系统 - 后端API接口文档

## 📋 目录
- [1. 认证授权接口](#1-认证授权接口)
- [2. 用户管理接口](#2-用户管理接口)
- [3. 角色权限接口](#3-角色权限接口)
- [4. 工作台接口](#4-工作台接口)
- [5. 数据管理接口](#5-数据管理接口)
- [6. 业务管理接口](#6-业务管理接口)
- [7. 车辆管理接口](#7-车辆管理接口)
- [8. 调度管理接口](#8-调度管理接口)
- [9. 员工管理接口](#9-员工管理接口)
- [10. 系统管理接口](#10-系统管理接口)

## 🔧 接口规范

### 基础信息
- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token
- **字符编码**: UTF-8

### 统一响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": "2024-07-05T10:30:00Z"
}
```

### 状态码说明
- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 1. 认证授权接口

### 1.1 用户登录
- **接口**: `POST /auth/login`
- **描述**: 用户登录获取访问令牌
- **请求参数**:
```json
{
  "username": "admin",
  "password": "123456",
  "captcha": "ABCD",
  "captchaId": "uuid-string"
}
```
- **响应数据**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh-token-string",
  "expiresIn": 7200,
  "userInfo": {
    "id": "USER001",
    "username": "admin",
    "name": "管理员",
    "avatar": "avatar-url",
    "roles": ["admin"],
    "permissions": ["system:*"]
  }
}
```

### 1.2 刷新令牌
- **接口**: `POST /auth/refresh`
- **描述**: 使用刷新令牌获取新的访问令牌
- **请求参数**:
```json
{
  "refreshToken": "refresh-token-string"
}
```

### 1.3 用户登出
- **接口**: `POST /auth/logout`
- **描述**: 用户登出，使令牌失效
- **请求头**: `Authorization: Bearer {token}`

### 1.4 获取验证码
- **接口**: `GET /auth/captcha`
- **描述**: 获取图形验证码
- **响应数据**:
```json
{
  "captchaId": "uuid-string",
  "captchaImage": "data:image/png;base64,..."
}
```

---

## 2. 用户管理接口

### 2.1 获取用户列表
- **接口**: `GET /users`
- **描述**: 分页获取用户列表
- **查询参数**:
  - `page`: 页码 (默认: 1)
  - `pageSize`: 每页数量 (默认: 10)
  - `keyword`: 搜索关键词
  - `status`: 用户状态 (active/inactive)
  - `role`: 角色筛选
- **响应数据**:
```json
{
  "list": [
    {
      "id": "USER001",
      "username": "admin",
      "name": "管理员",
      "email": "admin@example.com",
      "phone": "13800138000",
      "avatar": "avatar-url",
      "status": "active",
      "roles": ["admin"],
      "lastLoginTime": "2024-07-05T10:30:00Z",
      "createTime": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 10
}
```

### 2.2 创建用户
- **接口**: `POST /users`
- **描述**: 创建新用户
- **请求参数**:
```json
{
  "username": "newuser",
  "name": "新用户",
  "email": "newuser@example.com",
  "phone": "13800138001",
  "password": "123456",
  "roles": ["user"],
  "status": "active"
}
```

### 2.3 更新用户
- **接口**: `PUT /users/{id}`
- **描述**: 更新用户信息
- **请求参数**: 同创建用户

### 2.4 删除用户
- **接口**: `DELETE /users/{id}`
- **描述**: 删除用户

### 2.5 重置密码
- **接口**: `POST /users/{id}/reset-password`
- **描述**: 重置用户密码
- **请求参数**:
```json
{
  "newPassword": "newpassword123"
}
```

### 2.6 获取用户详情
- **接口**: `GET /users/{id}`
- **描述**: 获取用户详细信息

### 2.7 更新用户状态
- **接口**: `PATCH /users/{id}/status`
- **描述**: 启用/禁用用户
- **请求参数**:
```json
{
  "status": "active"
}
```

---

## 3. 角色权限接口

### 3.1 获取角色列表
- **接口**: `GET /roles`
- **描述**: 获取角色列表
- **查询参数**:
  - `page`: 页码
  - `pageSize`: 每页数量
  - `keyword`: 搜索关键词
  - `type`: 角色类型 (system/business/custom)
  - `status`: 角色状态 (active/inactive)

### 3.2 创建角色
- **接口**: `POST /roles`
- **描述**: 创建新角色
- **请求参数**:
```json
{
  "name": "调度员",
  "code": "dispatcher",
  "description": "负责车辆调度管理",
  "type": "business",
  "permissions": ["dispatch:*", "vehicle:view"]
}
```

### 3.3 更新角色
- **接口**: `PUT /roles/{id}`
- **描述**: 更新角色信息

### 3.4 删除角色
- **接口**: `DELETE /roles/{id}`
- **描述**: 删除角色

### 3.5 获取权限树
- **接口**: `GET /permissions/tree`
- **描述**: 获取权限树形结构
- **响应数据**:
```json
[
  {
    "id": "PERM001",
    "name": "系统管理",
    "code": "system",
    "type": "menu",
    "children": [
      {
        "id": "PERM001001",
        "name": "用户管理",
        "code": "system:user",
        "type": "menu",
        "children": [
          {
            "id": "PERM001001001",
            "name": "新增用户",
            "code": "system:user:add",
            "type": "operation"
          }
        ]
      }
    ]
  }
]
```

### 3.6 分配角色权限
- **接口**: `PUT /roles/{id}/permissions`
- **描述**: 为角色分配权限
- **请求参数**:
```json
{
  "permissionIds": ["PERM001", "PERM002", "PERM003"]
}
```

### 3.7 分配用户角色
- **接口**: `PUT /users/{id}/roles`
- **描述**: 为用户分配角色
- **请求参数**:
```json
{
  "roleIds": ["ROLE001", "ROLE002"]
}
```

---

## 4. 工作台接口

### 4.1 获取工作台统计数据
- **接口**: `GET /dashboard/statistics`
- **描述**: 获取工作台统计数据
- **响应数据**:
```json
{
  "overview": {
    "totalOrders": 1250,
    "totalVehicles": 85,
    "totalDrivers": 120,
    "totalRevenue": 2580000
  },
  "todayData": {
    "newOrders": 25,
    "completedOrders": 18,
    "activeVehicles": 68,
    "onDutyDrivers": 95
  },
  "trends": {
    "orderTrend": [120, 132, 101, 134, 90, 230, 210],
    "revenueTrend": [820, 932, 901, 934, 1290, 1330, 1320]
  }
}
```

### 4.2 获取实时监控数据
- **接口**: `GET /dashboard/realtime`
- **描述**: 获取实时监控数据
- **响应数据**:
```json
{
  "vehicleStatus": {
    "online": 68,
    "offline": 17,
    "maintenance": 3,
    "total": 88
  },
  "orderStatus": {
    "pending": 15,
    "inProgress": 32,
    "completed": 18,
    "cancelled": 2
  },
  "alerts": [
    {
      "id": "ALERT001",
      "type": "warning",
      "message": "车辆京A12345超速行驶",
      "time": "2024-07-05T10:30:00Z"
    }
  ]
}
```

### 4.3 获取待办事项
- **接口**: `GET /dashboard/todos`
- **描述**: 获取当前用户待办事项
- **响应数据**:
```json
[
  {
    "id": "TODO001",
    "title": "审批运输合同HT2024001",
    "type": "approval",
    "priority": "high",
    "deadline": "2024-07-06T18:00:00Z",
    "status": "pending"
  }
]
```

---

## 5. 数据管理接口

### 5.1 获取数据概览
- **接口**: `GET /data/overview`
- **描述**: 获取数据概览统计
- **查询参数**:
  - `period`: 时间周期 (day/week/month/year)
  - `startDate`: 开始日期
  - `endDate`: 结束日期

### 5.2 获取数据分析
- **接口**: `GET /data/analysis`
- **描述**: 获取数据分析结果
- **查询参数**:
  - `type`: 分析类型 (order/vehicle/revenue/efficiency)
  - `dimension`: 分析维度 (time/region/category)

### 5.3 生成数据报表
- **接口**: `POST /data/reports`
- **描述**: 生成数据报表
- **请求参数**:
```json
{
  "type": "monthly",
  "template": "comprehensive",
  "dateRange": ["2024-06-01", "2024-06-30"],
  "format": "pdf",
  "delivery": "email"
}
```

### 5.4 获取报表列表
- **接口**: `GET /data/reports`
- **描述**: 获取历史报表列表

### 5.5 下载报表
- **接口**: `GET /data/reports/{id}/download`
- **描述**: 下载报表文件

---

## 6. 业务管理接口

### 6.1 订单管理

#### 6.1.1 获取订单列表
- **接口**: `GET /orders`
- **描述**: 分页获取订单列表
- **查询参数**:
  - `page`: 页码
  - `pageSize`: 每页数量
  - `keyword`: 搜索关键词
  - `status`: 订单状态
  - `customerId`: 客户ID
  - `startDate`: 开始日期
  - `endDate`: 结束日期

#### 6.1.2 创建订单
- **接口**: `POST /orders`
- **描述**: 创建新订单
- **请求参数**:
```json
{
  "orderNo": "ORD2024001",
  "customerId": "CUST001",
  "origin": "北京市朝阳区",
  "destination": "天津市",
  "cargoType": "电子产品",
  "weight": 2.5,
  "volume": 8.0,
  "value": 50000,
  "pickupTime": "2024-07-06T09:00:00Z",
  "deliveryTime": "2024-07-06T18:00:00Z",
  "requirements": "轻拿轻放，防潮",
  "contactPerson": "张先生",
  "contactPhone": "13800138000"
}
```

#### 6.1.3 更新订单
- **接口**: `PUT /orders/{id}`
- **描述**: 更新订单信息

#### 6.1.4 删除订单
- **接口**: `DELETE /orders/{id}`
- **描述**: 删除订单

#### 6.1.5 获取订单详情
- **接口**: `GET /orders/{id}`
- **描述**: 获取订单详细信息

#### 6.1.6 更新订单状态
- **接口**: `PATCH /orders/{id}/status`
- **描述**: 更新订单状态
- **请求参数**:
```json
{
  "status": "in_progress",
  "remark": "已安排车辆，正在运输中"
}
```

### 6.2 客户管理

#### 6.2.1 获取客户列表
- **接口**: `GET /customers`
- **描述**: 分页获取客户列表

#### 6.2.2 创建客户
- **接口**: `POST /customers`
- **描述**: 创建新客户
- **请求参数**:
```json
{
  "name": "北京华联超市",
  "type": "enterprise",
  "contactPerson": "李经理",
  "phone": "010-12345678",
  "email": "contact@hualian.com",
  "address": "北京市朝阳区建国路88号",
  "creditLevel": "A",
  "paymentTerms": "月结30天"
}
```

#### 6.2.3 更新客户
- **接口**: `PUT /customers/{id}`
- **描述**: 更新客户信息

#### 6.2.4 删除客户
- **接口**: `DELETE /customers/{id}`
- **描述**: 删除客户

### 6.3 路线管理

#### 6.3.1 获取路线列表
- **接口**: `GET /routes`
- **描述**: 获取路线列表

#### 6.3.2 创建路线
- **接口**: `POST /routes`
- **描述**: 创建新路线
- **请求参数**:
```json
{
  "name": "北京-天津快线",
  "origin": "北京市",
  "destination": "天津市",
  "distance": 120,
  "estimatedTime": 150,
  "difficulty": "简单",
  "tollFee": 45,
  "fuelCost": 80,
  "waypoints": [
    {"name": "京津高速入口", "lat": 39.9042, "lng": 116.4074},
    {"name": "天津收费站", "lat": 39.3434, "lng": 117.3616}
  ]
}
```

#### 6.3.3 更新路线
- **接口**: `PUT /routes/{id}`
- **描述**: 更新路线信息

#### 6.3.4 删除路线
- **接口**: `DELETE /routes/{id}`
- **描述**: 删除路线

### 6.4 合同管理

#### 6.4.1 获取合同列表
- **接口**: `GET /contracts`
- **描述**: 获取合同列表

#### 6.4.2 创建合同
- **接口**: `POST /contracts`
- **描述**: 创建新合同

#### 6.4.3 更新合同
- **接口**: `PUT /contracts/{id}`
- **描述**: 更新合同信息

#### 6.4.4 合同审批
- **接口**: `POST /contracts/{id}/approve`
- **描述**: 合同审批
- **请求参数**:
```json
{
  "action": "approve",
  "comment": "审批通过"
}
```

---

## 7. 车辆管理接口

### 7.1 车辆档案

#### 7.1.1 获取车辆列表
- **接口**: `GET /vehicles`
- **描述**: 分页获取车辆列表
- **查询参数**:
  - `page`: 页码
  - `pageSize`: 每页数量
  - `keyword`: 搜索关键词
  - `status`: 车辆状态
  - `type`: 车辆类型
  - `driverId`: 司机ID

#### 7.1.2 创建车辆
- **接口**: `POST /vehicles`
- **描述**: 创建新车辆档案
- **请求参数**:
```json
{
  "plateNumber": "京A12345",
  "brand": "东风",
  "model": "天龙KL",
  "type": "货车",
  "loadCapacity": 10.0,
  "fuelType": "柴油",
  "engineNumber": "ENG123456",
  "chassisNumber": "CHA123456",
  "registrationDate": "2020-01-15",
  "insuranceExpiry": "2024-12-31",
  "inspectionExpiry": "2024-08-15",
  "driverId": "DRV001",
  "status": "active"
}
```

#### 7.1.3 更新车辆
- **接口**: `PUT /vehicles/{id}`
- **描述**: 更新车辆信息

#### 7.1.4 删除车辆
- **接口**: `DELETE /vehicles/{id}`
- **描述**: 删除车辆档案

### 7.2 维修保养

#### 7.2.1 获取维修记录
- **接口**: `GET /vehicles/{id}/maintenance`
- **描述**: 获取车辆维修记录

#### 7.2.2 创建维修记录
- **接口**: `POST /vehicles/{id}/maintenance`
- **描述**: 创建维修记录
- **请求参数**:
```json
{
  "type": "定期保养",
  "description": "更换机油、机滤",
  "cost": 800,
  "serviceProvider": "4S店",
  "startDate": "2024-07-05",
  "endDate": "2024-07-05",
  "mileage": 50000,
  "nextMaintenanceDate": "2024-10-05"
}
```

### 7.3 保险管理

#### 7.3.1 获取保险记录
- **接口**: `GET /vehicles/{id}/insurance`
- **描述**: 获取车辆保险记录

#### 7.3.2 创建保险记录
- **接口**: `POST /vehicles/{id}/insurance`
- **描述**: 创建保险记录

### 7.4 油耗管理

#### 7.4.1 获取油耗记录
- **接口**: `GET /vehicles/{id}/fuel`
- **描述**: 获取车辆油耗记录

#### 7.4.2 创建油耗记录
- **接口**: `POST /vehicles/{id}/fuel`
- **描述**: 创建油耗记录

---

## 8. 调度管理接口

### 8.1 调度计划

#### 8.1.1 获取调度计划
- **接口**: `GET /dispatch/plans`
- **描述**: 获取调度计划列表

#### 8.1.2 创建调度计划
- **接口**: `POST /dispatch/plans`
- **描述**: 创建调度计划
- **请求参数**:
```json
{
  "orderId": "ORD001",
  "vehicleId": "VEH001",
  "driverId": "DRV001",
  "routeId": "RTE001",
  "plannedStartTime": "2024-07-06T08:00:00Z",
  "plannedEndTime": "2024-07-06T18:00:00Z",
  "priority": "normal",
  "instructions": "注意货物安全"
}
```

#### 8.1.3 更新调度计划
- **接口**: `PUT /dispatch/plans/{id}`
- **描述**: 更新调度计划

### 8.2 实时监控

#### 8.2.1 获取实时车辆位置
- **接口**: `GET /dispatch/vehicles/realtime`
- **描述**: 获取所有车辆实时位置
- **响应数据**:
```json
[
  {
    "vehicleId": "VEH001",
    "plateNumber": "京A12345",
    "lat": 39.9042,
    "lng": 116.4074,
    "speed": 60,
    "direction": 90,
    "status": "running",
    "updateTime": "2024-07-05T10:30:00Z"
  }
]
```

#### 8.2.2 获取车辆轨迹
- **接口**: `GET /dispatch/vehicles/{id}/track`
- **描述**: 获取车辆历史轨迹
- **查询参数**:
  - `startTime`: 开始时间
  - `endTime`: 结束时间

### 8.3 调度历史

#### 8.3.1 获取调度历史
- **接口**: `GET /dispatch/history`
- **描述**: 获取调度历史记录

#### 8.3.2 获取调度统计
- **接口**: `GET /dispatch/statistics`
- **描述**: 获取调度统计数据

---

## 9. 员工管理接口

### 9.1 员工档案

#### 9.1.1 获取员工列表
- **接口**: `GET /staff`
- **描述**: 分页获取员工列表

#### 9.1.2 创建员工
- **接口**: `POST /staff`
- **描述**: 创建新员工
- **请求参数**:
```json
{
  "employeeId": "E001",
  "name": "张师傅",
  "gender": "男",
  "age": 35,
  "phone": "13800138001",
  "department": "运输部",
  "position": "司机",
  "hireDate": "2019-03-15",
  "salary": 8000,
  "address": "北京市朝阳区",
  "emergencyContact": "李女士",
  "emergencyPhone": "13800138002"
}
```

### 9.2 司机管理

#### 9.2.1 获取司机列表
- **接口**: `GET /staff/drivers`
- **描述**: 获取司机列表

#### 9.2.2 创建司机档案
- **接口**: `POST /staff/drivers`
- **描述**: 创建司机档案
- **请求参数**:
```json
{
  "employeeId": "E001",
  "licenseType": "A2",
  "licenseNumber": "110101199001011234",
  "licenseExpiry": "2025-03-15",
  "drivingYears": 15,
  "safetyRecord": "良好",
  "medicalCheckDate": "2024-01-15"
}
```

### 9.3 考勤管理

#### 9.3.1 获取考勤记录
- **接口**: `GET /staff/attendance`
- **描述**: 获取考勤记录

#### 9.3.2 打卡记录
- **接口**: `POST /staff/attendance/checkin`
- **描述**: 员工打卡
- **请求参数**:
```json
{
  "employeeId": "E001",
  "type": "in",
  "time": "2024-07-05T08:00:00Z",
  "location": "公司大门",
  "remark": ""
}
```

### 9.4 薪资管理

#### 9.4.1 获取薪资记录
- **接口**: `GET /staff/salary`
- **描述**: 获取薪资记录

#### 9.4.2 计算工资
- **接口**: `POST /staff/salary/calculate`
- **描述**: 计算员工工资
- **请求参数**:
```json
{
  "month": "2024-07",
  "employeeIds": ["E001", "E002"],
  "rules": ["attendance", "performance", "overtime"]
}
```

#### 9.4.3 发放工资
- **接口**: `POST /staff/salary/pay`
- **描述**: 发放工资

---

## 10. 系统管理接口

### 10.1 系统设置

#### 10.1.1 获取系统配置
- **接口**: `GET /system/config`
- **描述**: 获取系统配置

#### 10.1.2 更新系统配置
- **接口**: `PUT /system/config`
- **描述**: 更新系统配置

### 10.2 操作日志

#### 10.2.1 获取操作日志
- **接口**: `GET /system/logs`
- **描述**: 获取操作日志

### 10.3 文件上传

#### 10.3.1 上传文件
- **接口**: `POST /system/upload`
- **描述**: 上传文件
- **请求类型**: `multipart/form-data`
- **响应数据**:
```json
{
  "fileId": "FILE001",
  "fileName": "document.pdf",
  "fileUrl": "http://example.com/files/document.pdf",
  "fileSize": 1024000
}
```

### 10.4 数据字典

#### 10.4.1 获取数据字典
- **接口**: `GET /system/dict/{type}`
- **描述**: 获取数据字典
- **响应数据**:
```json
[
  {
    "label": "货车",
    "value": "truck",
    "sort": 1
  },
  {
    "label": "客车",
    "value": "bus",
    "sort": 2
  }
]
```

---

## 📝 开发说明

### 分页参数
所有列表接口都支持以下分页参数：
- `page`: 页码，从1开始
- `pageSize`: 每页数量，默认10，最大100
- `sort`: 排序字段
- `order`: 排序方向 (asc/desc)

### 搜索参数
支持模糊搜索的字段：
- `keyword`: 通用搜索关键词
- 具体字段搜索：如 `name`, `phone`, `email` 等

### 时间格式
- 统一使用 ISO 8601 格式：`YYYY-MM-DDTHH:mm:ssZ`
- 时区：UTC

### 错误处理
```json
{
  "code": 400,
  "message": "参数错误",
  "errors": [
    {
      "field": "email",
      "message": "邮箱格式不正确"
    }
  ]
}
```

### 权限控制
每个接口都需要相应的权限，权限码格式：
- `模块:操作` 如：`user:create`, `vehicle:view`
- `*` 表示所有权限

---

## 📊 数据库设计建议

### 主要数据表
1. **用户表 (users)**
   - id, username, password, name, email, phone, avatar, status, created_at, updated_at

2. **角色表 (roles)**
   - id, name, code, description, type, status, created_at, updated_at

3. **权限表 (permissions)**
   - id, name, code, description, module, type, resource, method, parent_id, sort

4. **用户角色关联表 (user_roles)**
   - user_id, role_id

5. **角色权限关联表 (role_permissions)**
   - role_id, permission_id

6. **订单表 (orders)**
   - id, order_no, customer_id, origin, destination, cargo_type, weight, volume, value, pickup_time, delivery_time, status, created_at

7. **客户表 (customers)**
   - id, name, type, contact_person, phone, email, address, credit_level, status

8. **车辆表 (vehicles)**
   - id, plate_number, brand, model, type, load_capacity, fuel_type, driver_id, status

9. **司机表 (drivers)**
   - id, employee_id, license_type, license_number, license_expiry, driving_years

10. **员工表 (staff)**
    - id, employee_id, name, gender, age, phone, department, position, hire_date, salary

---

## 🚀 部署建议

### 环境要求
- Node.js 16+
- MySQL 8.0+ / PostgreSQL 12+
- Redis 6.0+
- Nginx (生产环境)

### 配置文件示例
```javascript
// config/database.js
module.exports = {
  development: {
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'password',
    database: 'logistics_dev'
  },
  production: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  }
}
```

### Docker 部署
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔧 开发工具推荐

### API 开发
- **框架**: Express.js / Koa.js / NestJS
- **ORM**: Sequelize / TypeORM / Prisma
- **验证**: Joi / Yup / class-validator
- **文档**: Swagger / OpenAPI

### 数据库
- **关系型**: MySQL / PostgreSQL
- **缓存**: Redis
- **搜索**: Elasticsearch (可选)

### 监控日志
- **日志**: Winston / Pino
- **监控**: PM2 / Docker Health Check
- **性能**: New Relic / DataDog (可选)

---

## 📋 开发清单

### 必须实现的接口 (优先级高)
- [ ] 用户认证登录 (`/auth/login`)
- [ ] 获取用户信息 (`/auth/user`)
- [ ] 工作台统计数据 (`/dashboard/statistics`)
- [ ] 订单CRUD (`/orders/*`)
- [ ] 车辆CRUD (`/vehicles/*`)
- [ ] 员工CRUD (`/staff/*`)
- [ ] 角色权限管理 (`/roles/*`, `/permissions/*`)

### 建议实现的接口 (优先级中)
- [ ] 实时监控数据 (`/dispatch/vehicles/realtime`)
- [ ] 文件上传 (`/system/upload`)
- [ ] 数据报表 (`/data/reports`)
- [ ] 考勤管理 (`/staff/attendance/*`)
- [ ] 薪资管理 (`/staff/salary/*`)

### 可选实现的接口 (优先级低)
- [ ] 数据分析 (`/data/analysis`)
- [ ] 车辆轨迹 (`/dispatch/vehicles/*/track`)
- [ ] 操作日志 (`/system/logs`)
- [ ] 系统配置 (`/system/config`)

---

## 🔗 相关链接
- [前端项目地址](http://localhost:5177)
- [API测试工具](http://localhost:3000/api-docs)
- [开发文档](./README.md)
- [数据库设计](./database-design.md)
- [部署指南](./deployment.md)

---

## 📋 接口清单 (快速参考)

### 认证相关 (4个)
```
POST   /auth/login           # 用户登录
POST   /auth/refresh         # 刷新令牌
POST   /auth/logout          # 用户登出
GET    /auth/captcha         # 获取验证码
```

### 用户管理 (7个)
```
GET    /users                # 获取用户列表
POST   /users                # 创建用户
PUT    /users/{id}           # 更新用户
DELETE /users/{id}           # 删除用户
GET    /users/{id}           # 获取用户详情
POST   /users/{id}/reset-password  # 重置密码
PATCH  /users/{id}/status    # 更新用户状态
```

### 角色权限 (7个)
```
GET    /roles                # 获取角色列表
POST   /roles                # 创建角色
PUT    /roles/{id}           # 更新角色
DELETE /roles/{id}           # 删除角色
GET    /permissions/tree     # 获取权限树
PUT    /roles/{id}/permissions    # 分配角色权限
PUT    /users/{id}/roles     # 分配用户角色
```

### 工作台 (3个)
```
GET    /dashboard/statistics # 获取统计数据
GET    /dashboard/realtime   # 获取实时数据
GET    /dashboard/todos      # 获取待办事项
```

### 数据管理 (5个)
```
GET    /data/overview        # 数据概览
GET    /data/analysis        # 数据分析
POST   /data/reports         # 生成报表
GET    /data/reports         # 获取报表列表
GET    /data/reports/{id}/download  # 下载报表
```

### 订单管理 (6个)
```
GET    /orders               # 获取订单列表
POST   /orders               # 创建订单
PUT    /orders/{id}          # 更新订单
DELETE /orders/{id}          # 删除订单
GET    /orders/{id}          # 获取订单详情
PATCH  /orders/{id}/status   # 更新订单状态
```

### 客户管理 (4个)
```
GET    /customers            # 获取客户列表
POST   /customers            # 创建客户
PUT    /customers/{id}       # 更新客户
DELETE /customers/{id}       # 删除客户
```

### 路线管理 (4个)
```
GET    /routes               # 获取路线列表
POST   /routes               # 创建路线
PUT    /routes/{id}          # 更新路线
DELETE /routes/{id}          # 删除路线
```

### 合同管理 (4个)
```
GET    /contracts            # 获取合同列表
POST   /contracts            # 创建合同
PUT    /contracts/{id}       # 更新合同
POST   /contracts/{id}/approve  # 合同审批
```

### 车辆管理 (8个)
```
GET    /vehicles             # 获取车辆列表
POST   /vehicles             # 创建车辆
PUT    /vehicles/{id}        # 更新车辆
DELETE /vehicles/{id}        # 删除车辆
GET    /vehicles/{id}/maintenance    # 获取维修记录
POST   /vehicles/{id}/maintenance   # 创建维修记录
GET    /vehicles/{id}/insurance     # 获取保险记录
POST   /vehicles/{id}/insurance    # 创建保险记录
```

### 调度管理 (6个)
```
GET    /dispatch/plans       # 获取调度计划
POST   /dispatch/plans       # 创建调度计划
PUT    /dispatch/plans/{id}  # 更新调度计划
GET    /dispatch/vehicles/realtime  # 获取实时位置
GET    /dispatch/vehicles/{id}/track  # 获取车辆轨迹
GET    /dispatch/history     # 获取调度历史
```

### 员工管理 (6个)
```
GET    /staff                # 获取员工列表
POST   /staff                # 创建员工
GET    /staff/drivers        # 获取司机列表
POST   /staff/drivers        # 创建司机档案
GET    /staff/attendance     # 获取考勤记录
POST   /staff/attendance/checkin  # 员工打卡
```

### 薪资管理 (3个)
```
GET    /staff/salary         # 获取薪资记录
POST   /staff/salary/calculate  # 计算工资
POST   /staff/salary/pay     # 发放工资
```

### 系统管理 (5个)
```
GET    /system/config        # 获取系统配置
PUT    /system/config        # 更新系统配置
GET    /system/logs          # 获取操作日志
POST   /system/upload        # 上传文件
GET    /system/dict/{type}   # 获取数据字典
```

**总计: 76个接口**

---

## 💡 实施建议

### 第一阶段 (核心功能)
优先实现以下接口，可以让前端基本运行：
1. 认证相关 (4个)
2. 工作台统计 (1个: `/dashboard/statistics`)
3. 订单管理 (6个)
4. 车辆管理 (4个: 基础CRUD)
5. 员工管理 (2个: 基础CRUD)

### 第二阶段 (业务功能)
1. 客户管理 (4个)
2. 路线管理 (4个)
3. 角色权限 (7个)
4. 调度管理 (3个: 基础功能)

### 第三阶段 (高级功能)
1. 数据分析报表
2. 实时监控
3. 考勤薪资
4. 系统管理

### Mock数据建议
在开发初期，可以返回固定的Mock数据，确保前端可以正常显示和交互，后续再逐步实现真实的业务逻辑。
