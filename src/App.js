import React from 'react'
import { Provider } from '@dhis2/app-runtime'
import { HeaderBar } from '@dhis2/ui'
import { API_BASE_ROUTE } from './api.routes'
import translate from './utils/translator'
import Statistique from './components/Statistique'
import './App.css'
import 'antd/dist/antd.css'

const BASE_ROUTE = API_BASE_ROUTE.substring(0, API_BASE_ROUTE.indexOf('/api'))

const App = () => {
  return <div style={{ overflowX: "hidden" }}>
    <Provider config={{ apiVersion: 29, baseUrl: BASE_ROUTE }}>
      <HeaderBar appName={translate("App_Title")} />
      <Statistique />
    </Provider>
  </div>
}

export default App
