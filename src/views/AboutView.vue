<script setup lang="ts">
import { ref, computed, onMounted, onBeforeMount } from "vue";
import { openUrl } from "@tauri-apps/plugin-opener";
import SLCard from "../components/common/SLCard.vue";
import SLButton from "../components/common/SLButton.vue";
import { contributors as contributorsList, type SocialLinks } from "../data/contributors";
import { checkUpdate, type UpdateInfo } from "../api/update";
import { getAppVersion, BUILD_YEAR } from "../utils/version";

console.log('[AboutView] 脚本开始执行');

const version = ref('加载中...');
const buildDate = BUILD_YEAR;

const contributors = ref(contributorsList);

const PAGE_SIZE = 9;
const currentPage = ref(1);

const totalPages = computed(() => Math.ceil(contributors.value.length / PAGE_SIZE));

const displayedContributors = computed(() => {
  const end = currentPage.value * PAGE_SIZE;
  return contributors.value.slice(0, end);
});

const hasMore = computed(() => currentPage.value < totalPages.value);

function loadMore() {
  if (hasMore.value) {
    currentPage.value++;
  }
}

// 更新相关状态
const isCheckingUpdate = ref(false);
const updateInfo = ref<UpdateInfo | null>(null);
const updateError = ref<string | null>(null);

onBeforeMount(() => {
  console.log('[AboutView] onBeforeMount - 组件即将挂载');
});

onMounted(async () => {
  console.log('[AboutView] onMounted - 组件已挂载');
  console.log('[AboutView] contributors:', contributors.value);

  // 加载版本号
  version.value = await getAppVersion();
  console.log('[AboutView] 版本号:', version.value);
});

// 打开外部链接
async function openLink(url: string) {
  console.log('[AboutView] 尝试打开URL:', url);
  if (!url) return;
  try {
    await openUrl(url);
    console.log('[AboutView] URL打开成功');
  } catch (e) {
    console.error("[AboutView] 打开URL失败:", e);
    alert(`无法打开链接: ${e}`);
  }
}

// 检查更新
async function handleCheckUpdate() {
  console.log('[AboutView] 开始检查更新');
  isCheckingUpdate.value = true;
  updateError.value = null;
  updateInfo.value = null;

  try {
    const info = await checkUpdate();
    console.log('[AboutView] 更新信息:', info);

    if (info) {
      updateInfo.value = info;
    } else {
      // 没有更新
      updateInfo.value = {
        has_update: false,
        latest_version: version.value,
        current_version: version.value,
      };
    }
  } catch (error) {
    console.error('[AboutView] 检查更新失败:', error);
    updateError.value = error as string;
  } finally {
    isCheckingUpdate.value = false;
  }
}

// 手动下载
async function handleManualDownload() {
  console.log('[AboutView] 打开手动下载链接');
  if (updateInfo.value?.download_url) {
    try {
      await openUrl(updateInfo.value.download_url);
      console.log('[AboutView] 已打开下载页面');
    } catch (error) {
      console.error('[AboutView] 打开链接失败:', error);
      alert(`打开链接失败: ${error}`);
    }
  }
}

function isSocialLinks(url: string | SocialLinks | undefined): url is SocialLinks {
  return typeof url === 'object' && url !== null;
}

async function openSocialLink(url: string) {
  await openLink(url);
}

function getSocialTitle(platform: string): string {
  const titles: Record<string, string> = {
    gitee: 'Gitee',
    github: 'GitHub',
    bilibili: 'Bilibili',
    qq: 'QQ (点击复制)',
  };
  return titles[platform] || platform;
}

const knownPlatforms = ['gitee', 'github', 'bilibili', 'qq'];

function getCustomLinks(urls: SocialLinks): Array<{platform: string, url: string}> {
  return Object.entries(urls)
    .filter(([platform, url]) => !knownPlatforms.includes(platform) && url)
    .map(([platform, url]) => ({ platform, url: url as string }));
}

const copiedQQ = ref<string | null>(null);

async function copyQQ(qq: string, contributorName: string) {
  try {
    await navigator.clipboard.writeText(qq);
    copiedQQ.value = contributorName;
    setTimeout(() => {
      if (copiedQQ.value === contributorName) {
        copiedQQ.value = null;
      }
    }, 2000);
  } catch (e) {
    console.error('[AboutView] 复制失败:', e);
  }
}

console.log('[AboutView] 脚本执行完成');
</script>

<template>
  <div class="about-view animate-fade-in-up">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-logo">
        <img src="../assets/logo.svg" alt="Sea Lantern" width="72" height="72" />
      </div>
      <h1 class="hero-title">Sea Lantern</h1>
      <p class="hero-subtitle">Minecraft 服务器管理工具</p>
      <div class="hero-badges">
        <span class="version-badge">v{{ version }}</span>
        <span class="tech-badge">Tauri 2 + Vue 3</span>
        <span class="license-badge">GPLv3</span>
      </div>
      <p class="hero-desc">
        一个由社区共同打造的 Minecraft 开服器。<br/>
        不仅代码开源，连灵魂都由你们定义。
      </p>
    </div>

    <!-- Manifesto -->
    <SLCard>
      <div class="manifesto">
        <h3 class="manifesto-title">为什么叫 Sea Lantern？</h3>
        <p class="manifesto-text">
          海晶灯（Sea Lantern）是 Minecraft 中一种发光方块——它由无数碎片组合而成，却能发出柔和而持久的光。
        </p>
        <p class="manifesto-text">
          就像这个项目一样，每一位贡献者都是一片海晶碎片。<br/>
          当我们聚在一起，就能照亮整个社区。
        </p>
      </div>
    </SLCard>

    <!-- 此处缺一段代码 -->
    <!-- 点击加入开发 -->
    
    <!-- Contributor Wall -->
    <div class="contributor-section">
      <div class="section-header">
        <h2 class="section-title">贡献者墙</h2>
        <p class="section-desc">每一个让这个项目变得更好的人</p>
      </div>

      <div class="contributor-grid">
        <div
          v-for="c in displayedContributors"
          :key="c.name"
          class="contributor-card glass-card"
        >
          <img :src="c.avatar" :alt="c.name" class="contributor-avatar" />
          <div class="contributor-right">
            <div class="contributor-info">
              <span class="contributor-name">{{ c.name }}</span>
              <span class="contributor-role" :title="c.role">{{ c.role }}</span>
            </div>
            <div v-if="c.url" class="contributor-social">
            <a v-if="typeof c.url === 'string'" class="social-icon" @click.prevent="openLink(c.url)" title="主页">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </a>
            <template v-else-if="isSocialLinks(c.url)">
              <a v-if="c.url.gitee" class="social-icon" @click.prevent="openSocialLink(c.url.gitee)" title="Gitee">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.592.592 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h8.296z"/>
                </svg>
              </a>
              <a v-if="c.url.github" class="social-icon" @click.prevent="openSocialLink(c.url.github)" title="GitHub">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a v-if="c.url.bilibili" class="social-icon" @click.prevent="openSocialLink(c.url.bilibili)" title="Bilibili">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z"/>
                </svg>
              </a>
              <a v-if="c.url.qq" class="social-icon" :class="{ copied: copiedQQ === c.name }" @click.prevent="copyQQ(c.url.qq, c.name)" :title="copiedQQ === c.name ? '已复制!' : 'QQ (点击复制)'">
                <!-- 已复制状态 - 显示对勾 -->
                <svg v-if="copiedQQ === c.name" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <!-- 默认状态 - 显示QQ图标 -->
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.9139 14.529C19.7336 13.955 19.4877 13.2856 19.2385 12.643L18.3288 10.3969C18.3295 10.371 18.3408 9.92858 18.3408 9.70053C18.3408 5.8599 16.5082 2.00037 12.0009 2C7.49403 2.00037 5.66113 5.8599 5.66113 9.70053C5.66113 9.92858 5.67237 10.371 5.67312 10.3969L4.76379 12.643C4.51453 13.2856 4.26827 13.955 4.08798 14.529C3.2285 17.2657 3.507 18.3982 3.71915 18.4238C4.17419 18.4779 5.49021 16.3635 5.49021 16.3635C5.49021 17.5879 6.12741 19.1858 7.5064 20.3398C6.99064 20.4971 6.35868 20.7388 5.95237 21.0355C5.58729 21.3025 5.63302 21.5743 5.69861 21.6841C5.9876 22.1661 10.6542 21.9918 12.0017 21.8417C13.3488 21.9918 18.0158 22.1661 18.3044 21.6841C18.3704 21.5743 18.4157 21.3025 18.0507 21.0355C17.6443 20.7388 17.012 20.4971 16.4959 20.3395C17.8745 19.1858 18.5117 17.5879 18.5117 16.3635C18.5117 16.3635 19.8281 18.4779 20.2831 18.4238C20.4949 18.3982 20.7734 17.2657 19.9139 14.529Z"/>
                </svg>
              </a>
              <!-- 自定义链接 - 显示问号图标 -->
              <a 
                v-for="custom in getCustomLinks(c.url)" 
                :key="custom.platform" 
                class="social-icon" 
                @click.prevent="openSocialLink(custom.url)" 
                :title="custom.platform"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </a>
            </template>
            </div>
          </div>
        </div>

        <!-- Join Card -->
        <div class="contributor-card glass-card join-card">
          <div class="join-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--sl-primary)" stroke-width="1.5" stroke-linecap="round">
              <path d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div class="contributor-info">
            <span class="contributor-name join-text">你的名字</span>
            <span class="contributor-role">参与贡献，加入我们</span>
          </div>
        </div>
      </div>

      <!-- 加载更多按钮 -->
      <div v-if="hasMore" class="load-more-section">
        <SLButton variant="secondary" size="sm" @click="loadMore">
          加载更多 ({{ displayedContributors.length }}/{{ contributors.length }})
        </SLButton>
      </div>
    </div>

    <!-- Project Info -->
    <div class="info-grid">
      <SLCard title="项目信息">
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">版本</span>
            <span class="info-value">{{ version }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">构建年份</span>
            <span class="info-value">{{ buildDate }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">前端</span>
            <span class="info-value">Vue 3 + TypeScript + Vite</span>
          </div>
          <div class="info-item">
            <span class="info-label">后端</span>
            <span class="info-value">Rust + Tauri 2</span>
          </div>
          <div class="info-item">
            <span class="info-label">许可证</span>
            <span class="info-value">GNU GPLv3</span>
          </div>
        </div>

        <!-- 检查更新按钮 -->
        <div class="update-section">
          <SLButton
            variant="secondary"
            size="sm"
            @click="handleCheckUpdate"
            :disabled="isCheckingUpdate"
            style="width: 100%"
          >
            {{ isCheckingUpdate ? "检查中..." : "检查更新" }}
          </SLButton>

          <!-- 更新信息 -->
          <div v-if="updateInfo" class="update-info">
            <div v-if="updateInfo.has_update" class="update-available">
              <div class="update-message">
                <div class="update-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="17 1 21 5 17 9"></polyline>
                    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                    <polyline points="7 23 3 19 7 15"></polyline>
                    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                  </svg>
                </div>
                <div>
                  <div class="update-title">发现新版本 v{{ updateInfo.latest_version }}</div>
                  <div class="update-desc">当前版本: v{{ updateInfo.current_version }}</div>
                </div>
              </div>
              <div v-if="updateInfo.release_notes" class="release-notes">
                <div class="notes-title">更新内容:</div>
                <div class="notes-content">{{ updateInfo.release_notes }}</div>
              </div>
              <div class="update-buttons">
                <SLButton
                  variant="primary"
                  size="sm"
                  @click="handleManualDownload"
                  style="width: 100%"
                >
                  前往下载页面
                </SLButton>
              </div>
            </div>
            <div v-else class="update-latest">
              <div class="update-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span>已是最新版本</span>
            </div>
          </div>

          <!-- 错误信息 -->
          <div v-if="updateError" class="update-error">
            <div class="error-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <span>{{ updateError }}</span>
          </div>
        </div>
      </SLCard>

      <SLCard title="参与方式">
        <div class="contribute-ways">
          <div class="way-item">
            <div class="way-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </div>
            <div class="way-info">
              <span class="way-title">写代码</span>
              <span class="way-desc">提交 PR，修 Bug 或加新功能</span>
            </div>
          </div>
          <div class="way-item">
            <div class="way-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 19l7 2-7-18-7 18 7-2zm0 0v-8"></path>
              </svg>
            </div>
            <div class="way-info">
              <span class="way-title">做设计</span>
              <span class="way-desc">设计 UI、图标、主题皮肤</span>
            </div>
          </div>
          <div class="way-item">
            <div class="way-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div class="way-info">
              <span class="way-title">提建议</span>
              <span class="way-desc">在 Issues 里提出你的想法</span>
            </div>
          </div>
          <div class="way-item">
            <div class="way-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <div class="way-info">
              <span class="way-title">写文档</span>
              <span class="way-desc">完善教程和使用说明</span>
            </div>
          </div>
          <div class="way-item">
            <div class="way-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </div>
            <div class="way-info">
              <span class="way-title">翻译</span>
              <span class="way-desc">帮助翻译成其他语言</span>
            </div>
          </div>
          <div class="way-item">
            <div class="way-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
            </div>
            <div class="way-info">
              <span class="way-title">推广</span>
              <span class="way-desc">分享给更多 MC 服主</span>
            </div>
          </div>
        </div>
      </SLCard>
    </div>

    <!-- Links -->
    <div class="links-section">
      <SLButton variant="primary" size="lg" @click="openLink('https://gitee.com/fps_z/SeaLantern')">
        Gitee 仓库
      </SLButton>
      <SLButton variant="secondary" size="lg" @click="openLink('https://space.bilibili.com/3706927622130406?spm_id_from=333.1387.0.0')">
        B站主页
      </SLButton>
    </div>

    <!-- Footer -->
    <div class="about-footer">
      <p class="footer-text">
        Sea Lantern 是一个开源项目，遵循 GPLv3 协议。
      </p>
      <p class="footer-text">
        Minecraft 是 Mojang Studios 的注册商标。本项目与 Mojang 无关。
      </p>
      <p class="footer-quote">
        "我们搭建了骨架，而灵魂，交给你们。"
      </p>
    </div>
  </div>
</template>

<style scoped>
.about-view {
  display: flex;
  flex-direction: column;
  gap: var(--sl-space-xl);
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: var(--sl-space-2xl);
}

/* Hero */
.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--sl-space-2xl) 0;
}

.hero-logo {
  margin-bottom: var(--sl-space-md);
  animation: sl-fade-in-up 0.6s ease forwards;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--sl-text-primary);
  letter-spacing: -0.03em;
  margin-bottom: var(--sl-space-xs);
  animation: sl-fade-in-up 0.6s ease 0.1s both;
}

.hero-subtitle {
  font-size: 1.125rem;
  color: var(--sl-text-secondary);
  margin-bottom: var(--sl-space-md);
  animation: sl-fade-in-up 0.6s ease 0.2s both;
}

.hero-badges {
  display: flex;
  gap: var(--sl-space-sm);
  margin-bottom: var(--sl-space-lg);
  animation: sl-fade-in-up 0.6s ease 0.3s both;
}

.version-badge, .tech-badge, .license-badge {
  padding: 4px 14px;
  border-radius: var(--sl-radius-full);
  font-size: 0.8125rem;
  font-weight: 500;
}

.version-badge {
  background: var(--sl-primary-bg);
  color: var(--sl-primary);
}

.tech-badge {
  background: rgba(34, 197, 94, 0.1);
  color: var(--sl-success);
}

.license-badge {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.hero-desc {
  font-size: 1rem;
  color: var(--sl-text-secondary);
  line-height: 1.8;
  animation: sl-fade-in-up 0.6s ease 0.4s both;
}

/* Manifesto */
.manifesto {
  text-align: center;
  padding: var(--sl-space-lg);
}

.manifesto-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--sl-text-primary);
  margin-bottom: var(--sl-space-md);
}

.manifesto-text {
  font-size: 0.9375rem;
  color: var(--sl-text-secondary);
  line-height: 1.8;
  margin-bottom: var(--sl-space-sm);
}

/* Contributor Wall */
.contributor-section {
  display: flex;
  flex-direction: column;
  gap: var(--sl-space-md);
}

.section-header {
  text-align: center;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--sl-text-primary);
  margin-bottom: var(--sl-space-xs);
}

.section-desc {
  font-size: 0.9375rem;
  color: var(--sl-text-tertiary);
}

.contributor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--sl-space-md);
}

.contributor-card {
  display: flex;
  align-items: center;
  gap: var(--sl-space-md);
  padding: var(--sl-space-md);
  transition: all var(--sl-transition-normal);
}

.contributor-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.contributor-card.clickable {
  cursor: pointer;
}

.contributor-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: var(--sl-shadow-lg);
}

.contributor-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--sl-radius-md);
  flex-shrink: 0;
  background: var(--sl-bg-tertiary);
  image-rendering: pixelated;
}

.contributor-info {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.contributor-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--sl-text-primary);
  flex-shrink: 0;
}

.contributor-role {
  font-size: 0.75rem;
  color: var(--sl-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;
}

.contributor-social {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--sl-radius-sm);
  background: var(--sl-bg-tertiary);
  color: var(--sl-text-secondary);
  cursor: pointer;
  transition: all var(--sl-transition-fast);
}

.social-icon:hover {
  background: var(--sl-primary);
  color: white;
  transform: scale(1.1);
}

.social-icon.copied {
  background: #22c55e;
  color: white;
}

.load-more-section {
  display: flex;
  justify-content: center;
  margin-top: var(--sl-space-md);
}

.join-card {
  border: 2px dashed var(--sl-border);
  background: transparent;
  cursor: default;
}

.join-card:hover {
  border-color: var(--sl-primary-light);
  background: var(--sl-primary-bg);
  transform: none;
  box-shadow: none;
}

.join-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.join-text {
  color: var(--sl-primary);
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sl-space-md);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--sl-border-light);
}

.info-item:last-child { border-bottom: none; }

.info-label {
  font-size: 0.875rem;
  color: var(--sl-text-tertiary);
}

.info-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--sl-text-primary);
  font-family: var(--sl-font-mono);
}

/* Contribute Ways */
.contribute-ways {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sl-space-sm);
}

.way-item {
  display: flex;
  align-items: center;
  gap: var(--sl-space-sm);
  padding: var(--sl-space-sm);
  border-radius: var(--sl-radius-md);
  transition: background var(--sl-transition-fast);
}

.way-item:hover {
  background: var(--sl-bg-secondary);
}

.way-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--sl-primary-bg);
  color: var(--sl-primary);
  border-radius: var(--sl-radius-md);
  transition: all var(--sl-transition-fast);
}

.way-item:hover .way-icon {
  background: var(--sl-primary);
  color: white;
  transform: scale(1.05);
}

.way-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.way-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--sl-text-primary);
}

.way-desc {
  font-size: 0.75rem;
  color: var(--sl-text-tertiary);
}

/* Links */
.links-section {
  display: flex;
  justify-content: center;
  gap: var(--sl-space-md);
}

.links-section :deep(.sl-button) {
  min-width: 140px;
}

/* Footer */
.about-footer {
  text-align: center;
  padding: var(--sl-space-xl) 0;
  border-top: 1px solid var(--sl-border-light);
}

.footer-text {
  font-size: 0.8125rem;
  color: var(--sl-text-tertiary);
  margin-bottom: var(--sl-space-xs);
}

.footer-quote {
  font-size: 1rem;
  font-weight: 500;
  color: var(--sl-primary);
  font-style: italic;
  margin-top: var(--sl-space-md);
}

/* Update Section */
.update-section {
  margin-top: var(--sl-space-md);
  padding-top: var(--sl-space-md);
  border-top: 1px solid var(--sl-border-light);
}

.update-info {
  margin-top: var(--sl-space-sm);
  padding: var(--sl-space-sm);
  border-radius: var(--sl-radius-md);
  font-size: 0.875rem;
}

.update-available {
  background: var(--sl-primary-bg);
  border: 1px solid var(--sl-primary-light);
  padding: var(--sl-space-sm);
  border-radius: var(--sl-radius-md);
}

.update-message {
  display: flex;
  align-items: flex-start;
  gap: var(--sl-space-sm);
}

.update-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--sl-primary);
  color: white;
  border-radius: var(--sl-radius-sm);
}

.update-latest .update-icon {
  background: var(--sl-success);
}

.update-title {
  font-weight: 600;
  color: var(--sl-primary);
  margin-bottom: 2px;
}

.update-desc {
  font-size: 0.75rem;
  color: var(--sl-text-tertiary);
}

.release-notes {
  margin-top: var(--sl-space-sm);
  padding-top: var(--sl-space-sm);
  border-top: 1px solid var(--sl-border-light);
}

.notes-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--sl-text-secondary);
  margin-bottom: 4px;
}

.notes-content {
  font-size: 0.8125rem;
  color: var(--sl-text-secondary);
  line-height: 1.6;
  max-height: 120px;
  overflow-y: auto;
  white-space: pre-wrap;
}

.update-buttons {
  display: flex;
  gap: var(--sl-space-sm);
  margin-top: var(--sl-space-sm);
}

.update-latest {
  display: flex;
  align-items: center;
  gap: var(--sl-space-xs);
  padding: var(--sl-space-sm);
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: var(--sl-radius-md);
  color: var(--sl-success);
  font-weight: 500;
}

.update-error {
  display: flex;
  align-items: center;
  gap: var(--sl-space-xs);
  padding: var(--sl-space-sm);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--sl-radius-md);
  color: var(--sl-danger);
  font-size: 0.8125rem;
}

.error-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--sl-danger);
  color: white;
  border-radius: 50%;
}

@media (max-width: 768px) {
  .info-grid { grid-template-columns: 1fr; }
  .contribute-ways { grid-template-columns: 1fr; }
  .contributor-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
}
</style>
