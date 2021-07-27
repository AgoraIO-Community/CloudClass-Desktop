import { globalConfigs } from '../../utilities/config'

export const getLiveRoomPath = (roomType: number) => {
  const routes = globalConfigs.routesMap
  const routePath = routes.routesPath[roomType]
  if (!routePath) {
    return routes.defaultRoutePath
  }
  return routePath
}