import * as React from "react";
import { Table, Tag, Space } from "antd";
import { Typography, Form, Input, Button, InputNumber, message } from "antd";
import { axiosFetchInstance, handleUnauthorized } from "../../Axios";
import { UserContext } from "../../App";

const { Title } = Typography;

const WithdrawMoney = (props) => {
  const { authedUser } = React.useContext(UserContext);
  const [data, setData] = React.useState();
  const [form] = Form.useForm();

  React.useEffect(() => {
    let totalEarnings = 0;
    authedUser.earnings.length > 0 &&
      authedUser.earnings.map((i) => (totalEarnings += i.net_amount));
    let totalWithdraws = 0;
    authedUser.withdraws.length > 0 &&
      authedUser.withdraws.map((i) => (totalWithdraws += i.amount));
    setData([
      {
        key: 1,
        totalearnings: totalEarnings,
        totalwithdraws: totalWithdraws,
        availablecredit: authedUser ? authedUser.credit : 0,
      },
    ]);
  }, [authedUser]);

  const handleWithdraw = (values) => {
    // console.log(values);
    if (values.amount > authedUser.credit || values.amount < 30) {
      message.error("Your credit is not enough for this withdraw");
      return;
    }
    const data = JSON.stringify({
      paypal_email: values.paypal_mail.toLowerCase(),
      amount: values.amount,
    });
    axiosFetchInstance
      .post("/payments/create-payout/", data)
      .then((res) => {
        console.log(res.data);
        message.success(res.data.success);
        setTimeout(() => (window.location.href = "/dashboard/withdraws"), 1500);
      })
      .catch((error) => {
        error.response.status === 401 || !error.response.status
          ? handleUnauthorized(error)
          : message.error(error.response.data.error);
      });
  };

  const columns = [
    {
      title: "Total Earnings",
      dataIndex: "totalearnings",
      key: "totalearnings",
    },
    {
      title: "Total Withdraws",
      dataIndex: "totalwithdraws",
      key: "totalwithdraws",
    },
    {
      title: "Credit",
      dataIndex: "availablecredit",
      key: "availablecredit",
    },
  ];

  return (
    <div>
      <Title level={3}>Withdraw Money</Title>
      <Table columns={columns} dataSource={data} />
      <Form onFinish={handleWithdraw} layout="vertical" form={form}>
        <Form.Item
          name="paypal_email"
          rules={[
            {
              type: "email",
              message: "The input is not valid E-mail!",
            },
            {
              required: true,
              message: "Please input your PayPal E-mail!",
            },
          ]}
          label="Paypal Email"
        >
          <Input placeholder="Paypal Email" />
        </Form.Item>
        <Form.Item
          name="amount"
          rules={[
            {
              type: "number",
              message: "The input is not valid number",
            },
            {
              required: true,
              message: "Please input the amount",
            },
          ]}
          label="Withdraw Amount (minmal $30)"
        >
          <InputNumber style={{ width: "100%" }} placeholder="Amount" />
        </Form.Item>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="dashed">Check Withdraw</Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default WithdrawMoney;
