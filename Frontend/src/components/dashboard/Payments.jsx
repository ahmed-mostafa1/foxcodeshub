import * as React from "react";
import { Table, Tag, Row, Col } from "antd";
import { Typography } from "antd";
import { UserContext } from "../../App";

const { Title } = Typography;

const Payments = (props) => {
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

  const payments = authedUser
    ? authedUser.payments.map((trans) => {
        return {
          key: trans.id,
          id: trans.trans_id,
          date: trans.date.substring(0, 10),
          details: trans.item,
          amount: `$ ${trans.total_amount}`,
        };
      })
    : [];

  return (
    <>
      {authedUser && (
        <div>
          <Title level={3}>Last Payments</Title>
          <Table
            columns={columns}
            dataSource={payments}
            className="table-view"
          />
        </div>
      )}
    </>
  );
};

export default Payments;
