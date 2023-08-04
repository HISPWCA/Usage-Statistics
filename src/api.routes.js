const FULL_ROUTE = window.location.href

export const APP_NAME = "Usage-Statistics"

export const API_BASE_ROUTE = FULL_ROUTE.substring(0, FULL_ROUTE.indexOf('/apps/'.concat(APP_NAME).concat('/')))

export const SERVER_URL = FULL_ROUTE.substring(0, FULL_ROUTE.indexOf('/api/apps/'.concat(APP_NAME)))

export const ORGANISATION_UNITS_ROUTE = API_BASE_ROUTE.concat('/organisationUnits.json?paging=false&fields=id,name,displayName,parent,level')

export const SUPERVISORS_ROUTE = API_BASE_ROUTE.concat('/users.json')

export const ME_ROUTE = API_BASE_ROUTE.concat('/me.json?fields=id,displayName')

export const ME_SETTINGS_ROUTE = API_BASE_ROUTE.concat('/userSettings.json')

export const ORGANISATION_UNIT_GROUP_ROUTE = API_BASE_ROUTE.concat('/organisationUnitGroups.json?paging=false')

export const PERIOD_TYPE_ROUTE = API_BASE_ROUTE.concat('/periodTypes.json?paging=false')

export const ORGANISATION_UNIT_LEVELS_ROUTE = API_BASE_ROUTE.concat('/organisationUnitLevels.json?paging=false')

export const DATA_STATISTICS_ROUTE = API_BASE_ROUTE.concat('/dataStatistics.json')

export const SQL_VIEW_ROUTE = API_BASE_ROUTE.concat('/sqlViews/tLsJ3lytSwI/data.json')

export const SQL_VIEWS_ROUTE = API_BASE_ROUTE.concat('/sqlViews')

export const META_DATAS_ROUTE = API_BASE_ROUTE.concat('/metadata')

export const USER_GROUPS_ROUTE = API_BASE_ROUTE.concat('/userGroups.json?paging=false')

export const SYSTEM_INFOS_ROUTE = API_BASE_ROUTE.concat('/system/info.json')

export const DATA_STORE_ROUTE = API_BASE_ROUTE.concat('/dataStore')



