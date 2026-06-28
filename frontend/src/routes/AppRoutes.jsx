import React from 'react'
import {BrowserRouter as Router,Route,Routes} from 'react-router-dom'
const AppRoutes=()=>{
    return(
        <Router>
            <Routes>
                <Route path="/register" element={<registerUser/>}/>
                
            </Routes>
        </Router>
    )
}

export default AppRoutes;