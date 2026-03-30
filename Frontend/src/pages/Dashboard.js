import React from 'react'
import { Layout, Card, Col, Row, Typography } from 'antd';
import Tabs from '../components/dashboard/Tabs'
import './Dashboard.css'
import Payments from '../components/dashboard/Payments';
import Myitems from '../components/dashboard/Myitems';
import Earnings from '../components/dashboard/Earnings';
import Withdraws from '../components/dashboard/Withdraws.jsx'
import WithdrawMoney from '../components/dashboard/WithdrawMoney';
import Wishlist from '../components/dashboard/Wishlist';
import MyAccount from '../components/dashboard/MyAccount';
import Support from '../components/dashboard/Support';
import { Route, Routes, Link } from 'react-router-dom';
import { UserContext } from '../App';
const { Title } = Typography;
const { Content, Sider } = Layout;

const Dashboard = (props) => {
    const { authedUser } = React.useContext(UserContext)

    if (!authedUser) window.location.href = '/login'

  return (
        <Layout className='main-content'>
            <Content>
                <div className="site-card-wrapper">
                    <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Card hoverable title="Credit" bordered={false}>
                            <Title level={5}>$ {authedUser.credit}</Title>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card hoverable title="Wishlist" bordered={false}>
                            <Title level={5}>{authedUser.wishlist_items ? authedUser.wishlist_items.length : 0}</Title>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card hoverable title="My Purchases" bordered={false}>
                            <Title level={5}>{authedUser.payments.length}</Title>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card hoverable title="My sales" bordered={false}>
                            <Title level={5}>{authedUser.earnings.length}</Title>
                        </Card>
                    </Col>
                    </Row>
                </div>
            
            <Layout style={{marginTop:'1rem'}}>
                <Sider 
                    width={300} 
                    className="site-layout-background" 
                    style={{height:'90vh'}}
                    breakpoint="lg"
                    collapsedWidth="0"
                >
                    <Tabs />
                </Sider>
                    <Layout style={{ padding: '0 0 0 2rem' }}>
                        <Content className="dash-content">
                                <Routes>
                                <Route path='' element={<>
                                    <Myitems view='myitems' />
                                    <Payments />
                                </>} />
                                <Route path='/payments' element={<Payments />} />
                                <Route path='/earnings' element={<Earnings />} />
                                <Route path='/myitems/*' element={<Myitems view='myitems' />} />
                                <Route path='/myaccount' element={<MyAccount />} />
                                <Route path='/withdraws' element={<Withdraws />} />
                                <Route path='/withdraw-money' element={<WithdrawMoney />} />
                                <Route path='/wishlist' element={<Wishlist />} />
                                <Route path='/support' element={<Support />} />
                            </Routes>
                        </Content>
                </Layout>
            </Layout>
        </Content>
    </Layout>

  )
}

export default Dashboard