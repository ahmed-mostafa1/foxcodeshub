import * as React from "react";
import { Menu } from "antd";
import { Link } from "react-router-dom";
import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { axiosFetchInstance } from "../../Axios";
import { ItemsContext } from "../../pages/Catalog";
const { SubMenu } = Menu;
const Catigories = ({ catigories }) => {
  const { items, setItems } = React.useContext(ItemsContext);
  const [openKeys, setOpenKeys] = React.useState(["cat 1"]);
  // React.useEffect(() => {
  //   axiosFetchInstance.get('/catigories/')
  //   .then(res => setCatigories(res.data))
  // }, [])

  const onOpenChange = (keys) => {
    const k = keys[keys.length - 1];
    // console.log(k)
    if (k) {
      axiosFetchInstance(`/items/catigory=${k[k.length - 1]}/`).then((res) => {
        // console.log(res.data)
        setItems(res.data);
      });
    }
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  const handleClick = (e) => {
    // console.log(e.key)
    axiosFetchInstance(`/items/sub_catigory=${e.key[e.key.length - 1]}/`).then(
      (res) => setItems(res.data)
    );
  };
  // const catigories = []

  // for (let index = 1; index < 6; index++) {
  //     catigories.push({
  //         title:'Catigory' + index,
  //         subCatigories:[]
  //     })
  //     for (let index = 1; index < 6; index++) {
  //         catigories[catigories.length-1].subCatigories.push(`Subcatigory${index}`)
  //     }
  // }
  const rootSubmenuKeys = catigories.map((i) => `cat ${i.id}`);

  return (
    <Menu
      onClick={handleClick}
      style={{ width: 300 }}
      openKeys={openKeys}
      onOpenChange={onOpenChange}
      mode="inline"
      className="tab-menu"
    >
      {catigories.map((cat) => {
        return (
          <SubMenu
            className="sub-tab"
            key={`cat ${cat.id}`}
            icon={<AppstoreOutlined />}
            title={cat.name}
          >
            {cat.sub_catigories.map((sub) => {
              return (
                <Menu.Item className="tab-item" key={`sub ${sub.id}`}>
                  {sub.name}
                </Menu.Item>
              );
            })}
          </SubMenu>
        );
      })}
    </Menu>
  );
};

export default Catigories;
