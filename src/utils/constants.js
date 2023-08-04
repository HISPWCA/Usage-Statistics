import i18n from '@dhis2/d2-i18n'
import translate from './translator'

export const CHART_VIEW = "CHART_VIEW"
export const REPORT_TABLE_VIEW = "REPORT_TABLE_VIEW"
export const DASHBOARD_VIEW = "DASHBOARD_VIEW"
export const ACTIVE_DASHBOARD_VIEW = "DASHBOARD_VIEW"
export const PASSIVE_DASHBOARD_VIEW = "PASSIVE_DASHBOARD_VIEW"
export const MAP_VIEW = "MAP_VIEW"
export const DATA_SET_REPORT_VIEW = "DATA_SET_REPORT_VIEW"
export const DATA_ENTRIES_VIEW = "DATA_ENTRY_VIEWS"
export const VISUALIZATION_VIEW = "VISUALIZATION_VIEW"
export const EVENT_CHART_VIEW = "EVENT_CHART_VIEW"
export const EVENT_REPORT_VIEW = "EVENT_REPORT_VIEW"

export const eventTypes = [
    { value: VISUALIZATION_VIEW, label: translate('Visualization') },
    { value: MAP_VIEW, label: translate('Map') },


    { value: PASSIVE_DASHBOARD_VIEW, label: translate('Passive_Dashboard') },
    { value: ACTIVE_DASHBOARD_VIEW, label: translate('Active_Dashboard') },
    {
        value: DATA_SET_REPORT_VIEW,
        label: translate('Data_Set_Report'),
    },
    {
        value: CHART_VIEW,
        label: translate('Chart_Views'),
    },
    {
        value: REPORT_TABLE_VIEW,
        label: translate('Pivot_Table'),
    },
    {
        value: EVENT_REPORT_VIEW,
        label: translate('Event_Report'),
    },
    {
        value: EVENT_CHART_VIEW,
        label: translate('Event_Chart'),
    },
]

export const SQL_VIEW_UID = "tLsJ3lytSwI"
export const SQL_VIEW_DATA_ENTRIES_UID = "MTGO53pcrit"

export const API_MINIMUM_VERSION = 35


export const PS_5 = '5'
export const PS_10 = '10'
export const PS_15 = '15'
export const PS_20 = '20'
export const PS_25 = '25'

export const pageSizes = [
    { value: PS_5, label: '5' },
    { value: PS_10, label: '10' },
    { value: PS_15, label: '15' },
    { value: PS_20, label: '20' },
    { value: PS_25, label: '25' },
]

export const STATISTIQUE_PAGE = "STATISTIQUE_PAGE"
export const ANALYTITIQUE_PAGE = "ANALYTITIQUE_PAGE"
export const TOP_FAVORIS_PAGE = "TOP_FAVORIS_PAGE"
export const USER_RATING_PAGE = "USER_RATING_PAGE"


export const ASC = 'ASC'
export const DESC = 'DESC'

export const sortOrders = [
    { value: ASC, label: i18n.t('Ascending') },
    { value: DESC, label: i18n.t('Descending') },
]


export const DATA_VALUES = 'DATA_VALUES'
export const FAVORITES_SAVED = 'FAVORITES_SAVED'
export const FAVORITE_VIEWS = 'FAVORITE_VIEWS'
export const TOP_FAVORITES = 'TOP_FAVORITES'
export const USERS = 'USERS'


export const categories = [

    {
        /**
         * This doesn't need a subtitle because it doesn't render a graph (which
         * is the component that needs the subtitle).
         */
        value: TOP_FAVORITES,
        label: translate('Top_Favorites'),
    },
]
