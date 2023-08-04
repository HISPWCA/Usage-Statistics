import React from 'react'
import PropTypes from 'prop-types'
import { ANALYTITIQUE_PAGE, eventTypes, pageSizes, sortOrders, STATISTIQUE_PAGE, TOP_FAVORITES } from '../utils/constants'
import { NoticeBox, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import CategoryField from './CategoryField'


const Filters = ({
    renderPage,
    category,
    sortOrder,
    setSortOrder,
    pageSize,
    setPageSize,
    eventType,
    setEventType,
    setCategory
}) => {

    const TopFavorisFilters = () => <React.Fragment>

    </React.Fragment>

    const AnalyticsFilters = () => {
        switch (category) {
            case TOP_FAVORITES:
                return (
                    <TopFavorisFilters />
                )

            default:
                return (
                    <NoticeBox error title={i18n.t('Unrecognized category')}>
                        {i18n.t('The chosen category was not recognized.')}
                    </NoticeBox>
                )
        }
    }

    switch (renderPage) {
        case STATISTIQUE_PAGE:
            return <></>

        case ANALYTITIQUE_PAGE:
            return (
                <>
                    <CategoryField category={category} setCategory={setCategory} />
                    <AnalyticsFilters />
                </>
            )
        default:
            return (
                <NoticeBox error title={i18n.t('Unrecognized render page')}>
                    {i18n.t('The chosen render page was not recognized.')}
                </NoticeBox>
            )
    }
}



Filters.propTypes = {
    renderPage: PropTypes.string.isRequired,
    eventType: PropTypes.string.isRequired,
    pageSize: PropTypes.string.isRequired,
    setEventType: PropTypes.func.isRequired,
    setPageSize: PropTypes.func.isRequired,
    setSortOrder: PropTypes.func.isRequired,
    setCategory: PropTypes.func.isRequired,
    sortOrder: PropTypes.string.isRequired,
}

export default Filters