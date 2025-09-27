import { defineConfigWithTheme } from 'vitepress'
import mdItCustomAttrs from 'markdown-it-custom-attrs'

export interface ThemeConfig {
  //navBar
  menuList: { name: string; url: string }[]

  //banner
  videoBanner: boolean
  name: string
  welcomeText: string
  motto: string[]
  social: { icon: string; url: string }[]

  //spine
  spineVoiceLang: 'zh' | 'jp'

  //footer
  footerName: string
  poweredList: { name: string; url: string }[]

  //gitalk
  clientID: string
  clientSecret: string
  repo: string
  owner: string
  admin: string[]
}

export default defineConfigWithTheme<ThemeConfig>({
  lang: 'zh-CN',

  base: '/HimariFortressCity/',

  head: [
    ['link', { rel: 'shortcut icon', href: './favicon.ico' }],
    // gitalk
    ['link', { rel: 'stylesheet', href: 'https://unpkg.com/gitalk/dist/gitalk.css' }],
    ['script', { src: 'https://unpkg.com/gitalk/dist/gitalk.min.js' }],
    // bluearchive font
    [
      'link',
      {
        rel: 'stylesheet',
        href: './font/Blueaka/Blueaka.css',
      },
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: './font/Blueaka_Bold/Blueaka_Bold.css',
      },
    ],
    // 图片灯箱
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox.css',
      },
    ],
    [
      'script',
      {
        src: 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@4.0/dist/fancybox.umd.js',
      },
    ],
  ],
  ignoreDeadLinks: true,
  // 生成站点地图
  sitemap: {
     hostname: 'https://nagisadaisuki.github.io/HimariFortressCity',
  },


  title: "Himari's 要塞都市",
  description: "Himari's Blog",
  themeConfig: {
    // navBar
    menuList: [
      { name: '首页', url: '' },
      { name: '标签', url: 'tags/' },

      { name: '要塞都市',

        url: 'https://nagisadaisuki.github.io/',

        //target: '_blank', // 在新标签页打开
        //rel: 'noopener noreferrer' // 安全属性
      },
    ],

    //banner区配置
    videoBanner: true,
    name: "Himari's 要塞都市",
    welcomeText: '涼やかなる夢想の可能性',
    motto: ['呵呵，轮到千禧的超天才清楚系病弱美少女黑客出场了吗？', 'Heh, Is it time for Millennium\'s most beautifully dainty super genius hacker to come into bloom?'],
    social: [
      { icon: 'github', url: 'https://github.com/NagisaDaisuki/' },
      { icon: 'bilibili', url: 'https://space.bilibili.com/275096023' },
      //{ icon: 'qq', url: 'https://im.qq.com/index/' },
      //{ icon: 'wechat', url: 'https://weixin.qq.com/' },
    ],

    //spine语音配置，可选zh/jp
    spineVoiceLang: 'jp',

    //footer配置
    footerName: 'Himari',
    poweredList: [
      { name: 'VitePress', url: 'https://github.com/vuejs/vitepress' },
      { name: 'GitHub Pages', url: 'https://docs.github.com/zh/pages' },
    ],

    //gitalk配置
    clientID: 'Ov23liqksFeregUyPjS3',
    clientSecret: '9e75615ffa8ec25e58609908cfb1cc74761b39ae',
    repo: 'HimariFortressCity',
    owner: 'NagisaDaisuki',
    admin: ['NagisaDaisuki'],
    //id: location.pathname, // Ensure uniqueness and length less than 50
  },
  markdown: {
    theme: 'solarized-dark',
    lineNumbers: true,
    math: true,
    config: (md) => {
      // use more markdown-it plugins!
      md.use(mdItCustomAttrs, 'image', {
        'data-fancybox': 'gallery',
      })
    },
  },
})
