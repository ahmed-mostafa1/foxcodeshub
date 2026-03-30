import * as React from 'react'
import ItemHeader from '../components/item/ItemHeader'
import ItemDetails from '../components/item/ItemDetails'
import ItemReviews from '../components/item/ItemReviews'
import ItemComments from '../components/item/ItemComments'
import ItemPurchase from '../components/item/ItemPurchase'
import SimilarItems from '../components/item/SimilarItems'
import Support from '../components/dashboard/Support'
import { Layout, Row, Col, Tabs, Typography, Button } from 'antd'
import { axiosFetchInstance, handleUnauthorized } from '../Axios'
import { Link } from 'react-router-dom'
import QueryString from 'query-string'
import { useLocation } from 'react-router-dom'
import { UserContext } from '../App'
const { Content } = Layout
const { TabPane } = Tabs
const { Title } = Typography
export const ItemContext = React.createContext()

const ItemPage = () => { 
    const [item, setItem] = React.useState()
    const { authedUser, host } = React.useContext(UserContext)
    const location = useLocation()
    const query = QueryString.parse(location.search)
    React.useEffect(()=> {
        axiosFetchInstance.get(`/item-details/${query.id}/`)
        .then(res => {
            console.log(res.data)
            setItem(res.data)
        })
        .catch(error => console.log(error.response))
    }, [])

    const handleDownload = () => {
        axiosFetchInstance.get(`/download/${item.id}`)
        .then(res => {
            console.log(res.data)
            const link = document.createElement('a');
            link.href = res.data.url;
            link.target='blank'
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

        })
        .catch(error => {
            console.log(error.response)
            handleUnauthorized(error)
        })
        // fetch(`${host}/download/${item.id}/`,{
        //     method: 'GET',
        //     headers: {
        //       'Content-Type': 'application/json',
        //       Authorization: localStorage.getItem('foxCodes_accessToken')
        //       ? `Bearer ${localStorage.getItem('foxCodes_accessToken')}`
        //       : null,

        //     },
        //   })
        //   .then((response) => response.json())
        //   .then((data) => {
        //     // Create blob link to download
        //     // console.log(blob)
        //     // const url = window.URL.createObjectURL(
        //     //   new Blob([blob]),
        //     // );
        //     const link = document.createElement('a');
        //     link.href = data.url;
        //     // link.setAttribute(
        //     //   target,'blank'
        //     // //   `${item.name}.zip`,
        //     // );
        //     link.target='blank'
        
        //     // Append to html link element page
        //     document.body.appendChild(link);
        
        //     // Start download
        //     link.click();
        
        //     // Clean up and remove the link
        //     link.parentNode.removeChild(link);
        //   });
    }

  return (
    <Content className='main-content'>
        <ItemContext.Provider value={{item, setItem}}>
            { item &&
            <>
        <ItemHeader />
        <Row style={{marginTop:'1rem'}} gutter={[16,16]}>
            <Col xs={24} sm={16}>
                <Tabs  defaultActiveKey="item" centered>
                    <TabPane tab="Item" key="item">
                        <ItemDetails />
                    </TabPane>
                    <TabPane tab="Reviews" key="reviews">
                        <ItemReviews />
                    </TabPane>
                    <TabPane tab="Comments" key="comments">
                        <ItemComments />
                    </TabPane>
                    {authedUser.payments && authedUser.payments.find(p => p.item === item.name) &&
                        <TabPane tab="Download" key="download">
                            <div>
                                <Support item={item} />
                                <Button block onClick={handleDownload} type='primary'>Download Code</Button>
                                
                            </div>
                        </TabPane>
                    }
                </Tabs>
            </Col>
            <Col style={{marginTop:'3.75rem'}} xs={24} sm={8}>
                <ItemPurchase />
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