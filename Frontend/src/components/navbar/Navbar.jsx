import * as React from "react";
import { UserContext } from "../../App";
import { Menu, Button, Tag } from "antd";
import "./Navbar.css";
import {
  HomeOutlined,
  AppstoreOutlined,
  ProfileOutlined,
  UploadOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
const { SubMenu } = Menu;

const Navbar = () => {
  const [current, setCurrent] = React.useState("home");
  const { authedUser } = React.useContext(UserContext);

  React.useEffect(() => {
    if (window.location.pathname === "/") setCurrent("home");
    else if (window.location.pathname.includes("upload")) setCurrent("upload");
    else if (window.location.pathname.includes("dashboard"))
      setCurrent("dashboard");
    else if (window.location.pathname.includes("catalog"))
      setCurrent("catalog");
  }, [window.location.pathname]);

  const handleClick = (e) => {
    setCurrent(e.key);
    if (e.key === "signout") {
      localStorage.clear();
      window.location.href = "/";
    }
  };

  return (
    <Menu onClick={handleClick} selectedKeys={[current]} mode="horizontal">
      <Menu.Item key="home" icon={<HomeOutlined />}>
        <Link className="link" to="/">
          Home
        </Link>
      </Menu.Item>

      <Menu.Item key="catalog" icon={<AppstoreOutlined />}>
        <Link to="/catalog">Catalog</Link>
      </Menu.Item>
      {authedUser && authedUser.id ? (
        <>
          <Menu.Item key="dashboard" icon={<ProfileOutlined />}>
            <Link to="/dashboard">Dashboard</Link>
          </Menu.Item>

          <Menu.Item key="upload" icon={<UploadOutlined />}>
            <Link to="/dashboard/myitems/upload">Upload</Link>
          </Menu.Item>

          <SubMenu
            style={{ marginLeft: "auto" }}
            key="SubMenu"
            icon={<Tag color="success">{`$ ${authedUser.credit}`}</Tag>}
            title={`Hi ${authedUser.username}`}
          >
            <Menu.Item key="sub-dashboard" icon={<ProfileOutlined />}>
              <Link to="/dashboard">Dashboard</Link>
            </Menu.Item>

            <Menu.Item key="sellitem" icon={<UploadOutlined />}>
              <Link to="/dashboard/myitems/upload">Sell Item</Link>
            </Menu.Item>

            <Menu.Item key="signout" icon={<LogoutOutlined />}>
              Sign Out
            </Menu.Item>
          </SubMenu>
        </>
      ) : (
        <>
          <Menu.Item
            style={{ marginLeft: "auto" }}
            key="signup"
            className="nav-btn"
          >
            <Link to="/signup">
              <Button type="primary">Sign up</Button>
            </Link>
          </Menu.Item>

          <Menu.Item key="login" className="nav-btn">
            <Link to="/login">
              <Button type="dashed">Log in</Button>
            </Link>
          </Menu.Item>
        </>
      )}
    </Menu>
  );
};

export default Navbar;
