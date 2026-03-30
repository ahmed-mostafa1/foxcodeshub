import * as React from "react";
import { Form, Input, Button, message } from "antd";
import { UserContext } from "../../App";
import { axiosFetchInstance, handleUnauthorized } from "../../Axios";
import { ItemContext } from "../../pages/ItemPage";
const { TextArea } = Input;

const Support = (props) => {
  const [form] = Form.useForm();
  const { authedUser } = React.useContext(UserContext);

  const handleSupport = (values) => {
    const data = JSON.stringify({
      username: values.username,
      email: values.email,
      content: values.content,
    });
    if (window.location.href.includes("item")) {
      axiosFetchInstance
        .post(`/account/support/${props.item.id}/`, data)
        .then((res) => {
          message.success(res.data.success, 5);
          form.resetFields();
        })
        .catch((error) => {
          handleUnauthorized(error);
        });
    } else {
      axiosFetchInstance
        .post("/account/support/", data)
        .then((res) => {
          message.success(res.data.success, 5);
          form.resetFields();
        })
        .catch((error) => {
          handleUnauthorized(error);
        });
    }
  };
  return (
    <div>
      <Form
        initialValues={{
          username: authedUser.username,
          email: authedUser.email,
        }}
        onFinish={handleSupport}
        form={form}
        layout="vertiacal"
      >
        <Form.Item name="username" label="User name">
          <Input readOnly />
        </Form.Item>

        <Form.Item name="email" label="Email">
          <Input readOnly />
        </Form.Item>

        <Form.Item
          label="Your Problem"
          name="content"
          rules={[
            {
              required: true,
              message: "Please input your problem",
            },
          ]}
        >
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary">
            Request Support
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Support;
