import * as React from "react";
import {
  Input,
  Collapse,
  Form,
  Button,
  Select,
  Checkbox,
  Upload,
  message,
} from "antd";
import {
  MailTwoTone,
  IdcardTwoTone,
  UserOutlined,
  ContactsTwoTone,
  CreditCardTwoTone,
  KeyOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { formatTimeStr } from "antd/lib/statistic/utils";
import { UserContext } from "../../App";
import { axiosFetchInstance, handleUnauthorized } from "../../Axios";
const { Panel } = Collapse;
const { Option } = Select;

const MyAccount = (props) => {
  const [form] = Form.useForm();
  const { authedUser, host } = React.useContext(UserContext);
  const [defaultFw, setDefaultFw] = React.useState([]);
  const [defaultOs, setDefaultOs] = React.useState([]);

  // const [email, setEmail] = React.useState('')
  // const [username, setUsername] = React.useState('')
  // const [name, setName] = React.useState('')
  // const [devType, setDevType] = React.useState('')
  // const [operationSystems, setOperationSystems] = React.useState([])
  // const [frameworks, setFrameworks] = React.useState([])
  // const [devExp, setDevExp] = React.useState('')
  // const [publicEmail, setPublicEmail] = React.useState('')

  React.useMemo(() => {
    axiosFetchInstance("/account/options/")
      .then((res) => {
        setDefaultFw(res.data.frameworks);
        setDefaultOs(res.data.operation_systems);
      })
      .catch((error) => handleUnauthorized(error));
  }, []);

  React.useEffect(() => {
    authedUser && setImgUrl(`${host}${authedUser.profile_pic}`);
  }, [authedUser, host]);

  const submitMyAccount = (values) => {
    const data = JSON.stringify({
      email: values.email.toLowerCase(),
      username: values.username,
      fullname: values.fullname,
    });
    axiosFetchInstance
      .put("/account/update-profile/", data)
      .then((res) => {
        message.success(res.data.success);
      })
      .catch((error) => {
        if (error.response.status === 401) handleUnauthorized(error);
        else {
          for (const key in error.response.data) {
            message.error(
              error.response.data[key][0].substring(
                2,
                error.response.data[key][0].length - 2
              )
            );
          }
        }
        form.resetFields();
      });
  };
  const submitDevDetails = (values) => {
    const data = JSON.stringify({
      devtype: values.devtype,
      dev_exp: values.dev_exp,
      frameworks: values.frameworks,
      operation_systems: values.operation_systems,
      public_email: values.public_email
        ? values.public_email.toLowerCase()
        : "",
    });
    axiosFetchInstance
      .put("/account/update-profile/", data)
      .then((res) => {
        message.success(res.data.success);
      })
      .catch((error) => {
        // console.log(error.response);
        if (error.response.status === 401) handleUnauthorized(error);
        else {
          for (const key in error.response.data) {
            message.error(
              error.response.data[key][0].substring(
                2,
                error.response.data[key][0].length - 2
              )
            );
          }
        }
        form.resetFields();
      });
  };
  const submitPassword = (values) => {
    const data = JSON.stringify({
      old_password: values.old_password,
      new_password: values.new_password,
    });
    axiosFetchInstance
      .put("/account/update-password/", data)
      .then((res) => {
        message.success(res.data.success);
        form.resetFields();
      })
      .catch((error) => {
        if (error.response.status === 401) handleUnauthorized(error);
        else {
          for (const key in error.response.data) {
            message.error(
              error.response.data[key][0].substring(
                2,
                error.response.data[key][0].length - 2
              )
            );
          }
        }
      });
  };
  ////   Upload avatar   ////
  const [loading, setLoading] = React.useState(false);
  const [imgUrl, setImgUrl] = React.useState("");
  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );
  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error("Image must smaller than 1MB!");
    }
    return false;
  };

  const handleUpload = (info) => {
    // Get this url from response in real world.
    getBase64(info.file, (imageUrl) => {
      setImgUrl(imageUrl);
      setLoading(false);
    });
    const data = new FormData();
    data.append("profile_pic", info.file, info.file.name);
    axiosFetchInstance
      .put("/account/update-profile/", data)
      .then((res) => {
        message.success(res.data.success);
        setTimeout(() => window.location.reload, 1000);
      })
      .catch((error) => {
        if (error.response.status === 401) handleUnauthorized(error);
        else {
          for (const key in error.response.data) {
            message.error(
              error.response.data[key][0].substring(
                2,
                error.response.data[key][0].length - 2
              )
            );
          }
        }
      });
  };
  ////   Upload avatar   ////

  // check boxes

  const fwOptions = defaultFw.map((i) => {
    return { label: i.name, value: i.id };
  });

  const osOptions = defaultOs.map((i) => {
    return { label: i.name, value: i.id };
  });
  // check boxes / /

  // collapse
  const callback = (e) => {};
  // collapse
  return (
    <>
      {authedUser && (
        <Collapse
          defaultActiveKey={["1"]}
          accordion
          expandIconPosition="right"
          onChange={callback}
        >
          <Panel header="My Account" key="1">
            <Form
              layout="vertical"
              initialValues={{
                email: authedUser.email,
                fullname: authedUser.fullname,
                username: authedUser.username,
              }}
              form={form}
              onFinish={submitMyAccount}
            >
              <Form.Item
                name="email"
                rules={[
                  {
                    type: "email",
                    message: "The input is not valid E-mail!",
                  },
                  {
                    required: true,
                    message: "Please input your E-mail!",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Email"
                  prefix={<MailTwoTone twoToneColor="rgb(254 91 24)" />}
                />
              </Form.Item>
              <Form.Item
                name="fullname"
                rules={[{ required: true, message: "Please input your Name!" }]}
              >
                <Input
                  size="large"
                  placeholder="Full Name"
                  prefix={<IdcardTwoTone twoToneColor="rgb(254 91 24)" />}
                />
              </Form.Item>
              <Form.Item
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Please input your user name!",
                    whitespace: true,
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="User Name"
                  prefix={<ContactsTwoTone twoToneColor="rgb(254 91 24)" />}
                />
              </Form.Item>
              {/* <Form.Item>
            <Input size='large' placeholder="Paypal Email" prefix={<CreditCardTwoTone twoToneColor='rgb(254 91 24)' />} />
        </Form.Item> */}
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Update Account
                </Button>
              </Form.Item>
            </Form>
          </Panel>
          <Panel header="Developer Details" key="2">
            <Form
              initialValues={{
                devtype: authedUser.devtype,
                dev_exp: authedUser.dev_exp,
                public_email: authedUser.public_email,
                frameworks: ([] = authedUser.frameworks.map((i) => i.id)),
                operation_systems: ([] = authedUser.operation_systems.map(
                  (i) => i.id
                )),
              }}
              layout="vertical"
              form={form}
              onFinish={submitDevDetails}
            >
              <Form.Item label="Developer Type" name="devtype">
                <Select style={{ width: "100%" }}>
                  <Option value="Indbendent Developer">
                    Indbendent Developer
                  </Option>
                  <Option value="Development Agency">Development Agency</Option>
                </Select>
              </Form.Item>
              <Form.Item name="operation_systems" label="Operation System">
                <Checkbox.Group options={osOptions} />
              </Form.Item>
              <Form.Item label="Frameworks" name="frameworks">
                <Checkbox.Group options={fwOptions} />
              </Form.Item>
              <Form.Item label="Developer Experience" name="dev_exp">
                <Select style={{ width: "100%" }}>
                  <Option value="1-3 years">1-3 years</Option>
                  <Option value="2-5 years">2-5 years</Option>
                  <Option value="more than 5 years">more than 5 years</Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Public contact for profile: (optional for freelance work)"
                name="public_email"
              >
                <Input
                  size="large"
                  placeholder="Email"
                  prefix={<MailTwoTone twoToneColor="rgb(254 91 24)" />}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Update Account
                </Button>
              </Form.Item>
            </Form>
          </Panel>
          <Panel header="Change Password" key="3">
            <Form layout="vertical" form={form} onFinish={submitPassword}>
              <Form.Item
                name="old_password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
                hasFeedback
              >
                <Input.Password
                  size="large"
                  placeholder="Old Password"
                  prefix={<KeyOutlined />}
                />
              </Form.Item>
              <Form.Item
                name="new_password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
                hasFeedback
              >
                <Input.Password
                  size="large"
                  placeholder="New Password"
                  prefix={<KeyOutlined />}
                />
              </Form.Item>
              <Form.Item
                name="re-password"
                dependencies={["new_password"]}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please confirm your password!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("new_password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "The two passwords that you entered do not match!"
                        )
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="Re-password"
                  prefix={<KeyOutlined />}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Change Password
                </Button>
              </Form.Item>
            </Form>
          </Panel>
          <Panel header="Profile Picture" key="4">
            <p>Please upload size &lt; 1 MB(.png or .jpg file)</p>
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleUpload}
            >
              {imgUrl !== "" ? (
                <img src={imgUrl} alt="avatar" style={{ width: "100%" }} />
              ) : (
                uploadButton
              )}
            </Upload>
            <Button type="primary" block>
              Update Avatar
            </Button>
          </Panel>
        </Collapse>
      )}
    </>
  );
};

export default MyAccount;
