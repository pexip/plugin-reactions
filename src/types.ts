/**
 * The icon interface
 * @param main The main icon
 * @param hover The hover icon
 * @param text The text
 */
interface Icon {
  main: string
  hover?: string
  text: string
}

/**
 * The resource interface
 * @param id The id
 * @param icon The icon
 */
interface Resource {
  id: string
  icon: Icon
  source: string
  toastIcon: string
}

/**
 * The configuration interface
 * @param ownReactionText The own reaction text
 * @param tooltip The tooltip for the menu bar icon
 * @param resources Array of resources
 */
interface Configuration {
  ownReactionText: string,
  tooltip: string,
  resources: Resource[]
}
