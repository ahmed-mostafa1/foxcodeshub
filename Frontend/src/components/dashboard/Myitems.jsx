import * as React from "react";
import { Table, Typography, Button, Menu, Tag, Avatar, message } from "antd";
import { Link, Routes, Route } from "react-router-dom";
import {
  MailOutlined,
  AppstoreOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { axiosFetchInstance, handleUnauthorized } from "../../Axios";
import UploadItem from "./Upload";
import { UserContext } from "../../App";

const { Title } = Typography;

const Myitems = (props) => {
  const { authedUser, host } = React.useContext(UserContext);
  const [itemsData, setItemsData] = React.useState([]);
  const [current, setCurrent] = React.useState("all");
  const [viewData, setViewData] = React.useState();

  React.useMemo(() => {
    window.location.pathname === "/dashboard/myitems/upload" &&
      setCurrent("add");
    setItemsData(authedUser.items);
    setViewData(
      authedUser.items.map((item) => {
        return {
          key: item.id,
          logo: item.logo_img,
          name: item.name,
          price: item.price,
          status: item.status,
          sales: item.downloads,
          action: item.id,
          actionstatus: {
            action: item.id,
            status: item.status,
          },
        };
      })
    );
  }, [authedUser]);

  React.useEffect(() => {
    setViewData(
      itemsData.map((item) => {
        return {
          key: item.id,
          logo: item.icon_img,
          name: item.name,
          price: item.price,
          status: item.status,
          sales: item.downloads,
          action: item.id,
          actionstatus: {
            action: item.id,
            status: item.status,
          },
        };
      })
    );
  }, [itemsData]);

  const deleteItem = (id) => {
    axiosFetchInstance
      .delete(`/delete-item/${id}/`)
      .then((res) => {
        message.success("item has deleted successfully", 3);
        setTimeout(() => window.location.reload(), 1000);
      })
      .catch((error) => {
        !error.response || error.response.status === 401
          ? handleUnauthorized(error)
          : message.error(error.response.data.error, 5);
      });
  };

  const handleClick = (e) => {
    switch (e.key) {
      case "approved":
        setItemsData(
          authedUser.items.filter((item) => item.status === "approved")
        );
        break;
      case "waiting":
        setItemsData(
          authedUser.items.filter((item) => item.status === "waiting")
        );
        break;
      case "rejected":
        setItemsData(
          authedUser.items.filter((item) => item.status === "rejected")
        );
        break;
      default:
        setItemsData(authedUser.items);
        break;
    }
    setCurrent(e.key);
  };
  const columns = [
    {
      title: "Logo",
      dataIndex: "logo",
      key: "logo",
      render: (img) => {
        return <Avatar src={`${host}${img}`} />;
      },
      responsive: ["sm"],
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      responsive: ["sm"],
    },
    {
      title: "Sales",
      dataIndex: "sales",
      key: "sales",
      responsive: ["sm"],
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (id) => {
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              flexWrap: "wrap",
            }}
          >
            <Link to={`/item?id=${id}`}>
              <Button
                style={{ margin: "0.25rem 0" }}
                type="primary"
                shape="rounded"
              >
                View
              </Button>
            </Link>
            <Link to={`/dashboard/myitems/upload?item=${id}`}>
              <Button
                style={{ margin: "0.25rem 0" }}
                type="primary"
                danger
                shape="rounded"
              >
                Edit
              </Button>
            </Link>
            <Button
              style={{ margin: "0.25rem 0" }}
              type="dashed"
              onClick={() => deleteItem(id)}
              shape="rounded"
            >
              Delete
            </Button>
          </div>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "A&S",
      dataIndex: "actionstatus",
      key: "actionstatus",
      render: (record) => {
        let color = record.status === "success" ? "green" : "volcano";
        return (
          <React.Fragment>
            <Tag color={color} key={record.status}>
              {record.status.toUpperCase()}
            </Tag>
            <br />
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                flexWrap: "wrap",
              }}
            >
              <Link to={`/item?id=${record.action}`}>
                <Button
                  style={{ margin: "0.25rem 0" }}
                  type="primary"
                  shape="rounded"
                >
                  View
                </Button>
              </Link>
              <Link to={`/dashboard/myitems/upload?item=${record.action}`}>
                <Button
                  style={{ margin: "0.25rem 0" }}
                  type="primary"
                  danger
                  shape="rounded"
                >
                  Edit
                </Button>
              </Link>
              <Button
                style={{ margin: "0.25rem 0" }}
                type="dashed"
                onClick={() => deleteItem(record.action)}
                shape="rounded"
              >
                Delete
              </Button>
            </div>
          </React.Fragment>
        );
      },
      responsive: ["xs"],
    },
  ];

  return (
    <div>
      {viewData && (
        <>
          <Menu
            onClick={handleClick}
            selectedKeys={[current]}
            mode="horizontal"
            style={{ marginBottom: "1.5rem" }}
          >
            <Menu.Item key="all" icon={<MailOutlined />}>
              <Link to="">All items</Link>
            </Menu.Item>
            <Menu.Item key="approved" icon={<AppstoreOutlined />}>
              <Link to="/dashboard/myitems?approved">Approved</Link>
            </Menu.Item>
            <Menu.Item key="waiting" icon={<AppstoreOutlined />}>
              <Link to="/dashboard/myitems?waiting">Waiting</Link>
            </Menu.Item>
            <Menu.Item key="rejected" icon={<AppstoreOutlined />}>
              <Link to="/dashboard/myitems?rejected">Rejected</Link>
            </Menu.Item>
            <Menu.Item key="add" icon={<AppstoreOutlined />}>
              <Link to="upload">Add item</Link>
            </Menu.Item>
          </Menu>

          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Title level={3}> My Items</Title>
                  {viewData && (
                    <Table columns={columns} dataSource={viewData} />
                  )}
                </>
              }
            />
            <Route path="/upload" element={<UploadItem />} />
          </Routes>
        </>
      )}
    </div>
  );
};

export default Myitems;
