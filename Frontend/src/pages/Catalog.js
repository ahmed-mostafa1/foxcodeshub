import * as React from 'react'
import Catigories from '../components/catalog/Catigories'
import Items from '../components/catalog/Items'
import { axiosFetchInstance } from '../Axios'
import { Layout, Spin, spin } from 'antd'
import QueryString from 'query-string'
import { useLocation } from 'react-router-dom'
export const ItemsContext = React.createContext()
const { Sider, Content } = Layout;
const Catalog = (props) => {
    const [items, setItems] = React.useState()
    const [catigories, setCatigories] = React.useState()
    const location = useLocation()
    const query = QueryString.parse(location.search)
    React.useEffect(()=> {
        axiosFetchInstance.get('/catigories/')
        .then(res => setCatigories(res.data))
        axiosFetchInstance('/items/all/')
        .then(res => {
            if(query.search) setItems(res.data.filter(i => i.name.toLowerCase().includes(query.search.toLowerCase())))
            else if (query.filter){
                switch(query.filter){
                    case 'new_items':
                        setItems(res.data.reverse())
                        break;
                    case 'most_selled':
                        setItems(res.data.sort((a, b)=>{
                            if (a.downloads > b.downloads) return -1
                            if (a.downloads < b.downloads) return 1
                            return 0
                        }))
                        break;
                    case 'most_liked':
                        setItems(res.data.sort((a, b)=>{
                            if (a.likes.length > b.likes.length) return -1
                            if (a.likes.length < b.likes.length) return 1
                            return 0
                        }))
                    case 'hot_deals':
                        setItems(res.data.filter(i => i.discount_price))
                        break;
                    default:
                        setItems(res.data);
                        break;
                }
            }   
            else setItems(res.data)
        
        })
    }, [])
    
  return (
    <Layout className='main-content'>
        {items && catigories ?
        <ItemsContext.Provider value={{items, setItems}}>
        <Sider 
            width={300} 
            className="site-layout-background" 
            style={{height:'90vh', marginTop:'1.5rem', paddingTop:'1rem'}}
            breakpoint="lg"
            collapsedWidth="0"
        >
            <Catigories catigories={catigories} />
        </Sider>
        <Layout>
            <Content className='dash-content'>
                <Items />
            </Content>
        </Layout>
        </ItemsContext.Provider>
        :
        <Spin  size='large'/>
        }
    </Layout>
  )
}

export default Catalog