import * as React from 'react';
import 'antd/dist/antd.min.css';
import { Layout } from 'antd';
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
import { axiosFetchInstance, handleUnauthorized } from './Axios';
import {
    FacebookFilled,
    InstagramFilled,
    TwitterCircleFilled,
    MailFilled
} from '@ant-design/icons';
import { API_HOST, OAUTH_CLIENT_ID } from './config';

const { Header, Footer } = Layout;
export const UserContext = React.createContext();

const App = () => {
    const [authedUser, setAuthedUser] = React.useState(null);
    const client_id = OAUTH_CLIENT_ID;
    const host = API_HOST;

    React.useEffect(() => {
        const fetchDashboard = async () => {
            const accessToken = localStorage.getItem('foxCodes_accessToken');

            if (!accessToken) {
                setAuthedUser({});
                return;
            }

            try {
                const res = await axiosFetchInstance.get('/account/dashboard/');
                setAuthedUser(res.data || {});
            } catch (error) {
                try {
                    const retryResponse = await handleUnauthorized(error);

                    if (retryResponse && retryResponse.data) {
                        setAuthedUser(retryResponse.data);
                    } else {
                        setAuthedUser({});
                    }
                } catch (err) {
                    console.log(err?.response || err);
                    setAuthedUser({});
                }
            }
        };

        fetchDashboard();
    }, []);

    if (authedUser === null) {
        return null;
    }

    return (
        <UserContext.Provider value={{ authedUser, setAuthedUser, client_id, host }}>
            <BrowserRouter>
                <Layout style={{ minHeight: '100vh' }}>
                    <Header style={{ backgroundColor: '#fff' }}>
                        <div
                            style={{
                                float: 'left',
                                width: '20%',
                                borderBottom: '1px solid #f0f0f0',
                                height: 'inherit',
                                paddingRight: '1rem'
                            }}
                            className='logo'
                        >
                            <Link to='/'>
                                <img
                                    style={{ width: '100%', maxHeight: '100%' }}
                                    src={require('./images/foxcodes-2.png')}
                                    alt='Fox Codes'
                                />
                            </Link>
                        </div>
                        <Navbar />
                    </Header>

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

                    <Footer style={{ textAlign: 'center', backgroundColor: '#F7D7B4' }}>
                        <p>Copyright © 2022 ❤️ Foxsourcecode.com — All Rights Reserved</p>
                        <a
                            target='_blank'
                            rel='noreferrer'
                            href='https://www.facebook.com/foxsourcecod'
                            className='footer-link'
                        >
                            <FacebookFilled />
                        </a>
                        <a
                            target='_blank'
                            rel='noreferrer'
                            href='https://www.instagram.com/foxsorcecode'
                            className='footer-link'
                        >
                            <InstagramFilled />
                        </a>
                        <a
                            target='_blank'
                            rel='noreferrer'
                            href='https://twitter.com/foxsourcecode'
                            className='footer-link'
                        >
                            <TwitterCircleFilled />
                        </a>
                        <a
                            target='_blank'
                            rel='noreferrer'
                            href='mailto:support@foxsourcecode.com'
                            className='footer-link'
                        >
                            <MailFilled />
                        </a>
                    </Footer>
                </Layout>
            </BrowserRouter>
        </UserContext.Provider>
    );
};

export default App;