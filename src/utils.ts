import {
  ApplicationMessage,
  CustomIcon,
  GroupButtonPayload,
  RPCCallPayload
} from '@pexip/plugin-api'
import { CONFIG_FILE, MESSAGE_PROPERTY, RESOURCE_PATH } from './constants'
import { toolbarIcon } from './toolbaricon'

/**
 * Read the configuration file from the webPath
 * @param webPath
 * @returns The resources
 */
export const readConfig = async (webPath: string): Promise<Configuration> => {
  const response = await fetch(webPath + '/' + CONFIG_FILE)
  const configuration = await response.json()

  if (isValidConfiguration(configuration)) {
    return configuration
  } else {
    throw new Error('Invalid format for resources')
  }
}

/**
 * Read the icon from the webPath
 * @param webPath  The path to the web
 * @param resource The resource to read
 * @returns       The icon
 */
export const readIcon = async (
  webPath: string,
  resource?: Resource
): Promise<Icon> => {
  const mainIcon = await fetch(webPath + RESOURCE_PATH + resource?.icon.main)
  const mainIconData = await mainIcon.text()
  return {
    main: mainIconData,
    hover: undefined,
    text: resource?.icon.text ?? ''
  }
}

/**
 * Check if the object is a valid icon
 * @param obj The object to check
 * @returns True if the object is a valid icon
 */
const isValidIcon = (obj: any): obj is Icon => {
  return (
    obj &&
    typeof obj.main === 'string' &&
    typeof obj.hover === 'string' &&
    typeof obj.text === 'string'
  )
}

/**
 * Check if the object is a valid reaction
 * @param obj The object to check
 * @returns True if the object is a valid reaction
 */
const isValidResource = (obj: any): obj is Resource => {
  return (
    obj &&
    typeof obj.id === 'string' &&
    isValidIcon(obj.icon) &&
    (typeof obj.source === 'string' || typeof obj.animation === 'string')
  )
}

/**
 * Check if the object is a valid configuration
 * @param obj The object to check
 * @returns True if the object is a valid configuration
 */
const isValidConfiguration = (obj: any): obj is Configuration => {
  return (
    obj &&
    typeof obj.ownReactionText === 'string' &&
    Array.isArray(obj.resources) &&
    obj.resources.every(isValidResource)
  )
}

/**
 * Get the resource with the given id
 * @param id The id of the demanded resource
 * @param configuration The configuration
 */
export const getResource = (id: string, configuration: Configuration) => {
  const entry = configuration.resources.find((resource) => resource.id === id)
  return entry
}

/**
 * Create the menu group
 * @param webPath The path to the web
 * @param configuration The configuration
 * @returns The menu group
 */
export const createMenuGroup = async (
  webPath: string,
  configuration: Configuration
) => {
  const recordingGroup: RPCCallPayload<'ui:button:add'> = {
    position: 'toolbar',
    icon: { custom: toolbarIcon },
    tooltip: configuration.tooltip,
    roles: ['chair', 'guest'],
    group: await Promise.all(
      await mapResourcesToEntries(webPath, configuration.resources)
    )
  }

  return recordingGroup
}

/**
 * Map the resources to entries
 * @param webPath The path to the web
 * @param resources The resources to map
 */
const mapResourcesToEntries = async (
  webPath: string,
  resources: Resource[]
) => {
  return resources.map(async (resource) => {
    return {
      id: resource.id,
      position: 'toolbar',
      icon: { custom: await readIcon(webPath, resource) },
      roles: ['chair', 'guest'],
      tooltip: resource.icon.text
    } as unknown as GroupButtonPayload
  })
}

/**
 * Get the base path of the web
 * @returns The base path
 */
export const getBasePath = (): string => {
  return window.location.pathname.slice(
    0,
    window.location.pathname.lastIndexOf('/')
  )
}

/**
 * Read the reaction type from message
 * @param message The message to read the reaction type from
 * @returns The reaction type as string
 */
export const getMessageReactionTypeProperty = (message: ApplicationMessage) => {
  return message.message[MESSAGE_PROPERTY] as string
}
