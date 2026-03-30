import * as React from "react";
import { Table, Tag, Space } from "antd";
import { Typography } from "antd";
import { UserContext } from "../../App";

const { Title } = Typography;

const Withdraws = (props) => {
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
      title: "Paypal",
      dataIndex: "paypal",
      key: "paypal",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      responsive: ["sm"],
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      render: (Status) => {
        let color = Status === "success" ? "green" : "volcano";
        return (
          <Tag color={color} key={Status}>
            {Status.toUpperCase()}
          </Tag>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "A&S",
      dataIndex: "amountstatus",
      key: "amountstatus",
      render: (record) => {
        let color = record.status === "success" ? "green" : "volcano";
        return (
          <React.Fragment>
            {record.amount}
            <br />
            <Tag color={color} key={record.status}>
              {record.status.toUpperCase()}
            </Tag>
          </React.Fragment>
        );
      },
      responsive: ["xs"],
    },
  ];

  const withdraws = authedUser
    ? authedUser.withdraws.map((withdraw) => {
        return {
          key: withdraw.id,
          id: withdraw.trans_id,
          date: withdraw.date.substring(0, 10),
          paypal: withdraw.paypal_email,
          amount: withdraw.amount,
          status: withdraw.status,
          amountstatus: {
            amount: withdraw.amount,
            status: withdraw.status,
          },
        };
      })
    : [];

  return (
    <>
      {authedUser && (
        <div>
          <Title level={3}>Withdraws</Title>
          <Table columns={columns} dataSource={withdraws} />
        </div>
      )}
    </>
  );
};

export default Withdraws;
