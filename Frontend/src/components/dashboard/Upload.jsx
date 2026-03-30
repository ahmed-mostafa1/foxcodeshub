import * as React from "react";
import "./Upload.css";
import {
  Steps,
  Button,
  message,
  Form,
  Input,
  Select,
  Checkbox,
  Modal,
  Upload,
  Typography,
  InputNumber,
} from "antd";
import { InboxOutlined, PlusOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../App";
import { axiosFetchInstance, handleUnauthorized } from "../../Axios";
import QueryString from "query-string";
const { TextArea } = Input;
const { Step } = Steps;
const { Dragger } = Upload;
const { Option } = Select;
const { Title } = Typography;

const UploadItem = (props) => {
  const [form] = Form.useForm();
  const { authedUser } = React.useContext(UserContext);
  const [initialValues, setInitialValues] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const [catigoriesOptions, setCatigoriesOptions] = React.useState([]);
  const [subsOptions, setSubOptions] = React.useState([]);
  const [fwOptions, setFwOptions] = React.useState([]);
  const [fileOptions, setFileOptions] = React.useState([]);
  const [prevImg, setPrevImg] = React.useState("");
  const [pervTitle, setPrevTitle] = React.useState("");
  const [pervVisible, setPrevVisible] = React.useState(false);
  const [fileList, SetFilelist] = React.useState([]);
  const [icon, setIcon] = React.useState("");
  const [preview, setPreview] = React.useState("");
  const [productDetails, setProductDetails] = React.useState({});
  const [catigory, setCatigory] = React.useState("");
  const [subcatigory, setSubcatigory] = React.useState("");
  const [frameworks, setFrameworks] = React.useState([]);
  const [file_types, setFile_types] = React.useState("");
  // const [zip_file, setZip_file] = React.useState();
  const itemName = React.useRef();
  const itemShortDesc = React.useRef();
  const itemDesc = React.useRef();
  const itemFeatures = React.useRef();
  const itemDemoUrl = React.useRef();
  const itemTestApk = React.useRef();
  const itemTestIos = React.useRef();
  const itemYTurl = React.useRef();
  const itemPrice = React.useRef();
  const itemSize = React.useRef();
  const fileUrl = React.useRef();
  const location = useLocation();
  const query = QueryString.parse(location.search);

  React.useMemo(() => {
    axiosFetchInstance
      .get("/catigories/")
      .then((res) => {
        console.log(res.data);
        setCatigoriesOptions(res.data);
      })
      .catch((error) => {
        !error.response || error.response.status === 401
          ? handleUnauthorized(error)
          : console.log(error.response);
      });
    if (query.item) {
      axiosFetchInstance
        .get(`/item-details/${query.item}/`)
        .then((res) => {
          const item = res.data;
          setInitialValues({
            name: item.name,
            short_desc: item.short_describtion,
            file_types: item.file_types.map((f) => f.id),
            desc: item.describtion,
            demo_url: item.demo_url,
            test_apk: item.test_apk,
            test_ios: item.test_ios,
            youtube_url: item.youtube_url,
            size: item.size,
            features: item.featurs,
            price: item.price,
            file_url: item.file_url,
          });
        })
        .catch((error) => {
          console.log(error);
          !error.response || error.response.status === 401
            ? handleUnauthorized(error)
            : console.log(error.response);
        });
    } else setInitialValues({});
  }, []);

  const addItem = () => {
    let data;
    const main = new FormData();
    try {
      // main.append("zip_file", zip_file, zip_file.name);
      main.append("icon_img", icon, icon.name);
      main.append("preview_img", preview, preview.name);

      if (fileList.length > 0) {
        for (let index = 0; index < fileList.length; index++) {
          main.append(
            `screen${index + 1}`,
            fileList[index].originFileObj,
            fileList[index].name
          );
        }
      }
    } catch {
      message.error("please upload all requier data", 5);
      main = new FormData();
      setCurrent(0);
      return;
    }
    const nf = [];
    Object.keys(frameworks).map((key) => {
      frameworks[key].map((f) => nf.push(f));
    });
    console.log(nf);

    data = {
      name: productDetails.name,
      short_describtion: productDetails.short_describtion,
      describtion: productDetails.describtion,
      catigory: productDetails.catigory,
      sub_catigory: productDetails.subcatigory,
      featurs: productDetails.features,
      demo_url: productDetails.demo_url,
      test_apk: productDetails.test_apk,
      test_ios: productDetails.test_ios,
      youtube_url: productDetails.youtube_url,
      // size: Math.ceil(zip_file.size / 1024 / 1024),
      size: itemSize.current.value,
      price: itemPrice.current.value,
      file_url: fileUrl.current.props.value,
      file_types,
      frameworks: nf,
    };

    if (query.item) {
      axiosFetchInstance
        .put(`/update-item/${query.item}/`, data)
        .then((res) => {
          axiosFetchInstance
            .put(`/update-item/${query.item}/`, main)
            .then((res) => {
              console.log(res.data);
              message.success("item updated", 3);
              setTimeout(
                () => (window.location.href = "/dashboard/myitems"),
                1000
              );
            })
            .catch((error) => {
              handleUnauthorized(error);
            });
        })
        .catch((error) => {
          error.response.status === 401 || !error.response.status
            ? handleUnauthorized(error)
            : (main = new FormData());
          message.error("please fill in all requierd fields", 5);
          setCurrent(0);
        });
    } else {
      axiosFetchInstance
        .post("/add-item/", data)
        .then((res) => {
          axiosFetchInstance
            .put(`/update-item/${res.data.id}/`, main)
            .then((res) => {
              console.log(res.data);
              message.success("item added", 3);
              setTimeout(
                () => (window.location.href = "/dashboard/myitems"),
                1000
              );
            })
            .catch((error) => {
              handleUnauthorized(error);
            });
        })
        .catch((error) => {
          error.response.status === 401 || !error.response.status
            ? handleUnauthorized(error)
            : console.log(error.response);
          main = new FormData();
          message.error("please fill in all requierd fields", 5);
          setCurrent(0);
        });
    }
  };

  const handleSteps = (move) => {
    if (move === "next") {
      if (current === 0) {
        console.log(itemName.current);
        const data = {
          name: itemName.current.props.value,
          short_describtion: itemShortDesc.current.props.value,
          catigory,
          subcatigory,
          describtion: itemDesc.current.resizableTextArea.props.value,
          features: itemFeatures.current.resizableTextArea.props.value,
          demo_url: itemDemoUrl.current.props.value,
          test_apk: itemTestApk.current.props.value,
          test_ios: itemTestIos.current.props.value,
          youtube_url: itemYTurl.current.props.value,
        };
        console.log(data);
        setProductDetails(data);
      }
      if (
        catigory === "" ||
        subcatigory === "" ||
        file_types === "" ||
        frameworks.length < 1
      ) {
        message.error("please fill all fields", 5);
        return;
      }
      setCurrent(current + 1);
      console.log(frameworks);
    } else setCurrent(current - 1);
  };
  //////////////  screens upload //////////////
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleCancel = () => setPrevVisible(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPrevImg(file.url || file.preview);
    setPrevVisible(true);
    setPrevTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
  };

  const handleChangeList = (info) => {
    SetFilelist(info.fileList);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );
  //////////////  screens upload //////////////

  ////////////// Icon & Preview /////////////

  ////////////// Icon & Preview /////////////

  //////// Select Options //////////
  const catigoryChange = (value) => {
    axiosFetchInstance
      .get(`/options/${value}/`)
      .then((res) => {
        console.log(res.data);
        setSubOptions(res.data.subcatigories);
        setFwOptions(res.data.framework_types);
        setFileOptions(res.data.file_types);
      })
      .catch((error) => {
        error.response.status === 401 || !error.response.status
          ? handleUnauthorized(error)
          : console.log(error.response);
      });
    setCatigory(value);
  };
  const subCatigoryChange = (value) => {
    setSubcatigory(value);
  };
  //////// Select Options //////////

  ////////// Checkbox Groups /////////

  const handleFiles = (values) => {
    setFile_types(values);
  };
  const handleFW = (values) => {
    console.log(values);
    setFrameworks(values);
  };
  ////////// Checkbox Groups /////////

  const steps = [
    {
      title: "Product details",
      content: (
        <Form initialValues={initialValues} layout="vertical" form={form}>
          <Form.Item name="name" label="Name">
            <Input required ref={itemName} placeholder="Name" />
          </Form.Item>
          <Form.Item
            name="short_desc"
            label="Short Describtion (Max 80 Characters)"
          >
            <Input
              required
              ref={itemShortDesc}
              placeholder="Short Describtion"
            />
          </Form.Item>
          <Form.Item name="catigory" label="Catigory">
            <Select
              required
              placeholder="Catigory..."
              style={{ width: "100%" }}
              onChange={catigoryChange}
            >
              {catigoriesOptions.map((c) => {
                return (
                  <Option key={c.id} value={c.id}>
                    {c.name}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item name="subcatigory" label="Subcatigory">
            <Select
              required
              disabled={subsOptions.length ? false : true}
              placeholder="subcatigory..."
              style={{ width: "100%" }}
              onChange={subCatigoryChange}
            >
              {subsOptions.map((s) => {
                return (
                  <Option key={s.id} value={s.id}>
                    {s.name}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Title level={5}>Frameworks</Title>
          {fwOptions.length > 0 &&
            fwOptions.map((type, n) => {
              return (
                <Form.Item name={type.name} key={n} label={type.name}>
                  <Checkbox.Group
                    required
                    key={n + 1}
                    options={type.frameworks.map((f) => {
                      return { label: f.name, value: f.id };
                    })}
                    onChange={(value) => {
                      console.log(frameworks);
                      setFrameworks({ ...frameworks, [type.name]: value });
                    }}
                  />
                </Form.Item>
              );
            })}

          <Form.Item name="file_types" label="Files Included">
            <Checkbox.Group
              required
              options={fileOptions.map((f) => {
                return { label: f.name, value: f.id };
              })}
              onChange={handleFiles}
            />
          </Form.Item>
          <Form.Item name="desc" label="Describtion">
            <TextArea required ref={itemDesc} placeholder="Describtion" />
          </Form.Item>
          <Form.Item name="features" label="Features">
            <TextArea required ref={itemFeatures} placeholder="Features" />
          </Form.Item>
          <Form.Item
            name="demo_url"
            label="Live Demo URL: (eg. your URL or Google Drive)"
          >
            <Input
              required
              ref={itemDemoUrl}
              placeholder="example https://google.com"
              addonBefore="http://"
              addonAfter=".com"
            />
          </Form.Item>
          <Form.Item name="test_apk" label="Test APK / Google Play Link:">
            <Input
              ref={itemTestApk}
              placeholder="example https://google.com"
              addonBefore="http://"
              addonAfter=".com"
            />
          </Form.Item>
          <Form.Item name="test_ios" label="iOS Link: (optional)">
            <Input
              ref={itemTestIos}
              placeholder="example https://google.com"
              addonBefore="http://"
              addonAfter=".com"
            />
          </Form.Item>
          <Form.Item name="youtube_url" label="YouTube URL: (optional)">
            <Input
              ref={itemYTurl}
              placeholder="example https://google.com"
              addonBefore="http://"
              addonAfter=".com"
            />
          </Form.Item>
        </Form>
      ),
    },
    {
      title: "Image Assest",
      content: (
        <>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-evenly",
              padding: "1rem 0",
            }}
          >
            <div className="dragger">
              <Dragger
                beforeUpload={() => false}
                onChange={(info) => setIcon(info.file)}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to upload icon
                </p>
                <p className="ant-upload-hint">Icon Image: * (size: 200x200)</p>
              </Dragger>
            </div>
            <div className="dragger">
              <Dragger
                beforeUpload={() => false}
                onChange={(info) => setPreview(info.file)}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to upload image
                </p>
                <p className="ant-upload-hint">
                  Preview Image: * (size 590x300)
                </p>
              </Dragger>
            </div>
          </div>
          {!query.item && (
            <div style={{ padding: "1rem" }}>
              <Upload
                beforeUpload={() => false}
                listType="picture-card"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChangeList}
              >
                {fileList.length >= 8 ? null : uploadButton}
              </Upload>
              <Modal
                visible={pervVisible}
                title={pervTitle}
                footer={null}
                onCancel={handleCancel}
              >
                <img alt="example" style={{ width: "100%" }} src={prevImg} />
              </Modal>
            </div>
          )}
        </>
      ),
    },
    {
      title: "Files & Pricing",
      content: (
        <>
          {/* <Dragger
            beforeUpload={() => false}
            onChange={(info) => setZip_file(info.file)}
            style={{ padding: "0 0.5rem" }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to upload zip</p>
            <p className="ant-upload-hint">.zip (Only)</p>
          </Dragger> */}
          <Form
            initialValues={initialValues}
            style={{ padding: "1rem 0" }}
            form={form}
            layout="vertical"
          >
            <Form.Item name="file_url" label="Source Download Url">
              <Input
                ref={fileUrl}
                placeholder="example https://google.com"
                addonBefore="http://"
                addonAfter=".com"
              />
            </Form.Item>
            <Form.Item name="size" label="File size: (size of .ZIP file in MB)">
              <InputNumber
                required
                style={{ width: "100%" }}
                ref={itemSize}
                placeholder="File Size"
                // placeholder={
                //   zip_file
                //     ? `${Math.ceil(zip_file.size / 1024 / 1024)} MB`
                //     : "File Size"
                // }
              />
            </Form.Item>

            <Form.Item name="price" label="Price: (Single Licence)">
              <InputNumber
                addonBefore="$"
                required
                ref={itemPrice}
                style={{ width: "100%" }}
              />
            </Form.Item>
            {/* <Form.Item required  label='Price: (Multiple Licence)'>
                            <InputNumber style={{width:'100%'}} />
                        </Form.Item> */}
          </Form>
        </>
      ),
    },
  ];
  return (
    <>
      <Title level={2}>{query.item ? "Edit Item" : "New Item"}</Title>
      {initialValues && (
        <div style={{ backgroundColor: "#fff", padding: "1.5rem" }}>
          <Steps current={current}>
            {steps.map((item) => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
          <div className="steps-content" style={{ padding: "1rem 0" }}>
            {steps[current].content}
          </div>
          <div className="steps-action">
            {current < steps.length - 1 && (
              <Button
                htmlType="submit"
                type="primary"
                onClick={() => handleSteps("next")}
              >
                Next
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button type="primary" onClick={addItem}>
                Done
              </Button>
            )}
            {current > 0 && (
              <Button
                type="dashed"
                style={{ margin: "0 8px" }}
                onClick={() => handleSteps("prev")}
              >
                Previous
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UploadItem;
