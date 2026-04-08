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
  Tag,
} from "antd";
import { LockOutlined, DownloadOutlined, CreditCardOutlined } from "@ant-design/icons";
import { ItemContext } from "../../pages/ItemPage";
import { Link, useLocation } from "react-router-dom";
import { UserContext } from "../../App";
import { axiosFetchInstance } from "../../Axios";

const { Option } = Select;
const { Title } = Typography;
const { Meta } = Card;

const ItemPurchase = ({ onDownload }) => {
  const { item } = React.useContext(ItemContext);
  const { authedUser, refreshAuthedUser } = React.useContext(UserContext);
  const location = useLocation();
  const [ftypes, setFtypes] = React.useState();
  const [stripeLoading, setStripeLoading] = React.useState(false);
  const paymentSyncHandledRef = React.useRef(false);

  React.useEffect(() => {
    let ft = new Set();
    item.frameworks.map((f) => ft.add(f.ftype));
    setFtypes([...ft]);
  }, [item]);

  // Check if user already purchased this item (compare by item ID)
  const hasPurchased =
    authedUser &&
    authedUser.payments &&
    authedUser.payments.find((p) => p.item === item.id);
  const paymentStatus = new URLSearchParams(location.search).get("payment");

  React.useEffect(() => {
    if (paymentStatus !== "success" || !authedUser?.id || !item?.id) {
      paymentSyncHandledRef.current = false;
      return;
    }

    if (paymentSyncHandledRef.current) {
      return;
    }

    let cancelled = false;

    const clearPaymentQuery = () => {
      const params = new URLSearchParams(location.search);
      params.delete("payment");
      const nextQuery = params.toString();
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`
      );
    };

    const wait = (ms) =>
      new Promise((resolve) => {
        window.setTimeout(resolve, ms);
      });

    const syncPurchase = async () => {
      paymentSyncHandledRef.current = true;

      if (hasPurchased) {
        message.success("Payment confirmed. Download is now available.", 4);
        clearPaymentQuery();
        return;
      }

      for (let attempt = 0; attempt < 6; attempt += 1) {
        const userData = await refreshAuthedUser();

        if (cancelled) {
          return;
        }

        const payments = userData?.payments || [];
        if (payments.find((payment) => payment.item === item.id)) {
          message.success("Payment confirmed. Download is now available.", 4);
          clearPaymentQuery();
          return;
        }

        await wait(2000);

        if (cancelled) {
          return;
        }
      }

      message.info(
        "Payment succeeded, but purchase sync is still pending. Refresh in a few seconds if download stays locked.",
        6
      );
    };

    syncPurchase();

    return () => {
      cancelled = true;
    };
  }, [authedUser?.id, hasPurchased, item?.id, location.search, paymentStatus, refreshAuthedUser]);

  const handleStripeCheckout = async () => {
    if (!authedUser || !authedUser.id) {
      window.location.href = "/login";
      return;
    }
    setStripeLoading(true);
    try {
      const res = await axiosFetchInstance.post("/payments/stripe/create-checkout/", {
        item_id: item.id,
      });
      window.location.href = res.data.session_url;
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        "Could not start Stripe checkout. Please try again.";
      message.error(msg, 5);
      setStripeLoading(false);
    }
  };

  const licenseChange = (value) => {};

  return (
    <div>
      <div className="site-card-border-less-wrapper">
        <Toaster position="top-center" />

        {/* ── Purchase card ── */}
        <Card title="Purchase" bordered={true} style={{ width: "100%" }}>
          {hasPurchased && (
            <Tag
              color="success"
              style={{ marginBottom: "0.75rem", fontSize: "0.85rem", padding: "4px 10px" }}
            >
              ✅ Already Purchased
            </Tag>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Form.Item required>
              <Select placeholder="License..." onChange={licenseChange}>
                <Option value="Single License">Single License</Option>
              </Select>
            </Form.Item>
            <Title level={2}>
              {item.discount_price ? `$ ${item.discount_price}` : `$ ${item.price}`}
            </Title>
          </div>

          <p>✅ We offer support</p>
          <p>✅ Future item updates</p>
          <p>✅ 100% Satisfaction guarantee</p>
          <p>✅ Download code immediately after purchase</p>

          {/* ── PayPal ── */}
          <div style={{ marginBottom: "0.75rem" }}>
            <PayPalScriptProvider
              options={{ "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID || "test" }}
            >
              <PayPalButtons
                style={{ color: "gold", label: "buynow", layout: "horizontal", shape: "rect" }}
                createOrder={(data, actions) => {
                  if (!authedUser || !authedUser.id) window.location.href = "/login";
                  return actions.order.create({
                    purchase_units: [
                      {
                        amount: {
                          value: item.discount_price ? item.discount_price : item.price,
                        },
                        custom_id: `${item.id}&${authedUser.id}`,
                      },
                    ],
                  });
                }}
                onCancel={() => {
                  toast.error("Payment cancelled. Try again by clicking Pay.", { duration: 5000 });
                }}
                onError={() => {
                  toast.error("PayPal error. Please contact support if it persists.", { duration: 5000 });
                }}
                onApprove={async (data, actions) => {
                  const details = await actions.order.capture();
                  toast.success(`Payment completed. Thank you, ${details.payer.name.given_name}`);
                }}
              />
            </PayPalScriptProvider>
          </div>

          {/* ── Stripe ── */}
          <Button
            block
            icon={<CreditCardOutlined />}
            style={{ background: "#635bff", borderColor: "#635bff", color: "#fff", height: 40 }}
            loading={stripeLoading}
            onClick={handleStripeCheckout}
          >
            Pay with Stripe
          </Button>
        </Card>
      </div>

      {/* ── Download section ── */}
      <div style={{ margin: "1rem 0" }} className="site-card-border-less-wrapper">
        <Card style={{ width: "100%" }}>
          {hasPurchased ? (
            <Button
              block
              type="primary"
              icon={<DownloadOutlined />}
              onClick={onDownload}
              style={{ height: 44, fontSize: "1rem" }}
            >
              Download Code
            </Button>
          ) : (
            <Button
              block
              disabled
              icon={<LockOutlined />}
              style={{ height: 44, fontSize: "1rem", color: "#999", background: "#f5f5f5" }}
            >
              Purchase to Download
            </Button>
          )}
        </Card>
      </div>

      {/* ── Item Info ── */}
      <div
        style={{ padding: "1.5rem", margin: "1rem 0", backgroundColor: "#fff" }}
        className="site-card-border-less-wrapper"
      >
        <Descriptions bordered title="Information" size="middle">
          <Descriptions.Item span={3} label="Category">
            {item.catigory}
          </Descriptions.Item>
          <Descriptions.Item span={3} label="File Released">
            {item.relased_date.substring(0, 10)}
          </Descriptions.Item>
          <Descriptions.Item span={3} label="Last Update">
            {item.Last_update}
          </Descriptions.Item>
          <Descriptions.Item span={3} label="Files Included">
            {item.file_types.map((f) => f.name).join(", ")}
          </Descriptions.Item>
          {ftypes &&
            ftypes.map((f, n) => (
              <Descriptions.Item key={n} span={3} label={f}>
                {item.frameworks
                  .filter((fr) => fr.ftype === f)
                  .map((fr) => fr.name)
                  .join(", ")}
              </Descriptions.Item>
            ))}
          <Descriptions.Item span={3} label="File Size">
            {item.size} MB
          </Descriptions.Item>
        </Descriptions>
      </div>

      {/* ── Seller card ── */}
      <div className="site-card-border-less-wrapper">
        <Card style={{ width: "100%" }}>
          <Meta
            avatar={
              <Avatar shape="circle" size={64} src={`${item.seller.profile_pic}`} />
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
