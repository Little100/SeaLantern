import { defineStore } from "pinia";
import { ref } from "vue";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

// 菜单项接口
export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  pluginId: string;
}

// 后端发送的菜单项格式（不含 pluginId）
interface RawMenuItem {
  id: string;
  label: string;
  icon?: string;
}

// 后端事件 payload 格式
interface ContextMenuEvent {
  action: "register" | "unregister";
  plugin_id: string;
  context: string;
  items: RawMenuItem[];
}

// 菜单状态接口
interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  context: string;
  targetData: string;
  items: ContextMenuItem[];
}

export const useContextMenuStore = defineStore("contextMenu", () => {
  // 菜单显示状态
  const visible = ref(false);
  const x = ref(0);
  const y = ref(0);
  const context = ref("");
  const targetData = ref("");
  const items = ref<ContextMenuItem[]>([]);

  // 内部存储: Map<context, Map<pluginId, items[]>>
  const registeredMenus = new Map<string, Map<string, ContextMenuItem[]>>();

  // 事件监听器取消函数
  let contextMenuEventUnlisten: UnlistenFn | null = null;

  // 处理后端发来的菜单注册/取消事件
  function handleContextMenuEvent(event: ContextMenuEvent) {
    const { action, plugin_id, context: ctx, items: rawItems } = event;

    if (action === "register") {
      // 获取或创建该 context 的 Map
      if (!registeredMenus.has(ctx)) {
        registeredMenus.set(ctx, new Map());
      }
      const contextMap = registeredMenus.get(ctx)!;

      // 将原始菜单项转换为带 pluginId 的格式
      const menuItems: ContextMenuItem[] = rawItems.map((item) => ({
        ...item,
        pluginId: plugin_id,
      }));

      // 注册该插件的菜单项
      contextMap.set(plugin_id, menuItems);
      console.log(
        `[ContextMenu] Registered ${menuItems.length} items for context "${ctx}" from plugin "${plugin_id}"`
      );
    } else if (action === "unregister") {
      // 取消注册
      const contextMap = registeredMenus.get(ctx);
      if (contextMap) {
        contextMap.delete(plugin_id);
        console.log(
          `[ContextMenu] Unregistered items for context "${ctx}" from plugin "${plugin_id}"`
        );
        // 如果该 context 下没有任何插件注册了，删除整个 context
        if (contextMap.size === 0) {
          registeredMenus.delete(ctx);
        }
      }
    }
  }

  // 初始化事件监听
  async function initContextMenuListener() {
    if (contextMenuEventUnlisten) {
      return; // 已经初始化
    }

    try {
      contextMenuEventUnlisten = await listen<ContextMenuEvent>(
        "plugin-context-menu",
        (event) => {
          handleContextMenuEvent(event.payload);
        }
      );
      console.log("[ContextMenu] Event listener initialized");
    } catch (e) {
      console.error("[ContextMenu] Failed to initialize event listener:", e);
    }
  }

  // 清理事件监听
  function cleanupContextMenuListener() {
    if (contextMenuEventUnlisten) {
      contextMenuEventUnlisten();
      contextMenuEventUnlisten = null;
    }
  }

  // 显示右键菜单
  function showContextMenu(
    ctx: string,
    posX: number,
    posY: number,
    data: string
  ) {
    // 合并所有插件的菜单项
    const allItems: ContextMenuItem[] = [];

    // 查找该 context 下所有注册的菜单项
    const contextMap = registeredMenus.get(ctx);
    if (contextMap && contextMap.size > 0) {
      contextMap.forEach((pluginItems) => {
        allItems.push(...pluginItems);
      });
    }

    // 如果不是 global context，也合并 global 的菜单项
    if (ctx !== "global") {
      const globalMap = registeredMenus.get("global");
      if (globalMap && globalMap.size > 0) {
        globalMap.forEach((pluginItems) => {
          allItems.push(...pluginItems);
        });
      }
    }

    if (allItems.length === 0) {
      return;
    }

    // 更新状态
    context.value = ctx;
    targetData.value = data;
    items.value = allItems;
    x.value = posX;
    y.value = posY;
    visible.value = true;
  }

  // 隐藏右键菜单
  function hideContextMenu() {
    visible.value = false;
    items.value = [];
    context.value = "";
    targetData.value = "";
  }

  // 处理菜单项点击
  async function handleItemClick(item: ContextMenuItem) {
    try {
      await invoke("context_menu_callback", {
        pluginId: item.pluginId,
        context: context.value,
        itemId: item.id,
        targetData: targetData.value,
      });
      console.log(
        `[ContextMenu] Callback sent: plugin=${item.pluginId}, context=${context.value}, item=${item.id}`
      );
    } catch (e) {
      console.error("[ContextMenu] Failed to send callback:", e);
    }

    // 点击后隐藏菜单
    hideContextMenu();
  }

  // 清理指定插件的所有菜单注册
  function cleanupPluginMenus(pluginId: string) {
    registeredMenus.forEach((contextMap, ctx) => {
      if (contextMap.has(pluginId)) {
        contextMap.delete(pluginId);
        console.log(
          `[ContextMenu] Cleaned up menus for plugin "${pluginId}" in context "${ctx}"`
        );
        // 如果该 context 下没有任何插件注册了，删除整个 context
        if (contextMap.size === 0) {
          registeredMenus.delete(ctx);
        }
      }
    });
  }

  // 获取当前状态（用于组件）
  function getState(): ContextMenuState {
    return {
      visible: visible.value,
      x: x.value,
      y: y.value,
      context: context.value,
      targetData: targetData.value,
      items: items.value,
    };
  }

  // 检查指定 context 是否有注册的菜单项
  function hasMenuItems(ctx: string): boolean {
    const contextMap = registeredMenus.get(ctx);
    return contextMap !== undefined && contextMap.size > 0;
  }

  return {
    // 状态
    visible,
    x,
    y,
    context,
    targetData,
    items,
    // 方法
    initContextMenuListener,
    cleanupContextMenuListener,
    showContextMenu,
    hideContextMenu,
    handleItemClick,
    cleanupPluginMenus,
    getState,
    hasMenuItems,
  };
});
