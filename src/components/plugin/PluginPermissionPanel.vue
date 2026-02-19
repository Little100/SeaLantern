<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { usePluginStore } from "../../stores/pluginStore";
import { Lock, X } from "lucide-vue-next";

interface Props {
  pluginId: string;
  permissions: string[];
}

const props = defineProps<Props>();
const pluginStore = usePluginStore();

const isOpen = ref(false);

const permissionLabels: Record<string, string> = {
  ui: "界面控制",
  element: "元素交互",
  console: "控制台命令",
  server: "服务器管理",
  fs: "文件系统",
  storage: "数据存储",
  api: "跨插件调用",
  log: "日志记录",
  network: "网络请求",
};

function getPermissionLabel(permission: string): string {
  return permissionLabels[permission] || permission;
}

const logs = computed(() => {
  return pluginStore.getPermissionLogs(props.pluginId);
});

const commandLogs = computed(() => {
  return logs.value
    .filter((log) => log.log_type === "command")
    .slice(-50)
    .reverse();
});

const apiStats = computed(() => {
  const stats = new Map<string, number>();
  logs.value
    .filter((log) => log.log_type === "api_call")
    .forEach((log) => {
      stats.set(log.action, (stats.get(log.action) || 0) + 1);
    });
  return Array.from(stats.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
});

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function togglePanel() {
  isOpen.value = !isOpen.value;
}

function closePanel() {
  isOpen.value = false;
}

const panelRef = ref<HTMLElement | null>(null);
const buttonRef = ref<HTMLElement | null>(null);

function handleClickOutside(event: MouseEvent) {
  if (!isOpen.value) return;
  const target = event.target as Node;
  if (
    panelRef.value &&
    !panelRef.value.contains(target) &&
    buttonRef.value &&
    !buttonRef.value.contains(target)
  ) {
    closePanel();
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div
    class="permission-panel-wrapper"
    :class="{ 'permission-panel-wrapper--open': isOpen }"
  >
    <button
      ref="buttonRef"
      class="permission-btn"
      :class="{ 'permission-btn--active': isOpen }"
      @click.stop="togglePanel"
      :title="'查看权限信息'"
    >
      <Lock :size="14" :stroke-width="2" />
      <span class="permission-btn-text">权限</span>
    </button>

    <div v-if="isOpen" ref="panelRef" class="permission-panel glass">
      <div class="panel-header">
        <span class="panel-title">权限信息</span>
        <button class="panel-close" @click="closePanel">
          <X :size="14" :stroke-width="2" />
        </button>
      </div>

      <div class="panel-content">
        <div class="panel-section">
          <div class="section-title">声明的权限</div>
          <div class="permission-tags">
            <span
              v-for="perm in permissions"
              :key="perm"
              class="permission-tag"
            >
              {{ getPermissionLabel(perm) }}
            </span>
            <span v-if="permissions.length === 0" class="empty-hint">
              无声明权限
            </span>
          </div>
        </div>

        <div class="panel-section">
          <div class="section-title">命令执行记录</div>
          <div class="command-list">
            <div
              v-for="(log, index) in commandLogs"
              :key="index"
              class="command-item"
            >
              <span class="command-action" :title="log.detail">{{
                log.action
              }}</span>
              <span class="command-time">{{ formatTime(log.timestamp) }}</span>
            </div>
            <div v-if="commandLogs.length === 0" class="empty-hint">
              暂无命令记录
            </div>
          </div>
        </div>

        <div class="panel-section">
          <div class="section-title">API 调用统计</div>
          <div class="api-stats">
            <div
              v-for="stat in apiStats"
              :key="stat.name"
              class="api-stat-item"
            >
              <span class="api-name">{{ stat.name }}</span>
              <span class="api-count">{{ stat.count }} 次</span>
            </div>
            <div v-if="apiStats.length === 0" class="empty-hint">
              暂无 API 调用
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.permission-panel-wrapper {
  position: relative;
  display: inline-flex;
  z-index: 1;
}

.permission-panel-wrapper--open {
  z-index: 9999;
}

.permission-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: var(--sl-bg-tertiary);
  color: var(--sl-text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--sl-transition-fast);
}

.permission-btn:hover {
  background: var(--sl-bg-hover);
  color: var(--sl-text-primary);
}

.permission-btn--active {
  background: var(--sl-primary);
  color: white;
}

.permission-btn-text {
  font-weight: 500;
}

.permission-panel {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  width: 320px;
  max-height: 400px;
  border-radius: 12px;
  background: rgba(30, 30, 40, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid var(--sl-border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--sl-border);
  background: var(--sl-bg-tertiary);
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--sl-text-primary);
}

.panel-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--sl-text-tertiary);
  cursor: pointer;
  transition: all var(--sl-transition-fast);
}

.panel-close:hover {
  background: var(--sl-bg-hover);
  color: var(--sl-text-primary);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

.panel-section {
  margin-bottom: 16px;
}

.panel-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--sl-text-secondary);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.permission-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.permission-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 12px;
  background: var(--sl-primary-alpha, rgba(59, 130, 246, 0.15));
  color: var(--sl-primary);
  font-size: 12px;
  font-weight: 500;
}

.command-list {
  max-height: 120px;
  overflow-y: auto;
}

.command-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border-radius: 4px;
  background: var(--sl-bg-tertiary);
  margin-bottom: 4px;
}

.command-item:last-child {
  margin-bottom: 0;
}

.command-action {
  flex: 1;
  font-size: 12px;
  color: var(--sl-text-primary);
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
}

.command-time {
  font-size: 11px;
  color: var(--sl-text-tertiary);
  flex-shrink: 0;
}

.api-stats {
  max-height: 100px;
  overflow-y: auto;
}

.api-stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border-radius: 4px;
  background: var(--sl-bg-tertiary);
  margin-bottom: 4px;
}

.api-stat-item:last-child {
  margin-bottom: 0;
}

.api-name {
  font-size: 12px;
  color: var(--sl-text-primary);
  font-family: monospace;
}

.api-count {
  font-size: 11px;
  color: var(--sl-text-secondary);
  font-weight: 500;
}

.empty-hint {
  font-size: 12px;
  color: var(--sl-text-tertiary);
  font-style: italic;
}

.panel-fade-enter-active,
.panel-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.panel-content::-webkit-scrollbar,
.command-list::-webkit-scrollbar,
.api-stats::-webkit-scrollbar {
  width: 4px;
}

.panel-content::-webkit-scrollbar-track,
.command-list::-webkit-scrollbar-track,
.api-stats::-webkit-scrollbar-track {
  background: transparent;
}

.panel-content::-webkit-scrollbar-thumb,
.command-list::-webkit-scrollbar-thumb,
.api-stats::-webkit-scrollbar-thumb {
  background: var(--sl-border);
  border-radius: 2px;
}

.panel-content::-webkit-scrollbar-thumb:hover,
.command-list::-webkit-scrollbar-thumb:hover,
.api-stats::-webkit-scrollbar-thumb:hover {
  background: var(--sl-text-tertiary);
}
</style>
