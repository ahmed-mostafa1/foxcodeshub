import * as React from 'react';
import 'antd/dist/antd.min.css';
import { Layout, Image } from 'antd';
import Navbar from './components/navbar/Navbar';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import RegisterForm from './components/registration/RegisterForm';
import LoginForm from './components/registration/LoginForm';
import Catalog from './pages/Catalog';
import Profile from './pages/Profile';
import ResetPW from './pages/ResetPW';
import ResetPwConfirm from './pages/ResetPwConfirm';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ItemPage from './pages/ItemPage';
import { axiosFetchInstance, axiosInstance, handleUnauthorized } from './Axios'
import { FacebookFilled, InstagramFilled, TwitterCircleFilled, MailFilled } from '@ant-design/icons'

const { Header, Footer } = Layout;
export const UserContext = React.createContext()



const App = props => {

    const [authedUser, setAuthedUser] = React.useState()
    const client_id = "WHRieTI9jGGoct7DpgXXeciVI11tcgX2asJrHZ0Z"
    const client_secret = "wityohIXRQn2ph1TlUO5MhNovgtH8LpEhkooXBQPMYvyT6S6X78vsKeEORvDbJAHemBs4AVBeLrODTvgR49A0Cdfb9W38NC2T5q6sItdbu1kRsGq2vg3UFpZcdwvsNth"
    const host = 'https://foxsourcecode.com'
    React.useMemo(() => {
        if (localStorage.getItem('foxCodes_accessToken')){
            axiosFetchInstance
            .get('/account/dashboard/')
            .then(res => {
                console.log(res.data)
                res.data && setAuthedUser(res.data)
            })
            .catch(error => {
                if (error.response.status === 401) handleUnauthorized(error)
                else console.log(error.response)
                
            })
        } else setAuthedUser({}) 
    }, [])

    return (
    <UserContext.Provider value={{authedUser, setAuthedUser, client_id, client_secret, host}}>
    <BrowserRouter>
    <Layout style={{minHeight:'100vh'}}>
        <Header style={{backgroundColor:'#fff'}}>
            <div style={{float:'left', width:'20%', borderBottom:'1px solid #f0f0f0', height:'inherit', paddingRight:'1rem'}} className='logo'>
                <Link to='/'>
                    <img style={{width:'100%', maxHeight:'100%'}} src={require('./images/foxcodes-2.png')} />
                </Link>
            </div>
            <Navbar />
        </Header>
        {authedUser &&
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/dashboard/*' element={<Dashboard />} />
            <Route path='/catalog' element={<Catalog />} />
            <Route path='/signup' element={<RegisterForm />} />
            <Route path='/login' element={<LoginForm />} />
            <Route path='/item' element={<ItemPage />} />
            <Route path='/user' element={<Profile />} />
            <Route path='/password-reset' element={<ResetPW />} />
            <Route path='/password-reset-confirm' element={<ResetPwConfirm />} />
        </Routes>
        }
        <Footer style={{ textAlign: 'center', backgroundColor:'#F7D7B4' }}>
                <p>Copyright © 2022 ❤️ Foxsourcecode.com — All Rights Reserved</p>
                <a target='_blank' href='https://www.facebook.com/foxsourcecod' className='footer-link'><FacebookFilled /></a>
                <a target='_blank' href='https://www.instagram.com/foxsorcecode' className='footer-link'><InstagramFilled /></a>
                <a target='_blank' href='https://twitter.com/foxsourcecode' className='footer-link'><TwitterCircleFilled /></a>
                <a target='_blank' href='mailto:support@foxsourcecode.com' className='footer-link'><MailFilled /></a>
        </Footer>
        {/* <RegisterForm />
        <Dashboard /> */}
    </Layout>
    </BrowserRouter>
    </UserContext.Provider>
    );
  
}

export default App;
