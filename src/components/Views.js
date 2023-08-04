import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Card, CenteredContent, CircularLoader, ComponentCover, NoticeBox, TableBody, TableCell, TableCellHead, TableHead, TableRow, TableRowHead } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import { useDataQuery } from '@dhis2/app-runtime'
import { Table } from 'antd'
import moment from 'moment'
import { ACTIVE_DASHBOARD_VIEW, API_MINIMUM_VERSION, CHART_VIEW, DASHBOARD_VIEW, DATA_ENTRIES_VIEW, DATA_SET_REPORT_VIEW, EVENT_CHART_VIEW, EVENT_REPORT_VIEW, MAP_VIEW, PASSIVE_DASHBOARD_VIEW, REPORT_TABLE_VIEW, VISUALIZATION_VIEW } from '../utils/constants'
import translate from '../utils/translator'


export const RenderEventTypeName = ({ eventType, version = API_MINIMUM_VERSION }) => {
    let name = ""

    if (eventType === MAP_VIEW)
        name = translate('Map')

    if (eventType === CHART_VIEW)
        name = translate('Chart')

    if (eventType === REPORT_TABLE_VIEW)
        name = translate('Report_Table')


    if (eventType === ACTIVE_DASHBOARD_VIEW)
        name = translate('Active_Dashboard')

    if (eventType === VISUALIZATION_VIEW)
        name = translate("Visualization")


    if (eventType === PASSIVE_DASHBOARD_VIEW && version >= API_MINIMUM_VERSION)
        name = translate("Passive_Dashboard")

    if (eventType === DASHBOARD_VIEW && version < API_MINIMUM_VERSION)
        name = translate("Dashboard")

    if (eventType === DATA_ENTRIES_VIEW)
        name = translate("Data_Entries")

    if (eventType === DATA_SET_REPORT_VIEW)
        name = translate("Data_Set_Report")


    if (eventType === EVENT_CHART_VIEW)
        name = translate("Event_Chart")

    if (eventType === EVENT_REPORT_VIEW)
        name = translate("Event_Report")

    if (eventType === "TOTAL")
        name = translate("Total_Views")

    return <> {name} </>
}


const topFavorisQuery = {
    favoris: {
        resource: 'dataStatistics/favorites',
        params: ({ eventType, pageSize, sortOrder, fields }) => ({
            eventType,
            pageSize,
            sortOrder,
            fields,
        }),
    },

    // passiveFavorites: {
    //     resource: 'dataStatistics/favorites',
    //     params: ({ pageSize, sortOrder, fields }) => ({
    //         eventType: 'PASSIVE_DASHBOARD_VIEW',
    //         pageSize,
    //         sortOrder,
    //         fields,
    //     }),
    // },
    // systemSettings: {
    //     resource: 'systemSettings',
    //     params: {
    //         key: 'keyCountPassiveDashboardViewsInUsageAnalytics',
    //     },
    // },
}


const TopFavoritesQuery = ({
    eventType,
    pageSize,
    sortOrder,
    version
}) => {
    const { data, error, loading, refetch, called } = useDataQuery(topFavorisQuery, { lazy: true, variables: { eventType, pageSize, sortOrder, fields: ["id", "name"] } })

    useEffect(() => {
        refetch({ eventType, pageSize, sortOrder, fields: ['position', 'name', 'views', 'id', 'created'] })
    }, [pageSize, sortOrder, eventType])



    const dataSources = data && data.favoris || []



    const columns = [
        {
            title: "Position",
            dataIndex: "position"
        },
        {
            title: i18n.t('Name'),
            dataIndex: "name"
        },
        {
            title: i18n.t('Views'),
            dataIndex: "views"
        },
        {
            title: i18n.t('Created'),
            dataIndex: "created",
            render: value => <div>{moment(value).format('YYYY-MM-DD')}</div>
        },
    ]

    const RenderTable = () => <div>
        <h6 className='py-2 fs-3 fw-bold text-center' style={{ textDecoration: "underline" }}><RenderEventTypeName version={version} eventType={eventType} /></h6>
        <Table dataSource={dataSources} bordered className='my-custom-table' size="large" columns={columns} pagination={false} />
    </div>



    if (!called || loading) {
        return (
            <ComponentCover>
                <CenteredContent>
                    <CircularLoader />
                </CenteredContent>
            </ComponentCover>
        )
    }

    if (error) {
        const title = i18n.t('Error Fetching Data ')
        const message = i18n.t('The error message was: "{{ MESSAGE }}".', {
            MESSAGE: error.message,
            nsSeparator: '>',
        })
        const fallback = i18n.t(
            'There was no error message included with the error.'
        )

        return (
            <NoticeBox error title={title}>
                {error.message ? message : fallback}
            </NoticeBox>
        )
    }

    return (
        <div className="bg-white my-shadow rounded p-3 mt-5 border">
            <RenderTable />
        </div>
    )
}


const Views = ({
    pageSize,
    sortOrder,
    eventType,
    version
}) => <TopFavoritesQuery
        eventType={eventType}
        pageSize={pageSize}
        sortOrder={sortOrder}
        version={version}
    />



Views.propTypes = {
    sortOrder: PropTypes.string.isRequired,
    pageSize: PropTypes.string.isRequired,
    eventType: PropTypes.string.isRequired,
    version: PropTypes.string.isRequired,
}

export default Views