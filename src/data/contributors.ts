/**
 * 贡献者信息
 *
 * 如果你为 Sea Lantern 做出了贡献，欢迎在这里添加你的信息！
 * 无论是代码、设计、建议、文档还是推广，你的名字都值得被记住。
 */

export interface SocialLinks {
  gitee?: string;
  github?: string;
  bilibili?: string;
  qq?: string;
  [key: string]: string | undefined;
}

export interface Contributor {
  name: string;        // 名字或昵称
  role: string;        // 角色描述
  avatar: string;      // 头像 URL
  url?: string | SocialLinks;  // 可选：个人主页链接或更多列表的
}

export const contributors: Contributor[] = [
  {
    name: "FPS_Z",
    role: "创始人 / 主要开发者",
    avatar: "https://mc-heads.net/avatar/FPS_Z/64",
    url: {
      gitee: "https://gitee.com/fps_z",
    },
  },
  {
    name: "鸽德迪",
    role: "自定义背景图方案",
    avatar: "https://mc-heads.net/avatar/Alex/64",
    //url: "https://gitee.com/fps_z",
  },  
  {
    name: "OMIILII",
    role: "精神支柱",
    avatar: "https://mc-heads.net/avatar/Alex/64",
    //url: "https://gitee.com/fps_z",
  },
  {
    name: "烬白Jinby",
    role: "自定义配色/宣传",
    avatar: "https://mc-heads.net/avatar/Jinby_6325/64",
    //url: "https://gitee.com/fps_z",
  },  
  {
    name: "凋空凌",
    role: "修复文档bug",
    avatar: "https://mc-heads.net/avatar/Alex/64",
    //url: "https://gitee.com/fps_z",
  },
  {
    name: "NIUNIU3303",
    role: "必火推荐！",
    avatar: "https://mc-heads.net/avatar/NIUNIU3303/64",
    //url: "https://gitee.com/fps_z",
  },
  {
    name: "Little_100",
    role: "打杂",
    avatar: "https://minotar.net/avatar/Little100/64",
    url: {
      gitee: "https://gitee.com/little_100",
      github: "https://github.com/Little100",
      bilibili: "https://space.bilibili.com/1492647738",
      qq: "2662308929",
    },
  },
  {
    name: "MinecraftYJQ",
    role: "小修小改罢",
    avatar: "https://minotar.net/avatar/MinecraftYJQ_/64",
  },
  {
    name: "HKYZYH",
    role: "修复Wayland协议下白屏问题",
    avatar: "https://minotar.net/avatar/HKYZYH/64",
    url: "https://gitee.com/HKYZYHgezi",
  },

  
  // ============================================
  // 在这里添加更多贡献者！
  // ============================================
  // {
  //   name: "你的名字",
  //   role: "贡献者",
  //   avatar: "https://mc-heads.net/avatar/YourName/64",
  //   url: "https://github.com/your-username",
  // },
];
