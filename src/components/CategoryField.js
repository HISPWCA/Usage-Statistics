import React from 'react'
import { SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import PropTypes from 'prop-types'
import { categories } from '../utils/constants'
import i18n from '@dhis2/d2-i18n'


const CategoryField = ({ category, setCategory }) => (
    <SingleSelectField
        selected={category}
        onChange={({ selected }) => {
            setCategory(selected)
        }}
        label={i18n.t('Category')}
    >
        {categories.map(({ label, value }) => <SingleSelectOption label={i18n.t(label)} value={value} key={value} />)}
    </SingleSelectField>
)

CategoryField.propTypes = {
    category: PropTypes.string.isRequired,
    setCategory: PropTypes.func.isRequired,
}

export default CategoryField
