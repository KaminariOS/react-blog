interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Project[] = [
  {
    title: 'rustracer',
    description: `A PBR glTF 2.0 renderer based on Vulkan ray-tracing, written in Rust.`,
    imgSrc: 'https://github.com/KaminariOS/rustracer/blob/main/images/lucy.png?raw=true',
    href: 'https://github.com/KaminariOS/rustracer',
  },
  {
    title: '@GoldStarWorldBot',
    description: `A Telegram bot that monitors abrupt price movement of tickers including gold and SPX and Trump Truth Social posts in
real time`,
    imgSrc: 'https://github.com/KaminariOS/telebot/blob/master/assets/cover.png?raw=true',
    href: 'https://github.com/KaminariOS/telebot',
  },
  {
    title: 'Verustd',
    description: "Formal verification of the functional correctness of Rust std BinaryHeap implementation",
    imgSrc: 'https://verus-lang.github.io/verus/verus/assets/verus-color.svg',
    href: 'https://github.com/KaminariOS/Verustd',
  },
  {
    title: 'Tinper',
    description: "A Dating App Simulator with 'Real' Profiles.",
    imgSrc: 'https://github.com/KaminariOS/Tinper/raw/master/public/animation.gif',
    href: 'https://github.com/KaminariOS/Tinper',
  },
]

export default projectsData
