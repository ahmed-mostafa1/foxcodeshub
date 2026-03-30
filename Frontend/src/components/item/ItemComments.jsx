import * as React from "react";
import { Comment, Tooltip, Form, Input, Avatar, Button, message } from "antd";
import { Link } from "react-router-dom";
import moment from "moment";
import { ItemContext } from "../../pages/ItemPage";
import { axiosFetchInstance, handleUnauthorized } from "../../Axios";
import { UserContext } from "../../App";
const { TextArea } = Input;

const ItemComments = () => {
  const [submitting, setSubmitting] = React.useState(false);
  const [form] = Form.useForm();
  const { item } = React.useContext(ItemContext);
  const [comments, setComments] = React.useState([]);

  React.useEffect(() => {
    setComments(item.comments);
  }, [item]);
  const handleComment = (values) => {
    const data = JSON.stringify({
      item: item.id,
      content: values.content,
    });
    axiosFetchInstance
      .post("/create-comment/", data)
      .then((res) => {
        console.log(res.data);
        setComments([...comments, res.data]);
        form.resetFields();
      })
      .catch((error) => {
        !error.response.status || error.response.status === 401
          ? handleUnauthorized(error)
          : // : console.log(error.response);
            message.error(error.response.data.error);
      });
  };
  return (
    <div style={{ backgroundColor: "#fff", padding: "1rem" }}>
      {comments.length > 0 ? (
        comments.map((comment) => {
          return (
            <Comment
              key={comment.id}
              author={<Link to="">{comment.user}</Link>}
              content={<p>{comment.content}</p>}
              datetime={
                <Tooltip title={moment().format("YYYY-MM-DD HH:mm:ss")}>
                  <span>{moment().from(comment.date)}</span>
                </Tooltip>
              }
            />
          );
        })
      ) : (
        <Comment content={<p>No Comments yet</p>} />
      )}
      <div>
        <Form onFinish={handleComment} form={form} layout="vertiacal">
          <Form.Item
            name="content"
            rules={[
              {
                required: true,
                message: "Please input your Review",
              },
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" loading={submitting} type="primary">
              Add Comment
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ItemComments;
