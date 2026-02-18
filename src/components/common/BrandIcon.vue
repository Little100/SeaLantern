<script setup lang="ts">
import { computed } from 'vue';
import * as icons from 'simple-icons';

interface Props {
  name: string;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
});

// 特殊图标名称映射（传入名称 -> simple-icons 导出名称）
const iconNameMap: Record<string, string> = {
  qq: 'siQq',
  wechat: 'siWechat',
  weixin: 'siWechat',
};

// 深色图标列表（在深色背景下使用 currentColor）
const darkIcons = new Set(['github', 'gitee']);

const icon = computed(() => {
  const lowerName = props.name.toLowerCase();
  
  // 先检查映射表
  if (iconNameMap[lowerName]) {
    return (icons as any)[iconNameMap[lowerName]];
  }
  
  // simple-icons 导出格式为 siGithub, siTwitter 等
  const iconName = 'si' + props.name.charAt(0).toUpperCase() + props.name.slice(1).toLowerCase();
  return (icons as any)[iconName];
});

const pathData = computed(() => icon.value?.path);
const color = computed(() => {
  const lowerName = props.name.toLowerCase();
  // 深色图标使用 currentColor 以适应主题
  if (darkIcons.has(lowerName)) {
    return 'currentColor';
  }
  return icon.value?.hex ? `#${icon.value.hex}` : 'currentColor';
});
</script>

<template>
  <svg
    v-if="pathData"
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path :d="pathData" :fill="color" />
  </svg>
</template>
