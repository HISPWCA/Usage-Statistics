import React from 'react'
// import i18n from '@dhis2/d2-i18n'
import { SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import PropTypes from 'prop-types'
import { STATISTIQUE_PAGE, TOP_FAVORIS_PAGE, USER_RATING_PAGE } from '../utils/constants'
import i18n from '@dhis2/d2-i18n'


const PageField = ({ renderPage, setRenderPage }) => (
    <SingleSelectField
        selected={renderPage}
        onChange={({ selected }) => {
            setRenderPage(selected)
        }}
        label={i18n.t('Page')}
    >
        <SingleSelectOption label={i18n.t('Usage Statistics')} value={STATISTIQUE_PAGE} key={STATISTIQUE_PAGE} />
        <SingleSelectOption label={i18n.t('Top Favorites')} value={TOP_FAVORIS_PAGE} key={TOP_FAVORIS_PAGE} />
        {/* <SingleSelectOption label={i18n.t('Users Rating')} value={USER_RATING_PAGE} key={USER_RATING_PAGE} /> */}
    </SingleSelectField>
)

PageField.propTypes = {
    renderPage: PropTypes.string.isRequired,
    setRenderPage: PropTypes.func.isRequired,
}

export default PageField
