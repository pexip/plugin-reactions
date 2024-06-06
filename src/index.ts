import { registerPlugin } from '@pexip/plugin-api'
import { Emoji, IconAscii, IconSVG } from './Emoji'

const plugin = await registerPlugin({
  id: 'reactions',
  version: 0
})

const animationDuration = 7000

const button = await plugin.ui.addButton({
  position: 'toolbar',
  tooltip: Emoji.Reactions,
  icon: IconSVG.Reactions,
  group: [
    {
      id: Emoji.Applause,
      position: 'toolbar',
      tooltip: Emoji.Applause,
      icon: IconSVG.Applause
    },
    {
      id: Emoji.Love,
      position: 'toolbar',
      tooltip: Emoji.Love,
      icon: IconSVG.Love
    },
    {
      id: Emoji.Laugh,
      position: 'toolbar',
      tooltip: Emoji.Laugh,
      icon: IconSVG.Laugh
    }
  ]
})

button.onClick.add(async ({ buttonId }) => {
  try {
    await plugin.conference.sendApplicationMessage({
      payload: {
        reaction: buttonId
      }
    })
    await plugin.ui.showToast({
      message: `You reacted with ${getAsciiIcon(buttonId)}`,
      isInterrupt: true
    })
    showReactionGif(buttonId)
  } catch (e) {
    console.error(e)
  }
})

plugin.events.applicationMessage.add(async (appMessage) => {
  const reaction = appMessage.message.reaction as string
  const reactionIcon = getAsciiIcon(reaction)
  await plugin.ui.showToast({
    message: `${appMessage.displayName} reacted with ${reactionIcon}`,
    isInterrupt: true
  })
  showReactionGif(reaction)
})

const getAsciiIcon = (reaction: string): string => {
  let reactionIcon: string
  switch (reaction) {
    case Emoji.Applause:
      reactionIcon = IconAscii.Applause
      break
    case Emoji.Love:
      reactionIcon = IconAscii.Love
      break
    case Emoji.Laugh:
      reactionIcon = IconAscii.Laugh
      break
    default:
      throw new Error('Received invalid reaction')
  }
  return reactionIcon
}

const showReactionGif = (icon: string): void => {
  const basePath = getBasePath()

  const img = document.createElement('img')
  img.src = `${basePath}/images/${icon.toLowerCase()}.webp`
  img.className = 'reaction-animation'
  img.style.left = `${Math.random() * 100}%`
  img.style.bottom = '0'

  const root = parent.document.querySelector(
    'div[data-testid="in-meeting-video-wrapper"]'
  )

  if (root === null) {
    throw new Error(
      'Could not find video wrapper to attach the reaction animation.'
    )
  }

  root.appendChild(img)

  setTimeout(() => {
    img.remove()
  }, animationDuration)
}

const getBasePath = (): string => {
  return window.location.pathname.slice(
    0,
    window.location.pathname.lastIndexOf('/')
  )
}

const style = document.createElement('link')
style.rel = 'stylesheet'
style.href = getBasePath() + '/style.css'
parent.document.head.appendChild(style)
