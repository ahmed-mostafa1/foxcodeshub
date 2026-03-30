import * as React from "react";
import { Table, Tag, Space } from "antd";
import { Typography } from "antd";
import { UserContext } from "../../App";
const { Title } = Typography;

const Earnings = (props) => {
  const { authedUser } = React.useContext(UserContext);
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      responsive: ["sm"],
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Details",
      dataIndex: "details",
      key: "details",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
  ];

  const earnings = authedUser
    ? authedUser.earnings.map((trans) => {
        return {
          key: trans.id,
          id: trans.id,
          date: trans.data.substring(0, 10),
          details: trans.item,
          amount: trans.amount,
        };
      })
    : [];

  return (
    <>
      {authedUser && (
        <div>
          <Title level={3}>Earnings</Title>
          <Table columns={columns} dataSource={earnings} />
        </div>
      )}
    </>
  );
};

export default Earnings;
