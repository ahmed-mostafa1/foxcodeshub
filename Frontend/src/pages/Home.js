import * as React from 'react'
import ItemCard from '../components/item/ItemCard';
import { Layout, Row, Col, Typography, Spin, Image, Input, Button } from 'antd'
import { axiosFetchInstance, handleUnauthorized } from '../Axios'
const { Content } = Layout;
const { Title } = Typography;
const { Search } = Input

const Home = () => {
    const [Items, setItems] = React.useState()
    const onSearch = value => {
        window.location.href = `/catalog?search=${value}`
    }

    const handleFilter = value => {
        window.location.href = `/catalog?filter=${value}`
    }

    React.useEffect(()=> {
        axiosFetchInstance.get('/')
        .then(res => setItems(res.data))
        .catch(error => handleUnauthorized(error))
    }, [])

  return (
    <>
    <div style={{position:'relative'}}>
    <Image preview={false} style={{border:'10px solid #fff', borderRadius:'5px', width:'100%'}} width="100%" src={require('../images/home.png')} />
    <div style={{position:'absolute', top:'25%', left:'5%', width:'25%'}}>
        <Search placeholder="search for items" onSearch={onSearch} style={{ width: '100%' }} />
    </div>
    </div>
    <Content className='main-content'>
        {Items ?
        <>
        {/* <Row>
            <Col span={24}>
            </Col>
        </Row> */}
        <Row gutter={16} style={{marginTop:'1rem'}}>
        <Col span={24}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
                <Title level={4}>Hot deals</Title>
                <Button onClick={()=> handleFilter('hot_deals')} primary>See All</Button>
            </div>
        </Col>
            {Items.hot_deals.map(item => {
                return (
                    <Col key={`new${item.id}`} xs={12} sm={6} lg={4} style={{marginBottom:'1rem'}}>
                        <ItemCard item={item} />
                    </Col>
                )
            })}
        </Row>
        <Row gutter={16} style={{marginTop:'2rem'}}>
        <Col span={24}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
                <Title level={4}>New Items</Title>
                <Button onClick={()=> handleFilter('new_items')} primary>See All</Button>
            </div>
        </Col>
            {Items.new_items.map(item => {
                return (
                    <Col key={`new${item.id}`} xs={12} sm={6} lg={4} style={{marginBottom:'1rem'}}>
                        <ItemCard item={item} />
                    </Col>
                )
            })}
        </Row>
        <Row gutter={16} style={{marginTop:'2rem'}}>
        <Col span={24}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
                <Title level={4}>Top Selling</Title>
                <Button onClick={()=> handleFilter('most_selled')} primary>See All</Button>
            </div>
        </Col>
            {Items.most_selled.map(item => {
                return (
                    <Col key={`top${item.id}`} xs={12} sm={6} lg={4} style={{marginBottom:'1rem'}}>
                        <ItemCard item={item} id={item.id} />
                    </Col>
                )
            })}
        </Row>
        <Row gutter={16} style={{marginTop:'2rem'}}>
        <Col span={24}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
                <Title level={4}>Most Liked</Title>
                <Button onClick={()=> handleFilter('most_liked')} primary>See All</Button>
            </div>
        </Col>
            {Items.most_liked.map(item => {
                return (
                    <Col key={`top${item.id}`} xs={12} sm={6} lg={4} style={{marginBottom:'1rem'}}>
                        <ItemCard item={item} id={item.id} />
                    </Col>
                )
            })}
        </Row>
        </>
        :
        <Spin style={{margin:'5rem 48%'}} size="large" />
        }
    </Content>
    </>
  )
}

export default Home