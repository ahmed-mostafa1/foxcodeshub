import * as React from 'react'
import ProfileHeader from '../components/profile/ProfileHeader'
import Products from '../components/profile/Products'
import { Layout, Row, message, Typography, Col } from 'antd'
import QueryString from 'query-string'
import { useLocation } from 'react-router-dom'
import { axiosFetchInstance, handleUnauthorized } from '../Axios'
import { UserContext } from '../App'
const { Content } = Layout
const { Title } = Typography

const Profile = () => {
    const { authedUser } = React.useContext(UserContext)
    const location = useLocation()
    const query = QueryString.parse(location.search)
    const [user, setUser] = React.useState()
    React.useEffect(()=> {
        axiosFetchInstance.get(`/account/user-details/${query.id}/`)
        .then(res => {
            authedUser.id && res.data.id === authedUser.id ? window.location.href = '/dashboard'
            : setUser(res.data)
        })
        .catch(error => {
            !error.response || error.response.status === 401 ? 
            handleUnauthorized(error) :
            message.error(error.response.data.error, 5)
        })
    }, [])
  return (
    <Content className='main-content'>

            {user &&
                <>
                <Row style={{marginTop:'1rem'}} gutter={[16,16]}>
                    <ProfileHeader user={user} />
                </Row>
                <Row style={{marginTop:'1rem'}} gutter={[16,16]}>
                    <Col span={24}><Title level={4}>Products</Title></Col>
                    <Products user={user} />
                </Row>
                </>
            }

    </Content>
  )
}

export default Profile