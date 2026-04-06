import * as React from 'react'
import ItemHeader from '../components/item/ItemHeader'
import ItemDetails from '../components/item/ItemDetails'
import ItemReviews from '../components/item/ItemReviews'
import ItemComments from '../components/item/ItemComments'
import ItemPurchase from '../components/item/ItemPurchase'
import SimilarItems from '../components/item/SimilarItems'
import { Layout, Row, Col, Tabs, Typography } from 'antd'
import { axiosFetchInstance, handleUnauthorized } from '../Axios'
import QueryString from 'query-string'
import { useLocation } from 'react-router-dom'
import { UserContext } from '../App'

const { Content } = Layout
const { TabPane } = Tabs
const { Title } = Typography
export const ItemContext = React.createContext()

const ItemPage = () => {
    const [item, setItem] = React.useState()
    const { authedUser } = React.useContext(UserContext)
    const location = useLocation()
    const query = QueryString.parse(location.search)

    React.useEffect(() => {
        axiosFetchInstance.get(`/item-details/${query.id}/`)
        .then(res => setItem(res.data))
        .catch(error => console.log(error.response))
    }, [])

    const handleDownload = () => {
        axiosFetchInstance.get(`/download/${item.id}`)
        .then(res => {
            const link = document.createElement('a')
            link.href = res.data.url
            link.target = 'blank'
            document.body.appendChild(link)
            link.click()
            link.parentNode.removeChild(link)
        })
        .catch(error => {
            console.log(error.response)
            handleUnauthorized(error)
        })
    }

    return (
        <Content className='main-content'>
            <ItemContext.Provider value={{item, setItem}}>
                { item &&
                <>
                    <ItemHeader />
                    <Row style={{marginTop:'1rem'}} gutter={[16,16]}>
                        <Col xs={24} sm={16}>
                            <Tabs defaultActiveKey="item" centered>
                                <TabPane tab="Item" key="item">
                                    <ItemDetails />
                                </TabPane>
                                <TabPane tab="Reviews" key="reviews">
                                    <ItemReviews />
                                </TabPane>
                                <TabPane tab="Comments" key="comments">
                                    <ItemComments />
                                </TabPane>
                            </Tabs>
                        </Col>
                        <Col style={{marginTop:'3.75rem'}} xs={24} sm={8}>
                            <ItemPurchase onDownload={handleDownload} />
                        </Col>
                    </Row>
                    <Row style={{marginTop:'1rem'}} gutter={[16,16]}>
                        <Col span={24}><Title level={4}>Similar Items</Title></Col>
                        <SimilarItems />
                    </Row>
                </>
                }
            </ItemContext.Provider>
        </Content>
    )
}

export default ItemPage