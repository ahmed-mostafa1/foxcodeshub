import * as React from "react";
import { Comment, Tooltip, Form, Input, Avatar, Button, message } from "antd";
import { Link } from "react-router-dom";
import moment from "moment";
import { ItemContext } from "../../pages/ItemPage";
import { UserContext } from "../../App";
import { axiosFetchInstance, handleUnauthorized } from "../../Axios";
const { TextArea } = Input;

const ItemReviews = (props) => {
  const [submitting, setSubmitting] = React.useState(false);
  const [form] = Form.useForm();
  const { item } = React.useContext(ItemContext);
  const { authedUser } = React.useContext(UserContext);
  const [reviews, setReviews] = React.useState([]);

  React.useEffect(() => {
    setReviews(item.reviews);
  }, [item]);

  const handleReview = (values) => {
    const data = JSON.stringify({
      item: item.id,
      content: values.content,
    });
    axiosFetchInstance
      .post("/create-review/", data)
      .then((res) => {
        console.log(res.data);
        setReviews([...reviews, res.data]);
        form.resetFields();
      })
      .catch((error) => {
        error.response.status === 401 || !error.response.status
          ? handleUnauthorized(error)
          : // : console.log(error.response);
            message.error(error.response.data.error);
      });
  };
  return (
    <div style={{ backgroundColor: "#fff", padding: "1rem" }}>
      {reviews.length > 0 ? (
        reviews.map((review) => {
          return (
            <Comment
              key={review.id}
              author={<Link to="">{review.user}</Link>}
              content={<p>{review.content}</p>}
              datetime={
                <Tooltip title={moment().format("YYYY-MM-DD HH:mm:ss")}>
                  <span>{moment().from(review.date)}</span>
                </Tooltip>
              }
            />
          );
        })
      ) : (
        <Comment content={<p>No reviews yet</p>} />
      )}
      {authedUser.username !== item.seller && (
        <div>
          <Form onFinish={handleReview} form={form} layout="vertiacal">
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
                Add Review
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}
    </div>
  );
};

export default ItemReviews;
