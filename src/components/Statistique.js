import React, { useState, useEffect } from 'react'
import { DatePicker, Table, TreeSelect, Checkbox, Select, Modal } from 'antd'
import Search from 'antd/lib/transfer/search'
import translate from '../utils/translator'
import { FaLongArrowAltDown } from 'react-icons/fa'
import { FaLongArrowAltUp } from 'react-icons/fa'
import { AiTwotoneDelete } from 'react-icons/ai'
import { FaRegEdit } from 'react-icons/fa'
import {
    META_DATAS_ROUTE,
    ME_ROUTE, ME_SETTINGS_ROUTE,
    DATA_STATISTICS_ROUTE,
    ORGANISATION_UNITS_ROUTE,
    SQL_VIEWS_ROUTE,
    SUPERVISORS_ROUTE,
    SYSTEM_INFOS_ROUTE,
    USER_GROUPS_ROUTE,
    SERVER_URL,
    APP_NAME,
    DATA_STORE_ROUTE
} from '../api.routes'
import dayjs from 'dayjs'
import {
    ACTIVE_DASHBOARD_VIEW,
    API_MINIMUM_VERSION,
    ASC, CHART_VIEW,
    DASHBOARD_VIEW,
    DATA_ENTRIES_VIEW,
    DATA_SET_REPORT_VIEW,
    DESC, EVENT_CHART_VIEW,
    EVENT_REPORT_VIEW,
    MAP_VIEW,
    pageSizes,
    PASSIVE_DASHBOARD_VIEW,
    PS_25,
    REPORT_TABLE_VIEW,
    sortOrders,
    SQL_VIEW_DATA_ENTRIES_UID,
    SQL_VIEW_UID,
    STATISTIQUE_PAGE,
    TOP_FAVORIS_PAGE,
    VISUALIZATION_VIEW
} from '../utils/constants'
import {
    AlertBar,
    ButtonStrip,
    Card,
    Center,
    CenteredContent,
    CircularLoader,
    ComponentCover,
    DataTable,
    DataTableCell,
    DataTableColumnHeader,
    DataTableRow,
    Input,
    ModalActions,
    ModalContent,
    ModalTitle,
    NoticeBox,
    SingleSelect,
    SingleSelectField,
    SingleSelectOption,
    TableBody,
    TableHead
} from '@dhis2/ui'
import Footer from './Footer'
import moment from 'moment'
import SqlViewFile from '../sqlViews.json'
import SqlViewsDataEntriesFile from '../sqlViewsDataEntries.json'
import { IoMdStats } from 'react-icons/io'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import Views, { RenderEventTypeName } from './Views'
import PageField from './PageField'
import { Button } from '@dhis2-ui/button'
import { Modal as DHIS2Modal } from '@dhis2/ui'
import { AiOutlineSetting } from 'react-icons/ai'
import { v4 as uuid } from 'uuid'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'moment/locale/en-au'
import 'moment/locale/fr'


const localizer = momentLocalizer(moment)

const DisplayNotificationRelativeOfVersion = ({ version }) => (
    <div
        style={{
            bottom: 0,
            left: 0,
            paddingLeft: 16,
            position: 'fixed',
            width: '100%',
            zIndex: 1000
        }}>
        <AlertBar permanent>
            {translate('Notification')}
        </AlertBar>

    </div>
)


const PageSizeField = ({ pageSize, setPageSize }) => (
    <div className='mt-2'>
        <SingleSelectField
            selected={pageSize}
            onChange={({ selected }) => {
                setPageSize(selected)
            }}
            label={translate('Page_Size')}
        >
            {pageSizes.map(({ label, value }) => (
                <SingleSelectOption label={label} key={value} value={value} />
            ))}
        </SingleSelectField>
    </div>
)

const SortOrderField = ({ sortOrder, setSortOrder }) => (
    <div className='mt-2'>
        <SingleSelectField
            selected={sortOrder}
            onChange={({ selected }) => {
                setSortOrder(selected)
            }}
            label={translate('Sort_Order')}
        >
            {sortOrders.map(({ label, value }) => (
                <SingleSelectOption label={label} key={value} value={value} />
            ))}
        </SingleSelectField>
    </div>
)

const EventTypeField = ({ eventType, setEventType, version }) => {

    let eventTypeList = []

    if (version < API_MINIMUM_VERSION) {
        eventTypeList = [
            { value: MAP_VIEW, label: translate('Map') },
            { value: ACTIVE_DASHBOARD_VIEW, label: translate('Active_Dashboard') },
            { value: DATA_SET_REPORT_VIEW, label: translate('Data_Set_Report') },
            { value: CHART_VIEW, label: translate('Chart_Views') },
            { value: REPORT_TABLE_VIEW, label: translate('Pivot_Table') },
            { value: EVENT_REPORT_VIEW, label: translate('Event_Report') },
            { value: EVENT_CHART_VIEW, label: translate('Event_Chart') },
        ]
    } else {
        eventTypeList = [
            { value: MAP_VIEW, label: translate('Map') },
            { value: VISUALIZATION_VIEW, label: translate('Visualization') },
            { value: ACTIVE_DASHBOARD_VIEW, label: translate('Active_Dashboard') },
            { value: PASSIVE_DASHBOARD_VIEW, label: translate('Passive_Dashboard') },
            { value: DATA_SET_REPORT_VIEW, label: translate('Data_Set_Report') },
            { value: EVENT_REPORT_VIEW, label: translate('Event_Report') },
            { value: EVENT_CHART_VIEW, label: translate('Event_Chart') },
        ]
    }

    return (
        <div className='mt-2'>
            <SingleSelectField
                selected={eventType}
                onChange={({ selected }) => {
                    setEventType(selected)
                }}
                label={translate('Event_Type')}
            >
                {
                    eventTypeList
                        .map(({ label, value }) => (
                            <SingleSelectOption label={version < API_MINIMUM_VERSION && value === ACTIVE_DASHBOARD_VIEW ? translate('Dashboard') : label} key={value} value={value} />
                        ))
                }
            </SingleSelectField>
        </div>
    )
}


const RenderAlertBar = ({
    notification,
    setNotification
}) => notification.visible ? <div
    style={{
        bottom: 0,
        left: 45,
        paddingLeft: 16,
        position: 'fixed',
        width: '100%',
        zIndex: 1000
    }}
>
    <AlertBar
        success={notification.type === "success" ? true : false}
        warning={notification.type === "warning" ? true : false}
        critical={notification.type === "critical" ? true : false}
        onHide={() => setNotification({ visible: false, message: "", type: "" })}
    >
        {notification.message}
    </AlertBar>
</div> : <></>

const DisplayUserRatingContent = ({
    visible,
    onClose,
    setSelectedEvaluationConfig,
    dataStoreConfiguration,
    loadingGetDataStoreConfiguration,
    loadDataStoreConfiguration,
    setNotification
}) => {
    const [display, setDisplay] = useState("LIST")

    const [name, setName] = useState("")
    const [activeDash, setActiveDash] = useState(0)
    const [passiveDash, setPassiveDash] = useState(0)
    const [dataEntry, setDataEntry] = useState(0)
    const [visualisation, setVisualisation] = useState(0)
    const [map, setMap] = useState(0)
    const [dataSetReport, setDataSetReport] = useState(0)
    const [eventReport, setEventReport] = useState(0)
    const [eventChart, setEventChart] = useState(0)

    const [loadingCreation, setLoadingCreation] = useState(false)
    const [currentConfig, setCurrentConfig] = useState(null)
    const [search, setSearch] = useState("")




    const handleSaveConfig = async _ => {
        try {

            if (name && name.trim() !== "") {
                setLoadingCreation(true)
                let configurationObject = {}

                if (currentConfig) {
                    configurationObject = {
                        ...dataStoreConfiguration,
                        evaluations: dataStoreConfiguration.evaluations
                            .map(config => {
                                if (config.id === currentConfig.id) {
                                    return {
                                        ...config,
                                        name: name,
                                        activeDashboard: activeDash,
                                        passiveDashboard: passiveDash,
                                        dataEntry,
                                        dataSetReport,
                                        map,
                                        eventChart,
                                        eventReport,
                                        visualization: visualisation,
                                    }
                                } else {
                                    return config
                                }
                            })
                    }
                } else {

                    configurationObject = {
                        ...dataStoreConfiguration,
                        evaluations: [
                            ...dataStoreConfiguration.evaluations,
                            {
                                id: uuid(),
                                name: name,
                                activeDashboard: activeDash,
                                passiveDashboard: passiveDash,
                                dataEntry,
                                dataSetReport,
                                map,
                                eventChart,
                                eventReport,
                                visualization: visualisation,
                            }
                        ]
                    }
                }

                const request = await fetch(
                    DATA_STORE_ROUTE
                        .concat('/')
                        .concat(APP_NAME)
                        .concat('/config')
                    , {
                        method: "put",
                        headers: {
                            "content-type": "application/json"
                        },
                        body: JSON.stringify(configurationObject)
                    })

                const response = await request.json()
                if (response.error === "ERROR")
                    throw new Error(response.message)

                setLoadingCreation(false)
                loadDataStoreConfiguration()
                setNotification({
                    visible: true,
                    message: "Operation Success...",
                    type: "success"
                })
            } else {
                throw new Error("Name is Required")
            }
        } catch (err) {
            setLoadingCreation(false)
            throw err
        }
    }



    const cleanState = () => {
        setActiveDash(0)
        setPassiveDash(0)
        setDataEntry(0)
        setVisualisation(0)
        setMap(0)
        setDataSetReport(0)
        setEventReport(0)
        setEventChart(0)
        setName("")
        setCurrentConfig(null)
    }

    const handleCancel = () => {
        if (dataStoreConfiguration?.evaluations?.length > 0) {
            setDisplay("LIST")
            setCurrentConfig(null)
        }
        cleanState()
    }

    const handleCreateNewConfig = async _ => {
        try {
            await handleSaveConfig()
            setDisplay("LIST")
            cleanState()
        } catch (err) {
            setNotification({
                visible: true,
                message: err.message,
                type: "critical"
            })
        }
    }


    const handleRemoveConfig = async config => {
        try {
            const configurationObject = {
                ...dataStoreConfiguration,
                evaluations: dataStoreConfiguration.evaluations
                    .filter(c => c.id !== config.id)
            }

            const request = await fetch(
                DATA_STORE_ROUTE
                    .concat('/')
                    .concat(APP_NAME)
                    .concat('/config')
                , {
                    method: "put",
                    headers: {
                        "content-type": "application/json"
                    },
                    body: JSON.stringify(configurationObject)
                })

            const response = await request.json()
            if (response.error === "ERROR")
                throw new Error(response.message)

            loadDataStoreConfiguration()
            setNotification({
                visible: true,
                message: "Deleting Success...",
                type: "success"
            })
            setSelectedEvaluationConfig(null)
            setCurrentConfig(null)
            cleanState()
            setDisplay("LIST")

        } catch (err) {
            setNotification({
                visible: true,
                message: "Deleting Error...",
                type: "critical"
            })
        }
    }

    const handleEditeConfig = (config) => {
        setCurrentConfig(config)
        setActiveDash(config.activeDashboard)
        setPassiveDash(config.passiveDashboard)
        setDataEntry(config.dataEntry)
        setVisualisation(config.visualization)
        setMap(config.map)
        setDataSetReport(config.dataSetReport)
        setEventReport(config.eventReport)
        setEventChart(config.eventChart)
        setName(config.name)
        setDisplay("CREATE")
    }

    const DisplayConfigSection = <div>
        <div className='mt-2'>
            <Center>
                {
                    dataStoreConfiguration?.evaluations?.length === 0 && <NoticeBox title="Configuration" warning>
                        {translate('You_Need_To_Configure_First_Datas_Before_Continous')}
                    </NoticeBox>
                }
                <Card className="mt-4">
                    <div className='p-3'>
                        <div className='row mt-2 align-items-center'>
                            <div className='col-md'>{translate('Configuration_Name')}</div>
                            <div className='col-md'>
                                <Input
                                    placeholder={translate('Configuration_Name')}
                                    value={name}
                                    onChange={({ value }) => setName("".concat(value))}
                                />
                            </div>
                        </div>

                        <hr className='my-3' />

                        <div className='row  align-items-center'>
                            <div className='col-md'>
                                {translate('Active_Dashboard')}:
                            </div>
                            <div className='col-md'>
                                <Input
                                    type="number"
                                    placeholder={translate('Evaluation')}
                                    value={activeDash}
                                    onChange={({ value }) => setActiveDash("".concat(value))}
                                />
                            </div>
                        </div>
                        <div className='row mt-1 align-items-center'>
                            <div className='col-md'>
                                {translate('Passive_Dashboard')}:
                            </div>
                            <div className='col-md'>
                                <Input
                                    type="number"
                                    placeholder={translate('Evaluation')}
                                    value={passiveDash}
                                    onChange={({ value }) => setPassiveDash("".concat(value))}
                                />
                            </div>
                        </div>
                        <div className='row mt-1 align-items-center'>
                            <div className='col-md'>
                                {translate('Visualization')}:
                            </div>
                            <div className='col-md'>
                                <Input
                                    type="number"
                                    placeholder={translate('Evaluation')}
                                    value={visualisation}
                                    onChange={({ value }) => setVisualisation("".concat(value))}
                                />
                            </div>
                        </div>
                        <div className='row mt-1 align-items-center'>
                            <div className='col-md'>
                                {translate('Map')}:
                            </div>
                            <div className='col-md'>
                                <Input
                                    type="number"
                                    placeholder={translate('Evaluation')}
                                    value={map}
                                    onChange={({ value }) => setMap("".concat(value))}
                                />
                            </div>
                        </div>

                        <div className='row mt-1 align-items-center'>
                            <div className='col-md'>
                                {translate('Data_Entries')}:
                            </div>
                            <div className='col-md'>
                                <Input
                                    type="number"
                                    placeholder={translate('Evaluation')}
                                    value={dataEntry}
                                    onChange={({ value }) => setDataEntry("".concat(value))}
                                />
                            </div>
                        </div>

                        <div className='row mt-1 align-items-center'>
                            <div className='col-md'>
                                {translate('Data_Set_Report')}:
                            </div>
                            <div className='col-md'>
                                <Input
                                    type="number"
                                    placeholder={translate('Evaluation')}
                                    value={dataSetReport}
                                    onChange={({ value }) => setDataSetReport("".concat(value))}
                                />
                            </div>
                        </div>

                        <div className='row mt-1 align-items-center'>
                            <div className='col-md'>
                                {translate('Event_Report')}:
                            </div>
                            <div className='col-md'>
                                <Input
                                    type="number"
                                    placeholder={translate('Evaluation')}
                                    value={eventReport} è
                                    onChange={({ value }) => setEventReport("".concat(value))}
                                />
                            </div>
                        </div>

                        <div className='row mt-1 align-items-center'>
                            <div className='col-md'>
                                {translate('Event_Chart')}:
                            </div>
                            <div className='col-md'>
                                <Input
                                    type="number"
                                    placeholder={translate('Evaluation')}
                                    value={eventChart}
                                    onChange={({ value }) => setEventChart("".concat(value))}
                                />
                            </div>
                        </div>

                        <div className='d-flex align-items-center mt-3'>
                            <div className='me-2'>
                                <Button
                                    small
                                    onClick={() => handleCancel()}
                                    destructive
                                >
                                    {translate('Cancel')}
                                </Button>
                            </div>
                            <div>
                                <Button
                                    small
                                    primary
                                    onClick={() => handleCreateNewConfig()}
                                    loading={loadingCreation ? true : false}
                                >
                                    {
                                        currentConfig ? translate('Update_Configuration') : translate('Save_Configuration')
                                    }
                                </Button>

                            </div>
                        </div>

                    </div>
                </Card>
            </Center>
        </div>
    </div>

    const DisplayContent = <div>
        <div className='row align-items-center'>
            <div className='col-md'>
                <Input
                    dense
                    value={search}
                    onChange={({ value }) => setSearch(value)}
                    placeholder="Search users"
                />
            </div>

            <div className='col-md text-end'>
                <Button
                    onClick={_ => setDisplay("CREATE")}
                    small
                    primary
                >
                    {translate('New_Config')}
                </Button>
            </div>
        </div>
        <div className='mt-1'>
            <DataTable>
                <TableHead>
                    <DataTableRow>
                        <DataTableColumnHeader dense fixed top="0">
                            <div style={{ fontSize: "14px", fontWeight: "bold" }}>Nom</div>
                        </DataTableColumnHeader>
                        <DataTableColumnHeader dense fixed top="0">
                            <div className='justify-content-end' style={{ fontSize: "14px", fontWeight: "bold" }}>Action</div>
                        </DataTableColumnHeader>
                    </DataTableRow>
                </TableHead>
                <TableBody loading={loadingGetDataStoreConfiguration ? true : false}>

                    {
                        dataStoreConfiguration &&
                            dataStoreConfiguration.evaluations &&
                            dataStoreConfiguration.evaluations.length > 0 ? dataStoreConfiguration.evaluations.filter(u =>
                                search && search.trim() !== "" ?
                                    u.name.toLowerCase()
                                        .includes(search?.toLowerCase()) : true)
                                .map(config => (<DataTableRow key={config.name}>
                                    <DataTableCell className="p-2">
                                        <div >{config.name}</div>
                                    </DataTableCell>
                                    <DataTableCell className="p-2 d-flex align-items-center justify-content-end">
                                        <span className='me-2'>
                                            <FaRegEdit
                                                style={{ color: "#0d6efd", fontSize: "17px", cursor: "pointer" }}
                                                onClick={() => handleEditeConfig(config)}
                                            />
                                        </span>
                                        <span>
                                            <AiTwotoneDelete
                                                style={{ color: "rgb(243 114 44)", fontSize: "17px", cursor: "pointer" }}
                                                onClick={() => handleRemoveConfig(config)}
                                            />
                                        </span>
                                    </DataTableCell>
                                </DataTableRow>)) :
                            <div className='text-center'> No Configuration </div>
                    }

                </TableBody>
            </DataTable>
        </div>
    </div >


    return visible ? <DHIS2Modal>
        <ModalTitle> {translate('Users_Rating_Configuration')} </ModalTitle>
        <ModalContent>
            {
                <div style={{ overflowX: "hidden" }}>
                    {display === "CREATE" && DisplayConfigSection}
                    {display === "LIST" && DisplayContent}
                </div>
            }
        </ModalContent>
        <ModalActions>
            <ButtonStrip end>
                <Button
                    onClick={() => {
                        onClose()
                        cleanState()
                    }}
                    small
                >
                    Close
                </Button>
            </ButtonStrip>
        </ModalActions>

    </DHIS2Modal> : <></>
}

const Statistique = () => {
    const [isDataStoreCreated, setDataStoreCreated] = useState(false)
    const [dataStoreConfiguration, setDataStoreConfiguration] = useState(null)
    const [loadingGetDataStoreConfiguration, setLoadingGetDataStoreConfiguration] = useState(false)

    const [renderPage, setRenderPage] = useState(STATISTIQUE_PAGE)
    const [eventType, setEventType] = useState(MAP_VIEW)
    const [pageSize, setPageSize] = useState(PS_25)
    const [sortOrder, setSortOrder] = useState(DESC)

    const [version, setVersion] = useState(API_MINIMUM_VERSION)
    const [isConfigurated, setConfigurated] = useState(false)
    const [loadingConfiguration, setLoadingConfiguration] = useState(false)
    const [organisationUnits, setOrganisationUnits] = useState([])
    const [organisationUnitsTree, setOrganisationUnitsTree] = useState([])
    const [loadingOrganisationUnitsTree, setLoadingOrganisationUnitsTree] = useState(false)
    const [selectedOrganisationUnit, setSelectedOrganisationUnit] = useState(null)
    const [selectedDate, setSelectedDate] = useState(null)
    const [users, setUsers] = useState([])
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [usersOuWithChildren, setUsersOuWithChildren] = useState(false)
    const [errorImportationMessage, setErrorImportationMessage] = useState(null)
    const [userGroups, setUserGroups] = useState([])
    const [selectedUserGroups, setSelectedUserGroups] = useState([])
    const [loadingUserGroups, setLoadingUserGroups] = useState(false)
    const [isDateRange, setIsDateRange] = useState(false)
    const [selectedDateRange, setSelectedDateRange] = useState([])
    const [searchInput, setSearchInput] = useState(null)
    const [visibleCalendarPopup, setVisibleCalendarPopup] = useState(false)

    const [mapSelectedDateCount, setMapSelectedDateCount] = useState(0)
    const [visualisationSelectedDateCount, setVisualisationSelectedDateCount] = useState(0)
    const [dataEntriesSelectedDateCount, setdataEntriesSelectedDateCount] = useState(0)
    const [activeDashboardSelectedDateCount, setActiveDashboardSelectedDateCount] = useState(0)
    const [dataSetReportSelectedDateCount, setDataSetReportSelectedDateCount] = useState(0)
    const [eventChartSelectedDateCount, setEventChartViewSelectedDateCount] = useState(0)
    const [eventReportSelectedDateCount, setEventReportSelectedDateCount] = useState(0)
    const [passiveDashboardSelectedDateCount, setPassiveDashboardSelectedDateCount] = useState(0)
    const [activeUsersSelectedDateCount, setActiveUsersSelectedDateCount] = useState(0)
    const [totalUsersCount, setTotalUsersCount] = useState(0)

    const [mapPrecedentDateCount, setMapPrecedentDate] = useState(0)
    const [visualisationPrecedentDateCount, setVisualisationPrecedentDate] = useState(0)
    const [dataEntriesPrecedentDateCount, setDataEntriesPrecedentDate] = useState(0)
    const [dataSetReportPrecedentDateCount, setDataSetReportPrecedentDateCount] = useState(0)
    const [activeDashboardPrecedentDateCount, setActiveDashboardPrecedentDate] = useState(0)
    const [passiveDashboardPrecedentDateCount, setPassiveDashboardPrecedentDate] = useState(0)
    const [eventChartPrecedentDateCount, setEventChartPrecedentDate] = useState(0)
    const [eventReportPrecedentDateCount, setEventReportPrecedentDate] = useState(0)
    const [activeUsersPrecedentCount, setActiveUsersPrecedentCount] = useState(0)

    const [currentEvent, setCurrentEvent] = useState([])
    const [currentEventUser, setCurrentEventUser] = useState(null)
    const [currentEventViewType, setCurrentEventViewType] = useState(null)

    const [loadingDataStatistique, setLoadingDataStatistique] = useState(false)

    const [visibleUserRatingModal, setVisibleUserRatingModal] = useState(false)
    const [selectedEvaluationConfig, setSelectedEvaluationConfig] = useState(null)
    const [notification, setNotification] = useState({ visible: false, message: "", type: "success" })

    const cleanStatistiqueStates = () => {
        setSelectedOrganisationUnit(null)
        setSelectedDate(null)
        setErrorImportationMessage(null)
        setSearchInput(null)
        setCurrentEventUser(null)
        setCurrentEventViewType(null)
        setUsers([])
        setUserGroups([])
        setCurrentEvent([])
        setSelectedDateRange([])
        setOrganisationUnits([])
        setSelectedUserGroups([])
        setOrganisationUnitsTree([])
    }

    useEffect(() => {
        getDataStoreConfigurations()
    }, [])

    useEffect(() => {
        CheckConfig()

        if (isConfigurated && renderPage === STATISTIQUE_PAGE) {
            loadApiVersion()
            loadOrganisationUnits()
            loadUserGroups()
            loadDataStatistique(moment(), setActiveUsersSelectedDateCount)
            !isDateRange && loadDataStatistique(getPrecedentDate(moment()), setActiveUsersPrecedentCount)
        } else {
            cleanStatistiqueStates()
        }

    }, [isConfigurated, renderPage])


    const calculateEvaluation = user => {

        const som = (user.nbrsPassiveDashboardViews * selectedEvaluationConfig.passiveDashboard) +
            (user.nbrsDashboardViews * selectedEvaluationConfig.activeDashboard) +
            (user.nbrsDataEntriesViews * selectedEvaluationConfig.dataEntry) +
            (user.nbrsDataSetReportViews * selectedEvaluationConfig.dataSetReport) +
            (user.nbrsEventChartViews * selectedEvaluationConfig.eventChart) +
            (user.nbrsEventReportViews * selectedEvaluationConfig.eventReport) +
            (user.nbrsVisualizationViews * selectedEvaluationConfig.visualization) +
            (user.nbrsMapViews * selectedEvaluationConfig.map)

        return som
    }

    const createDataStore = () => {
        fetch(DATA_STORE_ROUTE.concat('/').concat(APP_NAME).concat('/config'), {
            method: "post",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                evaluations: []
            })
        })
            .then(response => response.json())
            .then(response => {
                if (response.status === "ERROR")
                    throw new Error(response.message)

                getDataStoreConfigurations()
            })
            .catch(err => {
                console.log(err)
            })
    }

    const getDataStoreConfigurations = _ => {
        setLoadingGetDataStoreConfiguration(true)
        fetch(DATA_STORE_ROUTE.concat('/').concat(APP_NAME).concat('/config'))
            .then(response => response.json())
            .then(response => {
                if (response.status === "ERROR")
                    throw new Error(response.message)

                setDataStoreConfiguration(response)
                setDataStoreCreated(true)
                setLoadingGetDataStoreConfiguration(false)
                setSelectedEvaluationConfig(response.evaluations && response.evaluations.length > 0 && response.evaluations[0])
            })
            .catch(err => {
                createDataStore()
            })
    }



    const getPrecedentDate = date => dayjs(date).subtract(1, 'month').format("YYYY-MM-DD")

    const generateIntervalDatefromDate = (date = null) => {
        const startDate = date ? moment(date).startOf('month').format("YYYY-MM-DD") : moment().startOf('month').format("YYYY-MM-DD")
        const endDate = date ? moment(date).endOf('month').format("YYYY-MM-DD") : moment().endOf('month').format("YYYY-MM-DD")
        return { startDate, endDate }
    }

    const dataSources = users
        .filter(u => searchInput && searchInput.trim() !== "" ? u.name.toLowerCase().includes(searchInput?.toLowerCase()) ||
            u.userCredentials?.username?.toLowerCase()?.includes(searchInput?.toLowerCase()) : true)
        .filter(user => {
            if (selectedUserGroups.length > 0) {
                for (let ugp of selectedUserGroups) {
                    if (user.userGroups.map(u => u.id)?.includes(ugp)) {
                        return true
                    }
                }
                return false
            } else {
                return true
            }
        })
        .map(user => ({ ...user, object: { ...user, evaluation: selectedEvaluationConfig && calculateEvaluation(user) || 0 } }))


    let COLUMNS = [
        {
            title: translate("Name"),
            dataIndex: "user",
            render: user => <div>{user.name} ( {user.userCredentials?.username} )</div>
        },
        {
            title: translate("Visualization")?.concat(" ( Favoris ) "),
            dataIndex: "object",
            defaultSortOrder: 'descend',
            sorter: (a, b) => a.object.nbrsVisualizationViews - b.object.nbrsVisualizationViews,
            render: object => <div className="number-link" style={{ cursor: "pointer" }} onClick={() => handleOpenPopup(object, VISUALIZATION_VIEW)}> {object.nbrsVisualizationViews} </div>
        },
    ]



    if (version >= API_MINIMUM_VERSION) {
        COLUMNS = COLUMNS.concat(
            [
                {
                    title: translate("Active_Dashboard"),
                    dataIndex: "object",
                    defaultSortOrder: 'descend',
                    sorter: (a, b) => a.object.nbrsDashboardViews - b.object.nbrsDashboardViews,
                    render: object => <div className="number-link" style={{ cursor: "pointer" }} onClick={() => handleOpenPopup(object, DASHBOARD_VIEW)}>
                        {object.nbrsDashboardViews}
                    </div>

                },
                {
                    title: translate("Passive_Dashboard"),
                    dataIndex: "object",
                    defaultSortOrder: 'descend',
                    sorter: (a, b) => a.object.nbrsPassiveDashboardViews - b.object.nbrsPassiveDashboardViews,
                    render: object => <div className="number-link" style={{ cursor: "pointer" }} onClick={() => handleOpenPopup(object, PASSIVE_DASHBOARD_VIEW)}>
                        {object.nbrsPassiveDashboardViews}
                    </div>
                },
            ]
        )

    } else {
        COLUMNS = COLUMNS.concat(
            [
                {
                    title: translate("Dashboard"),
                    dataIndex: "object",
                    defaultSortOrder: 'descend',
                    sorter: (a, b) => a.object.nbrsDashboardViews - b.object.nbrsDashboardViews,
                    render: object => <div className="number-link" style={{ cursor: "pointer" }} onClick={() => handleOpenPopup(object, DASHBOARD_VIEW)}>
                        {object.nbrsDashboardViews}
                    </div>

                }
            ]
        )
    }

    COLUMNS = COLUMNS.concat(
        [

            {
                title: translate("Map")?.concat(" ( Favoris ) "),
                dataIndex: "object",
                defaultSortOrder: 'descend',
                sorter: (a, b) => a.object.nbrsMapViews - b.object.nbrsMapViews,
                render: object => <div className="number-link" style={{ cursor: "pointer" }} onClick={() => handleOpenPopup(object, MAP_VIEW)}>
                    {object.nbrsMapViews}
                </div>
            },

            {
                title: translate("Data_Entries"),
                dataIndex: "object",
                defaultSortOrder: 'descend',
                sorter: (a, b) => a.object.nbrsDataEntriesViews - b.object.nbrsDataEntriesViews,
                render: object => <div className="number-link" style={{ cursor: "pointer" }} onClick={() => handleOpenPopup(object, DATA_ENTRIES_VIEW)}>
                    {object.nbrsDataEntriesViews}
                </div>
            },
            {
                title: translate("Data_Set_Report"),
                dataIndex: "object",
                defaultSortOrder: 'descend',
                sorter: (a, b) => a.object.nbrsDataSetReportViews - b.object.nbrsDataSetReportViews,
                render: object => <div className="number-link" style={{ cursor: "pointer" }} onClick={() => handleOpenPopup(object, DATA_SET_REPORT_VIEW)}>
                    {object.nbrsDataSetReportViews}
                </div>
            },
            {
                title: translate("Event_Report"),
                dataIndex: "object",
                defaultSortOrder: 'descend',
                sorter: (a, b) => a.object.nbrsEventReportViews - b.object.nbrsEventReportViews,
                render: object => <div className="number-link" style={{ cursor: "pointer" }} onClick={() => handleOpenPopup(object, EVENT_REPORT_VIEW)}>
                    {object.nbrsEventReportViews}
                </div>
            },
            {
                title: translate("Event_Chart"),
                dataIndex: "object",
                defaultSortOrder: 'descend',
                sorter: (a, b) => a.object.nbrsEventChartViews - b.object.nbrsEventChartViews,
                render: object => <div className="number-link" style={{ cursor: "pointer" }} onClick={() => handleOpenPopup(object, EVENT_CHART_VIEW)}>
                    {object.nbrsEventChartViews}
                </div>
            },
            {
                title: translate("Last_Login"),
                dataIndex: "lastLogin",
                defaultSortOrder: 'descend',
                render: value => <span className='text-muted'> {value ? moment(value).locale(langString()).format("DD MMM YYYY") : ""} </span>
            },
            {
                title: translate("Total"),
                dataIndex: "object",
                defaultSortOrder: 'descend',
                sorter: (a, b) => a.object.total - b.object.total,
                render: object => <div className="number-link" style={{ cursor: "pointer" }} onClick={() => handleOpenPopup(object, "TOTAL")}>
                    {object.total}
                </div>
            },
            {
                title: translate("Evaluation"),
                dataIndex: "object",
                defaultSortOrder: 'descend',
                sorter: (a, b) => a.object.evaluation - b.object.evaluation,
                render: object => <div >
                    {object.evaluation}
                </div>
            }
        ])


    const handleOpenPopup = (object, viewType) => {
        handleCurrentEvent(object, viewType)
        setVisibleCalendarPopup(true)
    }




    const importSqlViewInDHIS2 = () => {
        setLoadingConfiguration(true)
        setErrorImportationMessage(null)

        fetch(META_DATAS_ROUTE, {
            method: "post",
            body: JSON.stringify(SqlViewFile),
            headers: {
                "content-type": "application/json"
            }
        })
            .then(response => response.json())
            .then(response => {
                if (response.status === "ERROR")
                    throw new Error(response.message)


                fetch(META_DATAS_ROUTE, {
                    method: "post",
                    body: JSON.stringify(SqlViewsDataEntriesFile),
                    headers: {
                        "content-type": "application/json"
                    }
                })
                    .then(dataEntriesResponse => dataEntriesResponse.json())
                    .then(dataEntriesResponse => {
                        if (dataEntriesResponse.status === "ERROR")
                            throw new Error(dataEntriesResponse.message)

                        setConfigurated(true)
                        setLoadingConfiguration(false)
                    })
                    .catch(err => {
                        setLoadingConfiguration(false)
                        setConfigurated(false)
                        setErrorImportationMessage(err.message)
                    })
            })
            .catch(err => {
                setLoadingConfiguration(false)
                setConfigurated(false)
                setErrorImportationMessage(err.message)
            })
    }

    const loadApiVersion = () => {
        fetch(SYSTEM_INFOS_ROUTE)
            .then(response => response.json())
            .then(response => {
                if (response.status === "ERROR")
                    throw new Error(response.message)

                const stringVersion = response.version
                const version = stringVersion?.split('.')?.[1]
                setVersion(version)
            })
            .catch(err => {
                console.log(err)
            })
    }

    const loadUserGroups = () => {
        setLoadingUserGroups(true)
        fetch(USER_GROUPS_ROUTE.concat('&fields=id,name'))
            .then(response => response.json())
            .then(response => {
                if (response.status === "ERROR")
                    throw new Error(response.message)

                setUserGroups(response.userGroups)
                setLoadingUserGroups(false)
            })
            .catch(err => {
                setLoadingUserGroups(false)
            })
    }

    const CheckConfig = () => {
        setLoadingConfiguration(true)
        const route = SQL_VIEWS_ROUTE
            .concat('/')
            .concat(SQL_VIEW_UID)
            .concat('.json')


        fetch(route)
            .then(response => response.json())
            .then(response => {
                if (response.status === "ERROR")
                    throw new Error("Error not found ")

                const dataEntrieRoute = SQL_VIEWS_ROUTE
                    .concat('/')
                    .concat(SQL_VIEW_DATA_ENTRIES_UID)
                    .concat('.json')

                fetch(dataEntrieRoute)
                    .then(dataEntriesResponse => dataEntriesResponse.json())
                    .then(dataEntriesResponse => {
                        if (dataEntriesResponse.status === "ERROR")
                            throw new Error("Error not found ")

                        setConfigurated(true)
                        setLoadingConfiguration(false)

                    })
                    .catch(err => {
                        importSqlViewInDHIS2()
                    })
            })
            .catch(err => {
                importSqlViewInDHIS2()
            })
    }

    const loadDataStatistique = (date, setState) => {
        setLoadingDataStatistique(true)
        const { startDate, endDate } = isDateRange ?
            {
                startDate: moment(selectedDateRange[0]).startOf('month').format("YYYY-MM-DD"),
                endDate: moment(selectedDateRange[1]).endOf('month').format("YYYY-MM-DD"),
            } : generateIntervalDatefromDate(date)



        const route = DATA_STATISTICS_ROUTE
            .concat('?')
            .concat('startDate=')
            .concat(startDate)
            .concat('&endDate=')
            .concat(endDate)
            .concat('&interval=MONTH')

        fetch(route)
            .then(response => response.json())
            .then(response => {
                if (response.status === "ERROR")
                    throw new Error(response.message)

                setState && setState(response[1]?.activeUsers || 0)
                setLoadingDataStatistique(false)
            })
            .catch(err => {
                console.log(err)
                setLoadingDataStatistique(false)
            })
    }

    const loadUsers = (userOrgID) => {
        setLoadingUsers(true)
        const route = SUPERVISORS_ROUTE
            .concat("?paging=false&fields=id,name,userCredentials,organisationUnits[id,path,displayName],userGroups=[id]")
            .concat("&filter=")
            .concat(
                usersOuWithChildren ?
                    "organisationUnits.path:like:"
                        .concat(userOrgID) :
                    "organisationUnits.id:eq:"
                        .concat(userOrgID))

        fetch(route)
            .then(userResponse => userResponse.json())
            .then(async userResponse => {
                if (userResponse.status === "ERROR")
                    throw new Error(userResponse.message)

                let newUserList = []

                const sqlViewsDataSelectedDate = await loadSqlViewsDatas(selectedDate ? selectedDate : moment())
                const sqlViewsDataPrecedentDate = !isDateRange && await loadSqlViewsDatas(getPrecedentDate(selectedDate ? selectedDate : moment())) || []

                newUserList = userResponse.users.map(user => {
                    const username = user.userCredentials?.username

                    let nbrsMapViews = 0
                    let nbrsPassiveDashboardViews = 0
                    let nbrsDashboardViews = 0
                    let nbrsVisualizationViews = 0
                    let nbrsDataEntriesViews = 0
                    let nbrsDataSetReportViews = 0
                    let nbrsEventReportViews = 0
                    let nbrsEventChartViews = 0
                    let total = 0

                    let nbrsMapViewsPrevious = 0
                    let nbrsPassiveDashboardViewsPrevious = 0
                    let nbrsDashboardViewsPrevious = 0
                    let nbrsVisualizationViewsPrevious = 0
                    let nbrsDataEntriesViewsPrevious = 0
                    let nbrsDataSetReportViewsPrevious = 0
                    let nbrsEventReportViewsPrevious = 0
                    let nbrsEventChartViewsPrevious = 0
                    let totalPrevious = 0


                    let passiveDashboardEvent = {}
                    let activeDashboardEvent = {}
                    let dataEntryEvent = {}
                    let mapEvent = {}
                    let dataSetEvent = {}
                    let visualizationEvent = {}
                    let eventReportEvent = {}
                    let eventChartEvent = {}
                    let totalEvents = {}

                    for (let viewData of sqlViewsDataSelectedDate) {
                        if (viewData.view === MAP_VIEW && username === viewData.username) {
                            nbrsMapViews += 1
                            const key = moment(viewData.date).format('YYYY-MM-DD')
                            mapEvent[key] = (mapEvent[key] || 0) + 1
                        }

                        if (viewData.view === PASSIVE_DASHBOARD_VIEW && username === viewData.username) {
                            nbrsPassiveDashboardViews += 1
                            const key = moment(viewData.date).format('YYYY-MM-DD')
                            passiveDashboardEvent[key] = (passiveDashboardEvent[key] || 0) + 1
                        }

                        if (viewData.view === DASHBOARD_VIEW && username === viewData.username) {
                            nbrsDashboardViews += 1
                            const key = moment(viewData.date).format('YYYY-MM-DD')
                            activeDashboardEvent[key] = (activeDashboardEvent[key] || 0) + 1
                        }

                        if (viewData.view === DATA_ENTRIES_VIEW && username === viewData.username) {
                            nbrsDataEntriesViews += 1
                            const key = moment(viewData.date).format('YYYY-MM-DD')
                            dataEntryEvent[key] = (dataEntryEvent[key] || 0) + 1
                        }

                        if (viewData.view === DATA_SET_REPORT_VIEW && username === viewData.username) {
                            nbrsDataSetReportViews += 1
                            const key = moment(viewData.date).format('YYYY-MM-DD')
                            dataSetEvent[key] = (dataSetEvent[key] || 0) + 1
                        }

                        if (viewData.view === EVENT_CHART_VIEW && username === viewData.username) {
                            nbrsEventChartViews += 1
                            const key = moment(viewData.date).format('YYYY-MM-DD')
                            eventChartEvent[key] = (eventChartEvent[key] || 0) + 1
                        }

                        if (viewData.view === EVENT_REPORT_VIEW && username === viewData.username) {
                            nbrsEventReportViews += 1
                            const key = moment(viewData.date).format('YYYY-MM-DD')
                            eventReportEvent[key] = (eventReportEvent[key] || 0) + 1
                        }

                        if (
                            viewData.view === CHART_VIEW && username === viewData.username ||
                            viewData.view === VISUALIZATION_VIEW && username === viewData.username ||
                            viewData.view === REPORT_TABLE_VIEW && username === viewData.username
                        ) {
                            nbrsVisualizationViews += 1
                            const key = moment(viewData.date).format('YYYY-MM-DD')
                            visualizationEvent[key] = (visualizationEvent[key] || 0) + 1
                        }

                        if (
                            viewData.username === username && viewData.view === DASHBOARD_VIEW ||
                            viewData.username === username && viewData.view === PASSIVE_DASHBOARD_VIEW && version >= API_MINIMUM_VERSION ||
                            viewData.username === username && viewData.view === REPORT_TABLE_VIEW ||
                            viewData.username === username && viewData.view === DATA_SET_REPORT_VIEW ||
                            viewData.username === username && viewData.view === MAP_VIEW ||
                            viewData.username === username && viewData.view === DATA_ENTRIES_VIEW ||
                            viewData.username === username && viewData.view === VISUALIZATION_VIEW ||
                            viewData.username === username && viewData.view === CHART_VIEW ||
                            viewData.username === username && viewData.view === EVENT_CHART_VIEW ||
                            viewData.username === username && viewData.view === EVENT_REPORT_VIEW
                        ) {
                            total += 1
                            const key = moment(viewData.date).format('YYYY-MM-DD')

                            const passiveDashboardValue = passiveDashboardEvent[key] || 0
                            const activeDashboardValue = activeDashboardEvent[key] || 0
                            const dataEntryValue = dataEntryEvent[key] || 0
                            const dataSetValue = dataSetEvent[key] || 0
                            const visualizationValue = visualizationEvent[key] || 0
                            const eventReportValue = eventReportEvent[key] || 0
                            const mapValue = mapEvent[key] || 0
                            const eventChartValue = eventChartEvent[key] || 0

                            const t = passiveDashboardValue +
                                activeDashboardValue +
                                dataEntryValue +
                                dataSetValue +
                                visualizationValue +
                                eventReportValue +
                                mapValue +
                                eventChartValue

                            totalEvents[key] = t


                        }

                    }




                    if (!isDateRange) {
                        for (let viewData of sqlViewsDataPrecedentDate) {
                            if (viewData.view === MAP_VIEW && username === viewData.username) {
                                nbrsMapViewsPrevious += 1
                            }

                            if (viewData.view === PASSIVE_DASHBOARD_VIEW && username === viewData.username) {
                                nbrsPassiveDashboardViewsPrevious += 1
                            }

                            if (viewData.view === DASHBOARD_VIEW && username === viewData.username) {
                                nbrsDashboardViewsPrevious += 1
                            }

                            if (viewData.view === DATA_ENTRIES_VIEW && username === viewData.username) {
                                nbrsDataEntriesViewsPrevious += 1
                            }

                            if (viewData.view === DATA_SET_REPORT_VIEW && username === viewData.username) {
                                nbrsDataSetReportViewsPrevious += 1
                            }
                            if (viewData.view === EVENT_CHART_VIEW && username === viewData.username) {
                                nbrsEventChartViewsPrevious += 1
                            }

                            if (viewData.view === EVENT_REPORT_VIEW && username === viewData.username) {
                                nbrsEventReportViewsPrevious += 1
                            }


                            if (
                                viewData.view === CHART_VIEW && username === viewData.username ||
                                viewData.view === VISUALIZATION_VIEW && username === viewData.username ||
                                viewData.view === REPORT_TABLE_VIEW && username === viewData.username
                            ) {
                                nbrsVisualizationViewsPrevious += 1
                            }


                        }

                    }

                    return {
                        id: user.id,
                        userGroups: user.userGroups,
                        name: user.name,
                        userCredentials: user.userCredentials,
                        username,
                        lastLogin: user.userCredentials?.lastLogin,
                        user,
                        nbrsMapViews,
                        nbrsDashboardViews,
                        nbrsPassiveDashboardViews,
                        nbrsVisualizationViews,
                        nbrsDataEntriesViews,
                        nbrsEventChartViews,
                        nbrsEventReportViews,
                        total,
                        nbrsMapViewsPrevious,
                        nbrsPassiveDashboardViewsPrevious,
                        nbrsDashboardViewsPrevious,
                        nbrsVisualizationViewsPrevious,
                        nbrsDataEntriesViewsPrevious,
                        nbrsEventChartViewsPrevious,
                        nbrsEventReportViewsPrevious,
                        totalPrevious,
                        nbrsDataSetReportViewsPrevious,
                        nbrsDataSetReportViews,
                        passiveDashboardEvent,
                        activeDashboardEvent,
                        dataEntryEvent,
                        mapEvent,
                        dataSetEvent,
                        visualizationEvent,
                        eventChartEvent,
                        eventReportEvent,
                        totalEvents
                    }
                })

                let mapSelectedDateCount = 0
                let visualisationSelectedDateCount = 0
                let dataEntriesSelectedDateCount = 0
                let activeDashboardSelectedDateCount = 0
                let passiveDashboardSelectedDateCount = 0
                let dataSetReportSelectedDateCount = 0
                let eventReportSelectedDateCount = 0
                let eventChartSelectedDateCount = 0

                let mapPrecedentDateCount = 0
                let visualisationPrecedentDateCount = 0
                let dataEntriesPrecedentDateCount = 0
                let activeDashboardPrecedentDateCount = 0
                let passiveDashboardPrecedentDateCount = 0
                let dataSetReportPrecedentDateCount = 0
                let eventReportPrecedentDateCount = 0
                let eventChartPrecedentDateCount = 0


                for (let user of newUserList) {
                    mapSelectedDateCount += user.nbrsMapViews
                    visualisationSelectedDateCount += user.nbrsVisualizationViews
                    dataEntriesSelectedDateCount += user.nbrsDataEntriesViews
                    activeDashboardSelectedDateCount += user.nbrsDashboardViews
                    passiveDashboardSelectedDateCount += user.nbrsPassiveDashboardViews
                    eventReportSelectedDateCount += user.nbrsEventReportViews
                    eventChartSelectedDateCount += user.nbrsEventChartViews
                    mapPrecedentDateCount += user.nbrsMapViewsPrevious
                    visualisationPrecedentDateCount += user.nbrsVisualizationViewsPrevious
                    dataEntriesPrecedentDateCount += user.nbrsDataEntriesViewsPrevious
                    activeDashboardPrecedentDateCount += user.nbrsDashboardViewsPrevious
                    passiveDashboardPrecedentDateCount += user.nbrsPassiveDashboardViewsPrevious
                    dataSetReportPrecedentDateCount += user.nbrsDataSetReportViewsPrevious
                    dataSetReportSelectedDateCount += user.nbrsDataSetReportViews
                    eventReportPrecedentDateCount += user.nbrsEventReportViewsPrevious
                    eventChartPrecedentDateCount += user.nbrsEventChartViewsPrevious
                }


                setMapSelectedDateCount(mapSelectedDateCount)
                setVisualisationSelectedDateCount(visualisationSelectedDateCount)
                setdataEntriesSelectedDateCount(dataEntriesSelectedDateCount)
                setActiveDashboardSelectedDateCount(activeDashboardSelectedDateCount)
                setPassiveDashboardSelectedDateCount(passiveDashboardSelectedDateCount)
                setMapPrecedentDate(mapPrecedentDateCount)
                setVisualisationPrecedentDate(visualisationPrecedentDateCount)
                setDataEntriesPrecedentDate(dataEntriesPrecedentDateCount)
                setActiveDashboardPrecedentDate(activeDashboardPrecedentDateCount)
                setPassiveDashboardPrecedentDate(passiveDashboardPrecedentDateCount)
                setDataSetReportSelectedDateCount(dataSetReportSelectedDateCount)
                setDataSetReportPrecedentDateCount(dataSetReportPrecedentDateCount)
                setEventReportPrecedentDate(eventReportPrecedentDateCount)
                setEventChartPrecedentDate(eventChartPrecedentDateCount)
                setEventChartViewSelectedDateCount(eventChartSelectedDateCount)
                setEventReportSelectedDateCount(eventReportSelectedDateCount)
                setUsers(newUserList)
                setLoadingUsers(false)
                setTotalUsersCount(newUserList.length)
            })
            .catch(err => {
                setLoadingUsers(false)
            })
    }

    const handleCurrentEvent = (object, viewType) => {

        setCurrentEventUser(object.user.name)
        setCurrentEventViewType(viewType)

        if (viewType === PASSIVE_DASHBOARD_VIEW) {
            const event_list = Object.entries(object.passiveDashboardEvent).map(([key, value], index) => ({
                id: index,
                title: "Passv.Dash".concat(' : ').concat(value),
                start: key,
                end: key
            }))

            setCurrentEvent(event_list)
        }

        if (viewType === DASHBOARD_VIEW) {
            const event_list = Object.entries(object.activeDashboardEvent).map(([key, value], index) => ({
                id: index,
                title: "Dash".concat(' : ').concat(value),
                start: key,
                end: key
            }))

            setCurrentEvent(event_list)
        }

        if (viewType === MAP_VIEW) {
            const event_list = Object.entries(object.mapEvent).map(([key, value], index) => ({
                id: index,
                title: "Map".concat(' : ').concat(value),
                start: key,
                end: key
            }))

            setCurrentEvent(event_list)
        }

        if (viewType === DATA_ENTRIES_VIEW) {
            const event_list = Object.entries(object.dataEntryEvent).map(([key, value], index) => ({
                id: index,
                title: "Dat.Entry".concat(' : ').concat(value),
                start: key,
                end: key
            }))

            setCurrentEvent(event_list)
        }

        if (viewType === DATA_SET_REPORT_VIEW) {
            const event_list = Object.entries(object.dataSetEvent).map(([key, value], index) => ({
                id: index,
                title: "Dat.Rep".concat(' : ').concat(value),
                start: key,
                end: key
            }))

            setCurrentEvent(event_list)
        }

        if (viewType === VISUALIZATION_VIEW) {
            const event_list = Object.entries(object.visualizationEvent).map(([key, value], index) => ({
                id: index,
                title: "Vis".concat(' : ').concat(value),
                start: key,
                end: key
            }))

            setCurrentEvent(event_list)
        }


        if (viewType === EVENT_CHART_VIEW) {
            const event_list = Object.entries(object.eventChartEvent).map(([key, value], index) => ({
                id: index,
                title: "Ev.Chart".concat(' : ').concat(value),
                start: key,
                end: key
            }))

            setCurrentEvent(event_list)
        }



        if (viewType === EVENT_REPORT_VIEW) {
            const event_list = Object.entries(object.eventReportEvent).map(([key, value], index) => ({
                id: index,
                title: "Ev.Rep".concat(' : ').concat(value),
                start: key,
                end: key
            }))

            setCurrentEvent(event_list)
        }


        if (viewType === "TOTAL") {
            const event_list = Object.entries(object.totalEvents).map(([key, value], index) => ({
                id: index,
                title: "Total".concat(' : ').concat(value),
                start: key,
                end: key
            }))

            setCurrentEvent(event_list)
        }

    }

    const loadSqlViewsDatas = async (date) => {
        const { startDate, endDate } = isDateRange ?
            {
                startDate: moment(selectedDateRange[0]).startOf('month').format("YYYY-MM-DD"),
                endDate: moment(selectedDateRange[1]).endOf('month').format("YYYY-MM-DD"),
            } :
            generateIntervalDatefromDate(date)

        const route = SQL_VIEWS_ROUTE
            .concat("/")
            .concat(SQL_VIEW_UID)
            .concat("/")
            .concat('data.json')
            .concat("?")
            .concat("paging=false&")
            .concat("var=dateDebut:")
            .concat(startDate)
            .concat('&')
            .concat("var=dateFin:")
            .concat(endDate)

        const sqlViewRequest = await fetch(route, { headers: { 'Cache-Control': 'no-cache' } })
        const sqlViewResponse = await sqlViewRequest.json()
        if (sqlViewResponse.status === "ERROR")
            throw new Error(sqlViewResponse.message)


        const dataEntriesRoute = SQL_VIEWS_ROUTE
            .concat("/")
            .concat(SQL_VIEW_DATA_ENTRIES_UID)
            .concat("/")
            .concat('data.json')
            .concat("?")
            .concat("paging=false&")
            .concat("var=dateDebut:")
            .concat(startDate)
            .concat('&')
            .concat("var=dateFin:")
            .concat(endDate)

        const dataEntriesRequest = await fetch(dataEntriesRoute, { headers: { 'Cache-Control': 'no-cache' } })
        const dataEntriesResponse = await dataEntriesRequest.json()
        if (dataEntriesResponse.status === "ERROR")
            throw new Error(dataEntriesResponse.message)


        const rows = sqlViewResponse.rows?.length > 0 ? sqlViewResponse.rows : sqlViewResponse.listGrid ? sqlViewResponse.listGrid?.rows : []

        let newList = rows.map(r => ({
            view: r[1],
            username: r[3],
            date: r[2]
        }))

        newList = dataEntriesResponse.listGrid ? [...newList, ...dataEntriesResponse.listGrid?.rows?.map(r => ({ view: DATA_ENTRIES_VIEW, username: r[0] }))] :
            dataEntriesResponse.rows?.length > 0 ? [...newList, ...dataEntriesResponse?.rows?.map(r => ({ view: DATA_ENTRIES_VIEW, username: r[0] }))]
                : [...newList]

        return newList

    }


    const generateTreeFromOrgUnits = (ouList = [], parentId = null, level = 1) => {
        let orgUnits = ouList.map(o => {
            return {
                key: o.id,
                id: o.id,
                label: o.displayName,
                title: o.displayName,
                data: o,
                level: o.level,
                value: o.id,
                children: [],
                parent: (o.parent !== null && o.parent !== undefined) ? o.parent.id : null
            }
        })

        let nodes = parentId ? orgUnits.filter(o => o.id === parentId) : orgUnits.filter(o => o.level === level)

        nodes.forEach(o => {
            o.children = orgUnits.filter(org => org.parent === o.id)

            o.children.forEach(a => {
                a.children = orgUnits.filter(org => org.parent === a.id)

                a.children.forEach(b => {
                    b.children = orgUnits.filter(org => org.parent === b.id)

                    b.children.forEach(c => {
                        c.children = orgUnits.filter(org => org.parent === c.id)

                        c.children.forEach(d => {
                            d.children = orgUnits.filter(org => org.parent === d.id)

                            d.children.forEach(e => {
                                e.children = orgUnits.filter(org => org.parent === e.id)

                                e.children.forEach(f => {
                                    f.children = orgUnits.filter(org => org.parent === f.id)

                                    f.children.forEach(g => {
                                        g.children = orgUnits.filter(org => org.parent === g.id)

                                        g.children.forEach(h => {
                                            h.children = orgUnits.filter(org => org.parent === h.id)

                                            h.children.forEach(i => {
                                                i.children = orgUnits.filter(org => org.parent === i.id)

                                                i.children.forEach(j => {
                                                    j.children = orgUnits.filter(org => org.parent === j.id)

                                                    j.children.forEach(k => {
                                                        k.children = orgUnits.filter(org => org.parent === k.id)

                                                        k.children.forEach(l => {
                                                            l.children = orgUnits.filter(org => org.parent === l.id)

                                                            l.children.forEach(m => {
                                                                m.children = orgUnits.filter(org => org.parent === m.id)

                                                                m.children.forEach(n => {
                                                                    n.children = orgUnits.filter(org => org.parent === n.id)

                                                                    n.children.forEach(p => {
                                                                        p.children = orgUnits.filter(org => org.parent === p.id)

                                                                        p.children.forEach(q => {
                                                                            q.children = orgUnits.filter(org => org.parent === q.id)

                                                                            q.children.forEach(r => {
                                                                                r.children = orgUnits.filter(org => org.parent === r.id)

                                                                                r.children.forEach(s => {
                                                                                    s.children = orgUnits.filter(org => org.parent === s.id)

                                                                                    s.children.forEach(t => {
                                                                                        t.children = orgUnits.filter(org => org.parent === t.id)

                                                                                        t.children.forEach(u => {
                                                                                            u.children = orgUnits.filter(org => org.parent === u.id)

                                                                                            u.children.forEach(v => {
                                                                                                v.children = orgUnits.filter(org => org.parent === v.id)

                                                                                                v.children.forEach(w => {
                                                                                                    w.children = orgUnits.filter(org => org.parent === w.id)

                                                                                                    w.children.forEach(x => {
                                                                                                        x.children = orgUnits.filter(org => org.parent === x.id)

                                                                                                        x.children.forEach(y => {
                                                                                                            y.children = orgUnits.filter(org => org.parent === y.id)

                                                                                                            y.children.forEach(z => {
                                                                                                                z.children = orgUnits.filter(org => org.parent === z.id)
                                                                                                            })
                                                                                                        })
                                                                                                    })
                                                                                                })
                                                                                            })
                                                                                        })
                                                                                    })
                                                                                })
                                                                            })
                                                                        })
                                                                    })
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })

        return nodes
    }


    const loadOrganisationUnits = () => {
        setLoadingOrganisationUnitsTree(true)
        fetch(ME_ROUTE.concat(',organisationUnits'))
            .then(response => response.json())
            .then(response => {
                const userOrganisationUnitId = response.organisationUnits.length !== 0 && response.organisationUnits[0].id
                loadMeSettings()
                if (userOrganisationUnitId) {
                    fetch(ORGANISATION_UNITS_ROUTE)
                        .then(response => response.json())
                        .then(datas => {

                            setOrganisationUnits(datas.organisationUnits)
                            setOrganisationUnitsTree(generateTreeFromOrgUnits(datas.organisationUnits, userOrganisationUnitId))
                            setLoadingOrganisationUnitsTree(false)
                            setSelectedOrganisationUnit(userOrganisationUnitId)
                            setSelectedDate(moment())
                            loadUsers(userOrganisationUnitId)
                        })
                        .catch(err => {
                            setLoadingOrganisationUnitsTree(false)
                        })
                }
            })
    }


    const loadMeSettings = async _ => {
        try {
            const result = await fetch(ME_SETTINGS_ROUTE)
            if (result.status === "ERROR")
                throw new Error(result.message)

            const response = await result.json()
            localStorage.setItem('userLang', response.keyUiLocale ? response.keyUiLocale : 'fr')
        } catch (err) {
            console.log("Error :", err)
        }
    }


    const handleCancelCalendarPopup = () => setVisibleCalendarPopup(false)


    const DisplayModalName = <div className='d-flex align-items-center'>
        <div className='me-2 fw-bold'>
            {currentEventUser}
        </div> |
        <div className='bg-danger text-white ms-2 fw-bold px-1 rounded'>
            <RenderEventTypeName version={version} eventType={currentEventViewType} />
        </div>
    </div>


    const DisplayCalendarPopup = <Modal
        title={DisplayModalName}
        width={800}
        visible={visibleCalendarPopup}
        onOk={() => handleCancelCalendarPopup()}
        onCancel={() => handleCancelCalendarPopup()}
    >
        <Calendar
            localizer={localizer}
            events={currentEvent}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 350 }}
            views={['month']}
        />
    </Modal>


    const langString = () => localStorage.getItem('userLang') === "en" ? "en-au" : localStorage.getItem('userLang')


    const DisplayVisualisationBox = <div className="me-2">
        <div className="bg-white rounded my-shadow p-2 mb-1 d-flex align-items-center  container-single-box" style={{ border: "1px solid #ccc", borderLeft: "10px solid #fca311" }}>
            <div className='d-flex align-items-center justify-content-center w-100' >
                <div className='d-flex align-items-center flex-column justify-content-center'>
                    <div className='d-flex align-items-center'>
                        <div style={{ color: "#fca311", fontSize: "20px" }} className="font-weight-bold">{loadingUsers ? <span className='my-spinner'> </span> : visualisationSelectedDateCount}</div>
                        <div className="ms-3">
                            <div style={{ fontSize: "12px" }} className="fw-bold"> {translate("Visualization")} <span className='ms-1 text-muted' style={{ fontSize: '9px' }}>( {translate("Favorites")} )</span></div>
                            <div className="text-muted" style={{ fontSize: "13px" }}>{
                                isDateRange ? <span>
                                    {moment(selectedDateRange[0]).locale(langString()).format('MMM YYYY')} {" ".concat(translate('To').concat(" "))}  {moment(selectedDateRange[1]).locale(langString()).format('MMM YYYY')}
                                </span> :
                                    <span>{moment(generateIntervalDatefromDate(selectedDate).endDate).locale(langString()).format('MMM YYYY')}</span>
                            }
                            </div>
                        </div>
                    </div>

                    {!isDateRange && <div className='mt-1'>
                        <div className="text-muted d-flex flex-wrap align-items-center mt-1" >
                            <div style={{ fontSize: "11px" }} className="fw-bold me-1">{translate("Previous")} </div>
                            <div style={{ fontSize: "10px" }}>( {moment(getPrecedentDate(selectedDate)).locale(langString()).format('MMM YYYY')} ) : </div>
                            <div className='fw-bold ms-2' style={{ fontSize: "12px" }}>{loadingUsers ? <span className='my-spinner'> </span> : visualisationPrecedentDateCount} </div>
                        </div>
                    </div>}
                </div>

                {!isDateRange && <div className='ms-2'>
                    {
                        visualisationPrecedentDateCount > visualisationSelectedDateCount ?
                            <FaLongArrowAltDown style={{ fontSize: "35px", color: "#ef233c" }} /> :
                            visualisationPrecedentDateCount < visualisationSelectedDateCount &&
                            <FaLongArrowAltUp style={{ fontSize: "35px", color: "#0acf97" }} />
                    }
                </div>}
            </div>
        </div>
    </div>


    const DisplayActiveDashboardBox = <div className="me-2" >
        <div className="bg-white rounded my-shadow p-2 mb-1  d-flex align-items-center container-single-box" style={{ border: "1px solid #ccc", borderLeft: "10px solid #216869" }}>
            <div className='d-flex align-items-center justify-content-center w-100' >
                <div className='d-flex align-items-center flex-column justify-content-center'>
                    <div className='d-flex align-items-center'>
                        <div style={{ color: "#216869", fontSize: "20px" }} className="font-weight-bold">{loadingUsers ? <span className='my-spinner'> </span> : activeDashboardSelectedDateCount}</div>
                        <div className="ms-3">
                            <div style={{ fontSize: "12px" }} className="fw-bold"> {translate(version >= API_MINIMUM_VERSION ? "Active_Dashboard" : "Dashboard")}</div>
                            <div className="text-muted" style={{ fontSize: "13px" }}>{
                                isDateRange ? <span>
                                    {moment(selectedDateRange[0]).locale(langString()).format('MMM YYYY')} {" ".concat(translate('To').concat(" "))}  {moment(selectedDateRange[1]).locale(langString()).format('MMM YYYY')}
                                </span> :
                                    <span>{moment(generateIntervalDatefromDate(selectedDate).endDate).locale(langString()).format('MMM YYYY')}</span>
                            }</div>
                        </div>
                    </div>

                    {!isDateRange && <div className='mt-1'>
                        <div className="text-muted d-flex flex-wrap align-items-center mt-1" >
                            <div style={{ fontSize: "11px" }} className="fw-bold me-1">{translate("Previous")} </div>
                            <div style={{ fontSize: "10px" }}>( {moment(getPrecedentDate(selectedDate)).locale(langString()).format('MMM YYYY')} ) : </div>
                            <div className='fw-bold ms-2' style={{ fontSize: "12px" }}>{loadingUsers ? <span className='my-spinner'> </span> : activeDashboardPrecedentDateCount} </div>
                        </div>
                    </div>}
                </div>
                {!isDateRange && <div className='ms-2'>
                    {
                        activeDashboardPrecedentDateCount > activeDashboardSelectedDateCount ?
                            <FaLongArrowAltDown style={{ fontSize: "35px", color: "#ef233c" }} /> :
                            activeDashboardPrecedentDateCount < activeDashboardSelectedDateCount &&
                            <FaLongArrowAltUp style={{ fontSize: "35px", color: "#0acf97" }} />
                    }
                </div>}
            </div>
        </div>
    </div>


    const DisplayPassiveDashboardBox = <div className="me-2">
        <div className="bg-white rounded d-flex align-items-center my-shadow p-2 mb-1  container-single-box" style={{ border: "1px solid #ccc", borderLeft: "10px solid #0077b6" }}>
            <div className='d-flex align-items-center justify-content-center w-100' >
                <div className='d-flex align-items-center flex-column justify-content-center'>
                    <div className='d-flex align-items-center'>
                        <div style={{ color: "#0077b6", fontSize: "20px" }} className="font-weight-bold">{loadingUsers ? <span className='my-spinner'> </span> : passiveDashboardSelectedDateCount}</div>
                        <div className="ms-3">
                            <div style={{ fontSize: "12px" }} className="fw-bold"> {translate("Passive_Dashboard")}</div>
                            <div className="text-muted" style={{ fontSize: "13px" }}>{
                                isDateRange ? <span>
                                    {moment(selectedDateRange[0]).locale(langString()).format('MMM YYYY')} {" ".concat(translate('To').concat(" "))}  {moment(selectedDateRange[1]).locale(langString()).format('MMM YYYY')}
                                </span> :
                                    <span>{moment(generateIntervalDatefromDate(selectedDate).endDate).locale(langString()).format('MMM YYYY')}</span>
                            }</div>
                        </div>
                    </div>

                    {!isDateRange && <div className='mt-1'>
                        <div className="text-muted d-flex flex-wrap align-items-center mt-1" >
                            <div style={{ fontSize: "11px" }} className="fw-bold me-1">{translate("Previous")} </div>
                            <div style={{ fontSize: "10px" }}>( {moment(getPrecedentDate(selectedDate)).locale(langString()).format('MMM YYYY')} ) : </div>
                            <div className='fw-bold ms-2' style={{ fontSize: "12px" }}>{loadingUsers ? <span className='my-spinner'> </span> : passiveDashboardPrecedentDateCount} </div>
                        </div>
                    </div>}
                </div>
                {!isDateRange && <div className='ms-2'>
                    {
                        passiveDashboardPrecedentDateCount > passiveDashboardSelectedDateCount ?
                            <FaLongArrowAltDown style={{ fontSize: "35px", color: "#ef233c" }} /> :
                            passiveDashboardPrecedentDateCount < passiveDashboardSelectedDateCount &&
                            <FaLongArrowAltUp style={{ fontSize: "35px", color: "#0acf97" }} />
                    }
                </div>}

            </div>
        </div>
    </div>


    const DisplayMapBox = <div className="me-2" >
        <div className="bg-white rounded my-shadow p-2 mb-1 d-flex align-items-center container-single-box" style={{ border: "1px solid #ccc", borderLeft: "10px solid #0acf97" }}>
            <div className='d-flex align-items-center justify-content-center w-100' >
                <div className='d-flex align-items-center flex-column justify-content-center'>
                    <div className='d-flex align-items-center'>
                        <div style={{ color: "#0acf97", fontSize: "20px" }} className="font-weight-bold">{loadingUsers ? <span className='my-spinner'> </span> : mapSelectedDateCount} </div>
                        <div className="ms-3">
                            <div style={{ fontSize: "12px" }} className="fw-bold"> {translate("Map")} <span className='ms-1 text-muted' style={{ fontSize: '9px' }}>( {translate("Favorites")} )</span></div>
                            <div className="text-muted" style={{ fontSize: "13px" }}>{
                                isDateRange ? <span>
                                    {moment(selectedDateRange[0]).locale(langString()).format('MMM YYYY')} {" ".concat(translate('To').concat(" "))}  {moment(selectedDateRange[1]).locale(langString()).format('MMM YYYY')}
                                </span> :
                                    <span>{moment(generateIntervalDatefromDate(selectedDate).endDate).locale(langString()).format('MMM YYYY')}</span>
                            }</div>
                        </div>
                    </div>

                    {!isDateRange && <div className='mt-1'>
                        <div className="text-muted d-flex flex-wrap align-items-center mt-1" >
                            <div style={{ fontSize: "11px" }} className="fw-bold me-1">{translate("Previous")} </div>
                            <div style={{ fontSize: "10px" }}>( {moment(getPrecedentDate(selectedDate)).locale(langString()).format('MMM YYYY')} ) : </div>
                            <div className='fw-bold ms-2' style={{ fontSize: "12px" }}>{loadingUsers ? <span className='my-spinner'> </span> : mapPrecedentDateCount} </div>
                        </div>
                    </div>}
                </div>
                {!isDateRange && <div className='ms-2'>
                    {
                        mapPrecedentDateCount > mapSelectedDateCount ?
                            <FaLongArrowAltDown style={{ fontSize: "35px", color: "#ef233c" }} /> :
                            mapPrecedentDateCount < mapSelectedDateCount &&
                            <FaLongArrowAltUp style={{ fontSize: "35px", color: "#0acf97" }} />
                    }
                </div>}
            </div>

        </div>
    </div>


    const DisplayEventReportBox = <div className="me-2" >
        <div className="bg-white rounded my-shadow p-2 mb-1 d-flex align-items-center container-single-box" style={{ border: "1px solid #ccc", borderLeft: "10px solid #fca311" }}>
            <div className='d-flex align-items-center justify-content-center w-100' >
                <div className='d-flex align-items-center flex-column justify-content-center'>
                    <div className='d-flex align-items-center'>
                        <div style={{ color: "#fca311", fontSize: "20px" }} className="font-weight-bold">{loadingUsers ? <span className='my-spinner'> </span> : eventReportSelectedDateCount} </div>
                        <div className="ms-3">
                            <div style={{ fontSize: "12px" }} className="fw-bold"> {translate("Event_Report")} {/*<span className='ms-1 text-muted' style={{ fontSize: '9px' }}>( {translate("Favorites")} )</span>*/}</div>
                            <div className="text-muted" style={{ fontSize: "13px" }}>{
                                isDateRange ? <span>
                                    {moment(selectedDateRange[0]).locale(langString()).format('MMM YYYY')} {" ".concat(translate('To').concat(" "))}  {moment(selectedDateRange[1]).locale(langString()).format('MMM YYYY')}
                                </span> :
                                    <span>{moment(generateIntervalDatefromDate(selectedDate).endDate).locale(langString()).format('MMM YYYY')}</span>
                            }</div>
                        </div>
                    </div>

                    {!isDateRange && <div className='mt-1'>
                        <div className="text-muted d-flex flex-wrap align-items-center mt-1" >
                            <div style={{ fontSize: "11px" }} className="fw-bold me-1">{translate("Previous")} </div>
                            <div style={{ fontSize: "10px" }}>( {moment(getPrecedentDate(selectedDate)).locale(langString()).format('MMM YYYY')} ) : </div>
                            <div className='fw-bold ms-2' style={{ fontSize: "12px" }}>{loadingUsers ? <span className='my-spinner'> </span> : eventReportPrecedentDateCount} </div>
                        </div>
                    </div>}
                </div>
                {!isDateRange && <div className='ms-2'>
                    {
                        eventReportPrecedentDateCount > eventReportSelectedDateCount ?
                            <FaLongArrowAltDown style={{ fontSize: "35px", color: "#ef233c" }} /> :
                            eventReportPrecedentDateCount < eventReportSelectedDateCount &&
                            <FaLongArrowAltUp style={{ fontSize: "35px", color: "#0acf97" }} />
                    }
                </div>}
            </div>

        </div>
    </div>


    const DisplayEventChartBox = <div className="me-2" >
        <div className="bg-white rounded my-shadow p-2 mb-1 d-flex align-items-center container-single-box" style={{ border: "1px solid #ccc", borderLeft: "10px solid #216869" }}>
            <div className='d-flex align-items-center justify-content-center w-100' >
                <div className='d-flex align-items-center flex-column justify-content-center'>
                    <div className='d-flex align-items-center'>
                        <div style={{ color: "#216869", fontSize: "20px" }} className="font-weight-bold">{loadingUsers ? <span className='my-spinner'> </span> : eventChartSelectedDateCount} </div>
                        <div className="ms-3">
                            <div style={{ fontSize: "12px" }} className="fw-bold"> {translate("Event_Chart")} {/*<span className='ms-1 text-muted' style={{ fontSize: '9px' }}>( {translate("Favorites")} )</span>*/}</div>
                            <div className="text-muted" style={{ fontSize: "13px" }}>{
                                isDateRange ? <span>
                                    {moment(selectedDateRange[0]).locale(langString()).format('MMM YYYY')} {" ".concat(translate('To').concat(" "))}  {moment(selectedDateRange[1]).locale(langString()).format('MMM YYYY')}
                                </span> :
                                    <span>{moment(generateIntervalDatefromDate(selectedDate).endDate).locale(langString()).format('MMM YYYY')}</span>
                            }</div>
                        </div>
                    </div>

                    {!isDateRange && <div className='mt-1'>
                        <div className="text-muted d-flex flex-wrap align-items-center mt-1" >
                            <div style={{ fontSize: "11px" }} className="fw-bold me-1">{translate("Previous")} </div>
                            <div style={{ fontSize: "10px" }}>( {moment(getPrecedentDate(selectedDate)).locale(langString()).format('MMM YYYY')} ) : </div>
                            <div className='fw-bold ms-2' style={{ fontSize: "12px" }}>{loadingUsers ? <span className='my-spinner'> </span> : eventReportPrecedentDateCount} </div>
                        </div>
                    </div>}
                </div>
                {!isDateRange && <div className='ms-2'>
                    {
                        eventChartPrecedentDateCount > eventChartSelectedDateCount ?
                            <FaLongArrowAltDown style={{ fontSize: "35px", color: "#ef233c" }} /> :
                            eventChartPrecedentDateCount < eventChartSelectedDateCount &&
                            <FaLongArrowAltUp style={{ fontSize: "35px", color: "#0acf97" }} />
                    }
                </div>}
            </div>
        </div>
    </div>


    const DisplayDataEntriesBox = <div className="me-2">
        <div className="bg-white rounded my-shadow p-2 mb-1 d-flex align-items-center container-single-box" style={{ border: "1px solid #ccc", borderLeft: "10px solid #f3722c" }}>
            <div className='d-flex align-items-center justify-content-center w-100' >
                <div className='d-flex align-items-center flex-column justify-content-center'>
                    <div className='d-flex align-items-center'>
                        <div style={{ color: "#f3722c", fontSize: "20px" }} className="font-weight-bold">{loadingUsers ? <span className='my-spinner'> </span> : dataEntriesSelectedDateCount}</div>
                        <div className="ms-3">
                            <div style={{ fontSize: "12px" }} className="fw-bold"> {translate("Data_Entries")}</div>
                            <div className="text-muted" style={{ fontSize: "13px" }}>{
                                isDateRange ? <span>
                                    {moment(selectedDateRange[0]).locale(langString()).format('MMM YYYY')} {" ".concat(translate('To').concat(" "))}  {moment(selectedDateRange[1]).locale(langString()).format('MMM YYYY')}
                                </span> :
                                    <span>{moment(generateIntervalDatefromDate(selectedDate).endDate).locale(langString()).format('MMM YYYY')}</span>
                            }</div>
                        </div>
                    </div>

                    {!isDateRange && <div className='mt-1'>
                        <div className="text-muted d-flex flex-wrap align-items-center mt-1" >
                            <div style={{ fontSize: "11px" }} className="fw-bold me-1">{translate("Previous")} </div>
                            <div style={{ fontSize: "10px" }}>( {moment(getPrecedentDate(selectedDate)).locale(langString()).format('MMM YYYY')} ) : </div>
                            <div className='fw-bold ms-2' style={{ fontSize: "12px" }}>{loadingUsers ? <span className='my-spinner'> </span> : dataEntriesPrecedentDateCount} </div>
                        </div>
                    </div>}
                </div>
                {!isDateRange && <div className='ms-2'>
                    {
                        dataEntriesPrecedentDateCount > dataEntriesSelectedDateCount ?
                            <FaLongArrowAltDown style={{ fontSize: "35px", color: "#ef233c" }} /> :
                            dataEntriesPrecedentDateCount < dataEntriesSelectedDateCount &&
                            <FaLongArrowAltUp style={{ fontSize: "35px", color: "#0acf97" }} />
                    }
                </div>}
            </div>
        </div>
    </div>


    const DisplayDataSetReportBox = <div className="me-2">
        <div className="bg-white rounded my-shadow p-2 mb-1 d-flex align-items-center container-single-box" style={{ border: "1px solid #ccc", borderLeft: "10px solid #ffba08" }}>
            <div className='d-flex align-items-center justify-content-center w-100' >
                <div className='d-flex align-items-center flex-column justify-content-center'>
                    <div className='d-flex align-items-center'>
                        <div style={{ color: "#ffba08", fontSize: "20px" }} className="font-weight-bold">{loadingUsers ? <span className='my-spinner'> </span> : dataSetReportSelectedDateCount}</div>
                        <div className="ms-3">
                            <div style={{ fontSize: "12px" }} className="fw-bold"> {translate("Data_Set_Report")}</div>
                            <div className="text-muted" style={{ fontSize: "13px" }}>{
                                isDateRange ? <span>
                                    {moment(selectedDateRange[0]).locale(langString()).format('MMM YYYY')} {" ".concat(translate('To').concat(" "))}  {moment(selectedDateRange[1]).locale(langString()).format('MMM YYYY')}
                                </span> :
                                    <span>{moment(generateIntervalDatefromDate(selectedDate).endDate).locale(langString()).format('MMM YYYY')}</span>
                            }</div>
                        </div>
                    </div>

                    {!isDateRange && <div className='mt-1'>
                        <div className="text-muted d-flex flex-wrap align-items-center mt-1" >
                            <div style={{ fontSize: "11px" }} className="fw-bold me-1">{translate("Previous")} </div>
                            <div style={{ fontSize: "10px" }}>( {moment(getPrecedentDate(selectedDate)).locale(langString()).format('MMM YYYY')} ) : </div>
                            <div className='fw-bold ms-2' style={{ fontSize: "12px" }}>{loadingUsers ? <span className='my-spinner'> </span> : dataSetReportPrecedentDateCount} </div>
                        </div>
                    </div>}
                </div>
                {!isDateRange && <div className='ms-2'>
                    {
                        dataSetReportPrecedentDateCount > dataSetReportSelectedDateCount ?
                            <FaLongArrowAltDown style={{ fontSize: "35px", color: "#ef233c" }} /> :
                            dataSetReportPrecedentDateCount < dataSetReportSelectedDateCount &&
                            <FaLongArrowAltUp style={{ fontSize: "35px", color: "#0acf97" }} />
                    }
                </div>}
            </div>
        </div>
    </div>


    const DisplayActiveUsersBox = <div className="me-2">
        <div className="bg-white rounded my-shadow p-2 mb-1 d-flex align-items-center  container-single-box" style={{ border: "1px solid #ccc", borderLeft: "10px solid #0081a7" }}>
            <div className='d-flex align-items-center justify-content-center w-100' >
                <div className='d-flex align-items-center flex-column justify-content-center'>

                    <div className='d-flex align-items-center'>
                        <div style={{ color: "#0081a7", fontSize: "20px" }} className="font-weight-bold">{loadingUsers ? <span className='my-spinner'> </span> : activeUsersSelectedDateCount}</div>
                        <div className="ms-3">
                            <div style={{ fontSize: "12px" }} className="fw-bold"> {translate("Active_Users")}</div>
                            <div className="text-muted" style={{ fontSize: "13px" }}>{
                                isDateRange ? <span>
                                    {moment(selectedDateRange[0]).locale(langString()).format('MMM YYYY')} {" ".concat(translate('To').concat(" "))}  {moment(selectedDateRange[1]).locale(langString()).format('MMM YYYY')}
                                </span> :
                                    <span>{moment(generateIntervalDatefromDate(selectedDate).endDate).locale(langString()).format('MMM YYYY')}</span>
                            }</div>
                        </div>
                    </div>

                    {!isDateRange && <div className='mt-1'>
                        <div className="text-muted d-flex flex-wrap align-items-center mt-1" >
                            <div style={{ fontSize: "11px" }} className="fw-bold me-1">{translate("Previous")} </div>
                            <div style={{ fontSize: "10px" }}>( {moment(getPrecedentDate(selectedDate)).locale(langString()).format('MMM YYYY')} ) : </div>
                            <div className='fw-bold ms-2' style={{ fontSize: "12px" }}>{loadingUsers ? <span className='my-spinner'> </span> : activeUsersPrecedentCount} </div>
                        </div>
                    </div>}
                </div>
                {!isDateRange && <div className='ms-2'>
                    {
                        activeUsersPrecedentCount > activeUsersSelectedDateCount ?
                            <FaLongArrowAltDown style={{ fontSize: "35px", color: "#ef233c" }} /> :
                            activeUsersPrecedentCount < activeUsersSelectedDateCount &&
                            <FaLongArrowAltUp style={{ fontSize: "35px", color: "#0acf97" }} />
                    }
                </div>}
            </div>
        </div>
    </div>


    const DisplayTotalUsersBox = <div >
        <div className="bg-white rounded my-shadow p-2 mb-1  container-single-box" style={{ border: "1px solid #ccc", borderLeft: "10px solid #0acf97" }}>
            <div className='d-flex align-items-center justify-content-center w-100' >
                <div>
                    <div className='fw-bold'> {translate('Total_Users')} </div>
                    <div style={{ color: "#0acf97", fontSize: "20px" }} className="font-weight-bold">{loadingUsers ? <span className='my-spinner'> </span> : totalUsersCount}</div>
                </div>
                <div className='ms-2'>
                    <IoMdStats style={{ fontSize: "30px", color: "#0acf97", }} />
                </div>
            </div>
        </div>
    </div>


    const DisplaySingleBox = <div className="d-flex align-items-center flex-wrap">
        {DisplayVisualisationBox}
        {DisplayActiveDashboardBox}
        {version >= API_MINIMUM_VERSION && DisplayPassiveDashboardBox}
        {DisplayMapBox}
        {DisplayEventReportBox}
        {DisplayEventChartBox}
        {DisplayDataEntriesBox}
        {DisplayDataSetReportBox}
        {/* {DisplayActiveUsersBox} */}
        {DisplayTotalUsersBox}
    </div>


    const DisplayTitle = () => <div className="row bg-white my-shadow px-4 py-2 align-items-center">
        <div className="col-sm-11 d-flex align-items-center">
            <a href={SERVER_URL} target="_blank" ><img style={{ cursor: "pointer", width: "30px", height: "30px" }} src='dhis2-app-icon.png' /></a>
            <h4 className='ms-2'>{translate("App_Title")}</h4>
        </div>
    </div>


    const DisplayConfigurationPage = () => <div className='d-flex flex-column justify-content-center align-items-center w-100' style={{ width: "100%", height: "100%" }}>
        {!errorImportationMessage && <ComponentCover>
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        </ComponentCover>}
    </div>


    const handleSearchUser = event => setSearchInput("".concat(event.target.value))
    const handleSelectUserGroup = (value) => setSelectedUserGroups(value)
    const handleChangeSelectedDate = date => setSelectedDate(date)
    const handleChangeSelectedDateRange = date => date ? setSelectedDateRange(date) : []
    const handleGetUserFromOu = event => setUsersOuWithChildren(!usersOuWithChildren)
    const handleSelectOu = value => setSelectedOrganisationUnit(value)
    const handleSendFetch = () => {
        loadUsers(selectedOrganisationUnit)
        loadDataStatistique(selectedDate ? selectedDate : moment(), setActiveUsersSelectedDateCount)
        !isDateRange && loadDataStatistique(getPrecedentDate(selectedDate ? selectedDate : moment()), setActiveUsersPrecedentCount)
    }


    const handleDeleteAllFilter = () => {
        setSelectedUserGroups([])
        setUsersOuWithChildren(false)
        setSelectedDate(undefined)
        setSelectedDateRange([])
        loadUsers(selectedOrganisationUnit)
        loadDataStatistique(selectedDate ? selectedDate : moment(), setActiveUsersSelectedDateCount)
        !isDateRange && loadDataStatistique(getPrecedentDate(selectedDate ? selectedDate : moment()), setActiveUsersPrecedentCount)
    }





    const handleUserRating = () => setVisibleUserRatingModal(true)

    const handleCloseUserRatingModal = () => setVisibleUserRatingModal(false)



    const DisplayFilterStatistiqueSection = <div className='row align-items-center'>
        <div className="col-md-8 mt-3 d-flex align-items-center">
            <div className='me-3 fw-bold' style={{ textDecoration: "underline" }}>{translate('Filter')} : </div>
            <div className="d-flex align-items-center flex-wrap">
                {selectedOrganisationUnit && <div className="me-2 my-shadow d-flex align-items-center" style={{ background: "#e07a5f", color: "#fff", fontSize: "12px", borderRadius: "10px" }}>
                    <span className="px-3 me-2 py-1 font-weight-bold" >
                        {organisationUnits.find(item => item.id === selectedOrganisationUnit)?.displayName}
                    </span>
                </div>}

                {selectedDate && !isDateRange && <div
                    onClick={() => setSelectedDate(undefined)}
                    className="me-2 my-shadow d-flex align-items-center" style={{ background: "#e07a5f", color: "#fff", fontSize: "12px", borderRadius: "10px" }}>
                    <span className="px-3 py-1 font-weight-bold" >
                        {moment(selectedDate).locale(langString()).format('MMM YYYY')}
                    </span>
                    <span className='px-2 py-1' style={{ borderLeft: "1px solid #fff", cursor: "pointer" }}>X</span>
                </div>}
                {selectedDateRange?.length > 0 && isDateRange && <div
                    onClick={() => {
                        setSelectedDateRange([])
                    }
                    } className="me-2 my-shadow d-flex align-items-center" style={{ background: "#e07a5f", color: "#fff", fontSize: "12px", borderRadius: "10px" }}>
                    <span className="px-3 py-1 font-weight-bold" >
                        {moment(selectedDateRange[0]).locale(langString()).format('MMM YYYY')} {" ".concat(translate('To').concat(" "))}  {moment(selectedDateRange[1]).locale(langString()).format('MMM YYYY')}
                    </span>
                    <span className='px-2 py-1' style={{ borderLeft: "1px solid #fff", cursor: "pointer" }}>X</span>
                </div>}

                {selectedUserGroups.length > 0 && <div onClick={() => {
                    setSelectedUserGroups([])
                }}
                    className="me-2 my-shadow d-flex align-items-center" style={{ background: "#e07a5f", color: "#fff", fontSize: "12px", borderRadius: "10px" }}>
                    <span className="px-3 py-1 font-weight-bold" >
                        <span className='me-2'>{translate('UserGroups')}: </span>
                        <span className='me-2 fw-bold'>{selectedUserGroups.length}</span><span style={{ textDecoration: "underline", fontSize: "11px" }}> {translate('Selected')}</span>
                    </span>
                    <span className='px-2 py-1' style={{ borderLeft: "1px solid #fff", cursor: "pointer" }}>X</span>
                </div>}

                {usersOuWithChildren && <div onClick={() => {
                    setUsersOuWithChildren(false)
                }}
                    className='my-shadow d-flex align-items-center' style={{ background: "#e07a5f", color: "#fff", fontSize: "12px", borderRadius: "10px" }}>
                    <span className="px-3 py-1 font-weight-bold" >
                        {translate("Get_Users_From_Organisation_Unit_And_His_Children")}
                    </span>
                    <span className='px-2 py-1' style={{ borderLeft: "1px solid #fff", cursor: "pointer" }}>X</span>
                </div>}
                <div className='ms-4 fw-bold text-primary' onClick={handleDeleteAllFilter} style={{ textDecoration: "underline", cursor: "pointer" }}> {translate('Clear_All')}</div>
            </div>
        </div>
        <div className='col-md text-end'>
            <Button
                onClick={() => setVisibleUserRatingModal(true)}
                icon={<AiOutlineSetting style={{ fontSize: "16px" }} />}
            >
                {translate('Users_Rating_Configuration')}
            </Button>
        </div>
    </div>

    const DisplayFilterTopFavorisSection = <div className="mt-3 d-flex align-items-center">
        <div className='me-3 fw-bold' style={{ textDecoration: "underline" }}>{translate('Filter')} : </div>
        <div className="d-flex align-items-center flex-wrap">

            {eventType && <div className="me-2 my-shadow d-flex align-items-center" style={{ background: "#e07a5f", color: "#fff", fontSize: "12px", borderRadius: "10px" }}>
                <span className="px-3 me-2 py-1 font-weight-bold" >
                    <RenderEventTypeName version={version} eventType={eventType} />
                </span>
            </div>}

            {pageSize && <div className="me-2 my-shadow d-flex align-items-center" style={{ background: "#e07a5f", color: "#fff", fontSize: "12px", borderRadius: "10px" }}>
                <span className="px-3 py-1 font-weight-bold" >
                    {"page Size: " + pageSize}
                </span>
            </div>}

            {sortOrder && <div className="me-2 my-shadow d-flex align-items-center" style={{ background: "#e07a5f", color: "#fff", fontSize: "12px", borderRadius: "10px" }}>
                <span className="px-3 py-1 font-weight-bold" >
                    {sortOrder === ASC && translate('Ascending')}
                    {sortOrder === DESC && translate('Descending')}
                </span>
            </div>}

        </div>
    </div>

    const RenderStatistiqueContent = <>
        <div className='fw-bold mt-4'>
            <h6 style={{ textDecoration: "underline" }}> {translate('Views')}</h6>
            {DisplaySingleBox}
        </div>

        <h6 className='fw-bold mt-4' style={{ textDecoration: "underline" }}>{translate('Result')}</h6>

        <div>
            <div className="my-shadow rounded p-3 border bg-white">
                <div className="row">
                    <div className="col-md-3 d-flex align-items-center">
                        <div className='me-2'> {translate("Search")}: </div>
                        <div className='me-2'>
                            <Search placeholder={translate("Search_Users")} value={searchInput} onChange={handleSearchUser} />
                        </div>
                    </div>
                    <div className='col-md-4'>
                        <div className='d-flex align-items-center'>
                            <div className='me-2'> {translate("UserGroups")}: </div>
                            <div className='me-2'>
                                <Select
                                    style={{ minWidth: "350px", maxWidth: "400px" }}
                                    mode='multiple'
                                    value={selectedUserGroups}
                                    onChange={handleSelectUserGroup}
                                    loading={loadingUserGroups}
                                    filterOption={(input, option) => {
                                        return option.title.toLowerCase().includes(input?.toLowerCase())
                                    }}
                                    placeholder={translate("UserGroups")}
                                >
                                    {userGroups.map(u => <Select.Option title={u.name} key={u.id} value={u.id}>{u.name} </Select.Option>)}
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className='col-md text-end'>
                        {
                            isDataStoreCreated ?
                                dataStoreConfiguration &&
                                    dataStoreConfiguration.evaluations &&
                                    dataStoreConfiguration.evaluations.length > 0 ?
                                    (
                                        <div className='d-flex align-items-center justify-content-end'>
                                            <div className='me-2'>{translate('Evaluation_Config')}: </div>
                                            <SingleSelect
                                                className="min-width-200"
                                                dense
                                                placeholder={translate('Evaluation')}
                                                selected={selectedEvaluationConfig?.id}
                                                onChange={({ selected }) =>
                                                    setSelectedEvaluationConfig(dataStoreConfiguration
                                                        .evaluations.find(ev => ev.id === selected)
                                                    )
                                                }
                                            >
                                                {
                                                    dataStoreConfiguration
                                                        .evaluations
                                                        .map(ev => (<SingleSelectOption key={ev.id} value={ev.id} label={ev.name} />))
                                                }
                                            </SingleSelect>
                                        </div>
                                    )
                                    : (
                                        <Button
                                            onClick={() => setVisibleUserRatingModal(true)}
                                            icon={<AiOutlineSetting style={{ fontSize: "16px" }} />}
                                        >
                                            {translate('Users_Rating_Configuration')}
                                        </Button>
                                    )
                                : <></>
                        }

                    </div>
                </div>
                <div className="mt-1">
                    <Table scroll={{ x: 1250 }} pagination className="my-custom-table" size="small" loading={loadingUsers} bordered dataSource={dataSources} columns={COLUMNS} />
                </div>
            </div>
        </div>

    </>


    const RenderTopFavorisSectionContent = <Views
        eventType={eventType}
        pageSize={pageSize}
        sortOrder={sortOrder}
        version={version}
    />


    const RenderStatisticSectionField = <div className='col-md row align-items-center'>
        <div className='col-md-3'>
            <div className="mb-2">{translate('OrganisationUnit')}</div>
            <TreeSelect
                showSearch
                treeLine
                filterTreeNode={(search, item) => {
                    return item.title.toLowerCase().includes(search.toLowerCase())
                }}
                size="large"
                className='w-100'
                placeholder={translate("Select_Organisation_Unit")}
                treeData={organisationUnitsTree}
                loadData={loadingOrganisationUnitsTree}
                value={selectedOrganisationUnit}
                onSelect={handleSelectOu}
            />
        </div>
        <div className="col-md-2 mt-3">
            <Checkbox checked={usersOuWithChildren} onChange={handleGetUserFromOu}>
                {translate("Get_Users_From_Organisation_Unit_And_His_Children")}
            </Checkbox>
        </div>
        <div className="col-md-4">
            {!isDateRange && <div >
                <div className="mb-2">{translate('Month')}</div>
                <DatePicker size='large' disabledDate={date => moment().isAfter(date) ? false : true} value={selectedDate} className="w-100" picker='month' onChange={handleChangeSelectedDate} />
            </div>}

            {isDateRange && <div>
                <div className="mb-2">{translate('Month')}</div>
                <DatePicker.RangePicker size='large' disabledDate={date => moment().isAfter(date) ? false : true} value={selectedDateRange} className="w-100" picker='month' onChange={handleChangeSelectedDateRange} />
            </div>}
        </div>

        <div className='col-md-1 mt-3'>
            <Checkbox onChange={event => {
                setIsDateRange(event.target.checked)
            }}>
                {translate('Choose_Date_Range')}
            </Checkbox>
        </div>
        <div className='col-md-2'>
            <Button
                onClick={handleSendFetch}
                disabled={loadingUsers ? true : false}
                loading={loadingUsers}
                small
                primary
            >
                {translate('Validate')}
            </Button>
        </div>
    </div>

    const RenderTopFavorisSectionFields = <div className='col-md'>
        <div className='row align-items-center'>
            <div className='col-md-2'>
                <EventTypeField eventType={eventType} version={version} setEventType={setEventType} />
            </div>
            <div className='col-md-2'>
                <PageSizeField pageSize={pageSize} setPageSize={setPageSize} />
            </div>
            <div className='col-md-2'>
                <SortOrderField sortOrder={sortOrder} setSortOrder={setSortOrder} />
            </div>
        </div>
    </div>


    const RenderTopPane = <div className="bg-white my-shadow px-4 py-2 border rounded mt-3">
        <div className="row align-items-center">
            <div className='col-md-2'>
                <PageField
                    renderPage={renderPage}
                    setRenderPage={setRenderPage}
                />
            </div>
            {renderPage === TOP_FAVORIS_PAGE && RenderTopFavorisSectionFields}
            {renderPage === STATISTIQUE_PAGE && RenderStatisticSectionField}

        </div>
    </div>


    if (!isConfigurated)
        return <DisplayConfigurationPage />


    return (
        <>
            <RenderAlertBar
                notification={notification}
            />

            {version >= API_MINIMUM_VERSION && <DisplayNotificationRelativeOfVersion version={version} />}
            {DisplayCalendarPopup}

            <div className="py-2 px-3 mt-2">
                {renderPage === STATISTIQUE_PAGE && DisplayFilterStatistiqueSection}
                {renderPage === TOP_FAVORIS_PAGE && DisplayFilterTopFavorisSection}
                {RenderTopPane}
                {renderPage === STATISTIQUE_PAGE && RenderStatistiqueContent}
                {renderPage === TOP_FAVORIS_PAGE && RenderTopFavorisSectionContent}
            </div>

            {isDataStoreCreated && <DisplayUserRatingContent
                setNotification={setNotification}
                visible={visibleUserRatingModal}
                setSelectedEvaluationConfig={setSelectedEvaluationConfig}
                onClose={handleCloseUserRatingModal}
                isDataStoreCreated={isDataStoreCreated}
                dataStoreConfiguration={dataStoreConfiguration}
                loadDataStoreConfiguration={getDataStoreConfigurations}
                loadingGetDataStoreConfiguration={loadingGetDataStoreConfiguration}
            />}
            <Footer />
        </>
    )
}

export default Statistique

