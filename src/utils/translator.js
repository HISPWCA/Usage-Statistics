import Fr from './french.json'
import En from './english.json'
const translate = entry => {
    switch (localStorage.getItem('userLang')) {
        case 'fr':
            return Fr[entry]

        case 'en':
            return En[entry]

        default:
            return entry
    }
}

export default translate
