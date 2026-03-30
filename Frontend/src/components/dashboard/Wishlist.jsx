import * as React from "react";
import { Table, Tag, Space } from "antd";
import { Typography, Button, message } from "antd";
import { Link } from "react-router-dom";
import { UserContext } from "../../App";
import { axiosFetchInstance, handleUnauthorized } from "../../Axios";

const { Title } = Typography;

const Wishlist = (props) => {
  const { authedUser } = React.useContext(UserContext);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => {
        return (
          <Tag color="success" key={price}>
            {price}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (id) => {
        return (
          <div style={{ display: "flex", justifyContent: "space-evenly" }}>
            <Link to={`/item?id=${id}`}>
              <Button type="primary" shape="rounded">
                Details
              </Button>
            </Link>
            <Button
              onClick={() => removeItem(id)}
              type="dashed"
              danger
              shape="rounded"
            >
              Remove
            </Button>
          </div>
        );
      },
    },
  ];

  const items = authedUser.wishlist_items
    ? authedUser.wishlist_items.map((item) => {
        return {
          key: item.id,
          name: item.name,
          price: item.price,
          action: item.id,
        };
      })
    : [];
  const removeItem = (id) => {
    axiosFetchInstance
      .get(`/handle-wishlist/${id}/remove/`)
      .then((res) => {
        message.success(res.data.success);
        setTimeout(() => window.location.reload(), 1000);
      })
      .catch((error) => {
        handleUnauthorized(error);
      });
  };

  return (
    <>
      {authedUser && (
        <div>
          <Title level={3}>Wishlist</Title>
          <Table columns={columns} dataSource={items} />
        </div>
      )}
    </>
  );
};

export default Wishlist;
