import * as React from "react";
import { Card, Avatar } from "antd";
import "./Tabs.css";
import { Menu } from "antd";
import {
  ProfileOutlined,
  SettingOutlined,
  DollarOutlined,
  AppstoreOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { UserContext } from "../../App";
const { SubMenu } = Menu;
const { Meta } = Card;

const Tabs = (props) => {
  const { authedUser, host } = React.useContext(UserContext);
  const loading = authedUser ? false : true;

  const handleClick = (e) => {
    // console.log("click ", e);
  };
  return (
    <div className="aside">
      <Card style={{ width: 300 }} loading={loading}>
        <Meta
          avatar={<Avatar size={64} src={`${host}${authedUser.profile_pic}`} />}
          title={`Hi ${authedUser.username}`}
          description={`Joined ${authedUser.join_date.substring(0, 10)}`}
          className="card"
        />
      </Card>
      <Menu
        onClick={handleClick}
        style={{ width: 300 }}
        defaultSelectedKeys={["1"]}
        defaultOpenKeys={["transactions"]}
        mode="inline"
        className="tab-menu"
      >
        <Menu.Item
          className="tab-item"
          key="dashboard"
          icon={<ProfileOutlined />}
        >
          <Link to="">Dashboard</Link>
        </Menu.Item>
        <Menu.Item
          className="tab-item"
          key="myaccount"
          icon={<SettingOutlined />}
        >
          <Link to="myaccount">My Account</Link>
        </Menu.Item>
        <SubMenu
          className="sub-tab"
          key="transactions"
          icon={<DollarOutlined />}
          title="Transactions"
        >
          <Menu.Item className="tab-item" key="payments">
            <Link to="payments">Payments</Link>
          </Menu.Item>
          <Menu.Item className="tab-item" key="earnings">
            <Link to="earnings">Earnings</Link>
          </Menu.Item>
          <Menu.Item className="tab-item" key="withdraws">
            <Link to="withdraws">Withdraws</Link>
          </Menu.Item>
          <Menu.Item className="tab-item" key="withdraw-money">
            <Link to="withdraw-money">Withdraw Money</Link>
          </Menu.Item>
        </SubMenu>
        <SubMenu
          className="sub-tab"
          key="items"
          icon={<AppstoreOutlined />}
          title="Items"
        >
          <Menu.Item className="tab-item" key="myitems">
            <Link to="myitems">My Items</Link>
          </Menu.Item>
          <Menu.Item className="tab-item" key="downloads">
            <Link to="payments">Downloads</Link>
          </Menu.Item>
        </SubMenu>
        <Menu.Item className="tab-item" key="wishlist" icon={<HeartOutlined />}>
          <Link to="wishlist">Wishlist</Link>
        </Menu.Item>
        <Menu.Item className="tab-item" key="wishlist" icon={<HeartOutlined />}>
          <Link to="support">Support</Link>
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default Tabs;
