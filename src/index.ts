import { registerPlugin } from '@pexip/plugin-api'
import {
  getBasePath,
  getResource,
  readConfig,
  createMenuGroup,
  getMessageReactionTypeProperty
} from './utils'
import { RESOURCE_PATH } from './constants'

const plugin = await registerPlugin({
  id: 'reactions',
  version: 0
})

const webPath = getBasePath()

const configuration = await readConfig(webPath)

const menuGroup = await createMenuGroup(webPath, configuration)

const btn = await plugin.ui.addButton(menuGroup).catch((e) => {
  console.warn(e)
})

btn?.onClick.add(async ({ buttonId }) => {
  createReaction(buttonId)

  const entry = getResource(buttonId, configuration)

  plugin.ui.showToast({
    message: configuration.ownReactionText + ' ' + entry?.toastIcon,
    isInterrupt: true
  })

  plugin.conference.sendApplicationMessage({
    payload: {
      'reaction-type': buttonId
    }
  })
})

const createReaction = (reactionId: string) => {
  const root = parent.document.querySelector(
    'div[data-testid="meeting-wrapper"]'
  )

  if (root === null) {
    throw new Error(
      'Could not find video wrapper to attach the reaction animation.'
    )
  }

  const entry = getResource(reactionId, configuration)
  const image = parent.document.createElement('img')

  image.setAttribute('src', webPath + RESOURCE_PATH + entry?.source)
  image.setAttribute('class', 'reactionImage')

  const randomOffset = 50 + (Math.random() - 0.5) * 80;
  image.style.left = `${randomOffset}%`
  image.style.bottom = 50 - 20 * Math.random() + 'vh'

  const id = 'rid' + Date.now()
  image.setAttribute('id', id)
  image.setAttribute('name', id)

  root.appendChild(image)
  reactionJanitor(image)
}

await plugin.events.applicationMessage.add((message) => {
  const reactionType = getMessageReactionTypeProperty(message)

  if (reactionType) {
    createReaction(reactionType)
    plugin.ui.showToast({
      message:
        message.displayName +
        ' ' +
        getResource(reactionType, configuration)?.toastIcon,
      isInterrupt: true
    })
  }
})

const reactionJanitor = (item: HTMLImageElement) => {
  item.addEventListener('animationend', function (event) {
    // Remove the element after the animation is done
    item?.remove()
  })
}

/**
 * Add the style to the parent document
 */
const style = document.createElement('link')
style.rel = 'stylesheet'
style.href = getBasePath() + '/style.css'
parent.document.head.appendChild(style)
