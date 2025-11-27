# 文本模式功能实现任务

## 任务列表

### Phase 1: 基础设施和工具函数

#### Task 1.1: 创建类型定义
- [x] 在 `types/config.d.ts` 中添加 `SavedSubscription` 接口





- [x] 添加 `TextModeParams` 接口




- [x] 更新 `Params` 接口，添加 `mode: 'easy' | 'hard' | 'text'`





**预计时间**: 15 分钟
**依赖**: 无

---

#### Task 1.2: 实现密码加密工具
- [x] 创建 `app/utils/crypto.ts` 文件



- [x] 实现 `hashPassword(password: string): Promise<string>` 函数

- [x] 实现 `verifyPassword(password: string, hash: string): Promise<boolean>` 函数



**预计时间**: 30 分钟
**依赖**: Task 1.1

---

#### Task 1.3: 实现本地存储 Hook
- [x] 创建 `app/hooks/useLocalStorage.ts` 文件



- [x] 实现 `loadSubscriptions(): SavedSubscription[]` 函数

- [x] 实现 `saveSubscription(sub: SavedSubscription): void` 函数

- [x] 实现 `updateSubscription(id: string, sub: Partial<SavedSubscription>): void` 函数

- [x] 实现 `deleteSubscription(id: string): void` 函数

- [x] 实现 `getSubscriptionById(id: string): SavedSubscription | null` 函数



**预计时间**: 45 分钟
**依赖**: Task 1.1

---

### Phase 2: UI 组件开发

#### Task 2.1: 创建密码验证弹窗组件
- [x] 创建 `components/PasswordModal.tsx` 文件



- [x] 实现密码输入界面

- [x] 实现密码验证逻辑

- [x] 添加错误提示

- [x] 添加取消和确认按钮



**预计时间**: 45 分钟
**依赖**: Task 1.2

---

#### Task 2.2: 创建文本模式表单组件
- [x] 创建 `components/TextModeForm.tsx` 文件





- [x] 添加标题输入框

- [x] 添加订阅链接文本框

- [x] 添加密码开关

- [x] 添加密码输入框（条件显示）

- [x] 实现表单验证




- [x] 添加保存、更新、清空按钮


**预计时间**: 1 小时
**依赖**: Task 1.1

---

#### Task 2.3: 创建订阅列表组件
- [x] 创建 `components/SavedSubsList.tsx` 文件



- [x] 使用 NextUI Select 或 Accordion 组件
- [x] 显示订阅标题
- [x] 显示锁定图标（有密码时）
- [x] 添加编辑按钮
- [x] 添加删除按钮
- [x] 实现空列表提示

**预计时间**: 1 小时
**依赖**: Task 1.1

---

### Phase 3: 主页面集成

#### Task 3.1: 更新主页面状态管理
- [x] 在 `app/page.tsx` 中添加 `textModeParams` 状态





- [x] 在 `app/page.tsx` 中添加 `savedSubs` 状态




- [x] 在 `app/page.tsx` 中添加 `passwordModalOpen` 状态





- [x] 更新 `initialParams` 支持 `text` 模式






**预计时间**: 20 分钟
**依赖**: Task 1.1

---

#### Task 3.2: 添加文本模式标签页
- [x] 在 `tabs` 数组中添加文本模式标签





- [x] 在 `Tab` 渲染中添加文本模式内容





- [x] 集成 `TextModeForm` 组件

- [x] 集成 `SavedSubsList` 组件


**预计时间**: 30 分钟
**依赖**: Task 2.2, Task 2.3, Task 3.1

---

#### Task 3.3: 实现保存订阅功能
- [x] 创建 `saveTextSubscription` 函数





- [ ] 实现表单验证
- [x] 生成唯一 ID

- [x] 处理密码哈希（如果有）

- [x] 调用 localStorage 保存

- [x] 更新 `savedSubs` 状态








- [x] 显示成功提示





- [x] 清空表单


**预计时间**: 45 分钟
**依赖**: Task 1.2, Task 1.3, Task 3.1

---

#### Task 3.4: 实现编辑订阅功能
- [x] 创建 `editTextSubscription` 函数





- [x] 点击编辑按钮时检查是否有密码




- [x] 如果有密码，显示密码验证弹窗



- [x] 验证通过后加载订阅内容到表单




- [x] 设置 `selectedId` 状态




- [x] 创建 `updateTextSubscription` 函数保存修改






**预计时间**: 1 小时
**依赖**: Task 2.1, Task 3.3

---

#### Task 3.5: 实现删除订阅功能
- [x] 创建 `deleteTextSubscription` 函数




- [x] 显示确认对话框（使用 NextUI Modal）



- [x] 确认后调用 localStorage 删除

- [ ] 更新 `savedSubs` 状态
- [ ] 显示成功提示
- [x] 如果删除的是当前选中的订阅，清空表单



**预计时间**: 30 分钟
**依赖**: Task 3.1

---

#### Task 3.6: 实现订阅内容上传功能
- [x] 创建 `app/hooks/uploadSubContent.ts` 文件
  - 实现 `uploadSubContent(content: string): Promise<string>` 函数
  - 将订阅内容编码后上传到服务器
  - 服务器返回可访问的URL
  - 处理上传错误

**预计时间**: 30 分钟
**依赖**: Task 3.1

---

#### Task 3.7: 集成生成订阅链接功能
- [x] 修改 `createSubscription` 函数
  - 添加文本模式的判断逻辑
  - 调用 `uploadSubContent` 上传订阅内容
  - 获取服务器返回的URL
  - 将URL设置到 `params.subLink`
  - 如果是已保存的订阅，更新其 `subLink` 字段
  - 复制URL到剪贴板
  - 显示成功提示

**预计时间**: 30 分钟
**依赖**: Task 3.6

---

#### Task 3.8: 验证短链接和导入功能
- [x] 测试文本模式下生成订阅链接功能








  - 验证内容正确上传到服务器
  - 验证返回的URL可访问
  - 验证访问URL可获取原始订阅内容
- [x] 测试文本模式下生成短链接功能





  - 验证使用生成的订阅链接URL
  - 验证短链接正常工作
- [ ] 测试文本模式下导入 Clash 功能



  - 验证使用正确的订阅链接URL
  - 验证Clash可以正常导入
- [x] 确保 `params.subLink` 是URL而不是内容




- [ ] 修复任何兼容性问题

**预计时间**: 30 分钟
**依赖**: Task 3.7

---

### Phase 4: 优化和测试

#### Task 4.1: 添加错误处理
- [x] 处理 localStorage 不可用的情况





- [ ] 处理存储空间不足的情况
- [ ] 处理内容上传失败的情况
- [ ] 处理服务器返回错误的情况
- [ ] 添加友好的错误提示
- [ ] 添加错误边界组件（如果需要）

**预计时间**: 30 分钟
**依赖**: Task 3.8

---

#### Task 4.2: UI/UX 优化
- [x] 确保设计风格与现有模式一致




- [ ] 添加加载状态指示器
- [ ] 优化表单验证提示
- [ ] 添加动画效果（可选）
- [ ] 响应式设计调整

**预计时间**: 45 分钟
**依赖**: Task 3.8

---

#### Task 4.3: 性能优化
- [ ] 对输入框添加防抖处理
- [ ] 优化列表渲染性能
- [ ] 减少不必要的状态更新
- [ ] 添加 React.memo 优化（如果需要）

**预计时间**: 30 分钟
**依赖**: Task 4.2

---

#### Task 4.4: 功能测试
- [ ] 测试保存功能（有密码和无密码）
- [ ] 测试编辑功能（密码验证）
- [ ] 测试删除功能（确认对话框）
- [ ] 测试生成订阅链接功能
- [ ] 测试生成短链接功能
- [ ] 测试导入 Clash 功能
- [ ] 测试数据持久化（刷新页面）
- [ ] 测试边界情况（空输入、特殊字符等）

**预计时间**: 1 小时
**依赖**: Task 4.3

---

#### Task 4.5: 跨浏览器测试
- [ ] 在 Chrome 中测试
- [ ] 在 Firefox 中测试
- [ ] 在 Safari 中测试（如果可能）
- [ ] 在 Edge 中测试
- [ ] 修复兼容性问题

**预计时间**: 30 分钟
**依赖**: Task 4.4

---

#### Task 4.6: 代码审查和文档
- [ ] 代码格式化和 lint 检查
- [ ] 添加必要的代码注释
- [ ] 更新 README.md（如果需要）
- [ ] 创建使用文档（可选）

**预计时间**: 30 分钟
**依赖**: Task 4.5

---

## 总预计时间
- Phase 1: 1.5 小时
- Phase 2: 2.75 小时
- Phase 3: 3.5 小时
- Phase 4: 4 小时

**总计**: 约 11.75 小时

## 优先级
1. **高优先级**: Task 1.1-1.3, Task 2.1-2.3, Task 3.1-3.6
2. **中优先级**: Task 3.7, Task 4.1-4.2
3. **低优先级**: Task 4.3-4.6

## 风险和注意事项
1. **localStorage 限制**: 浏览器 localStorage 通常有 5-10MB 的限制，需要考虑存储大量订阅的情况
2. **密码安全**: 虽然使用了哈希，但仍然是客户端存储，需要在文档中说明安全性限制
3. **浏览器兼容性**: Web Crypto API 在旧浏览器中可能不支持，需要考虑降级方案
4. **数据迁移**: 如果未来需要更改数据结构，需要考虑数据迁移方案
