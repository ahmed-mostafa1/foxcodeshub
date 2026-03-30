import * as React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import toast, { Toaster } from "react-hot-toast";
import {
  Descriptions,
  Card,
  Button,
  Form,
  Select,
  Typography,
  Avatar,
  message,
} from "antd";
import { ItemContext } from "../../pages/ItemPage";
import { Link } from "react-router-dom";
import { UserContext } from "../../App";
const { Option } = Select;
const { Title } = Typography;
const { Meta } = Card;

const ItemPurchase = () => {
  const { item } = React.useContext(ItemContext);
  const { host, authedUser } = React.useContext(UserContext);
  const [loading, setLoading] = React.useState(item ? false : true);
  const [ftypes, setFtypes] = React.useState();
  React.useEffect(() => {
    let ft = new Set();
    item.frameworks.map((f) => ft.add(f.ftype));
    setFtypes([...ft]);
  }, [item]);
  const licenseChange = (value) => {
    // console.log(value);
  };
  return (
    <div>
      {/* <PayPalScriptProvider
        options={{ "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID }}
      > */}
      <div className="site-card-border-less-wrapper">
        <Toaster position="top-center" />
        <Card title="Paypal" bordered={true} style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Form.Item required>
              <Select placeholder="License..." onChange={licenseChange}>
                <Option value="Single License">Single License</Option>
              </Select>
            </Form.Item>
            <Title level={2}>
              {item.discount_price
                ? `$ ${item.discount_price}`
                : `$ ${item.price}`}
            </Title>
          </div>

          <p>We offer support</p>
          <p>Future item updates</p>
          <p>100% Satisfaction guarantee</p>
          <p>Download code immediately after purchase</p>
          <PayPalButtons
            style={{
              color: "gold",
              label: "buynow",
              layout: "horizontal",
              shape: "rect",
            }}
            createOrder={(data, actions) => {
              if (!authedUser) window.location.href = "/login";
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: item.discount_price
                        ? item.discount_price
                        : item.price,
                    },
                    custom_id: `${item.id}&${authedUser.id}`,
                  },
                ],
              });
            }}
            onCancel={() => {
              toast.error(
                "You cancelled the payment. Try again by clicking the PayPal button",
                { duration: 6000 }
              );
            }}
            onError={() => {
              toast.error(
                "There was an error processing your payment. If this error please contact support.",
                { duration: 6000 }
              );
            }}
            onApprove={async (data, actions) => {
              const details = await actions.order.capture();
              console.log(details);
              toast.success(
                `Payment completed. Thank you, ${details.payer.name.given_name}`
              );
            }}
          />
        </Card>
      </div>
      {/* </PayPalScriptProvider> */}

      <div
        style={{ padding: "1.5rem", margin: "1rem 0", backgroundColor: "#fff" }}
        className="site-card-border-less-wrapper"
      >
        <Descriptions bordered title="Information" size="middle">
          <Descriptions.Item span={3} label="Catigory">
            {item.catigory}
          </Descriptions.Item>
          <Descriptions.Item span={3} label="File Relased">
            {item.relased_date.substring(0, 10)}
          </Descriptions.Item>
          <Descriptions.Item span={3} label="Last Update">
            {item.Last_update}
          </Descriptions.Item>
          <Descriptions.Item span={3} label="Files Included">
            {item.file_types.map((f) => f.name).join(", ")}
          </Descriptions.Item>
          {ftypes &&
            ftypes.map((f, n) => {
              return (
                <Descriptions.Item key={n} span={3} label={f}>
                  {item.frameworks
                    .filter((fr) => fr.ftype === f)
                    .map((fr) => fr.name)
                    .join(", ")}
                </Descriptions.Item>
              );
            })}
          <Descriptions.Item span={3} label="File Size">
            {item.size} MB
          </Descriptions.Item>
        </Descriptions>
      </div>
      <div className="site-card-border-less-wrapper">
        <Card style={{ width: "100%" }} loading={loading}>
          <Meta
            avatar={
              <Avatar
                shape="circle"
                size={64}
                src={`${item.seller.profile_pic}`}
              />
            }
            title={
              <Link to={`/user?id=${item.seller.id}`}>
                <Title level={5}>{item.seller.username}</Title>
              </Link>
            }
            description={item.seller.devtype}
            className="card"
          />
        </Card>
      </div>
    </div>
  );
};

export default ItemPurchase;
