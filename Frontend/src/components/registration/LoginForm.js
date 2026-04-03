import * as React from 'react';
import './RegisterForm.css';
import axios from 'axios';
import { Form, Input, Button, Layout, message } from 'antd';
import { Link } from 'react-router-dom';
import { OAUTH_CLIENT_ID } from '../../config';


const { Content } = Layout;

function LoginForm() {
  const [form] = Form.useForm();

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 }
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 }
    }
  };

  const tailFormItemLayout = {
    wrapperCol: {
      xs: {
        span: 24,
        offset: 0
      },
      sm: {
        span: 16,
        offset: 8
      }
    }
  };

  const onFinish = (values) => {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', values.email.toLowerCase().trim());
    params.append('password', values.password);
    params.append('client_id', OAUTH_CLIENT_ID);
    axios.post(
      'https://api.foxcodeshub.com/api/account/auth/token/',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      }
    )
      .then((res) => {
        localStorage.setItem('foxCodes_accessToken', res.data.access_token);
        localStorage.setItem('foxCodes_refreshToken', res.data.refresh_token);
        window.location.href = '/';
      })
      .catch((error) => {
        if (error.response?.data?.error_description === "Invalid credentials given.") {
          message.error("invalid email or password", 8);
        } else {
          message.error("login failed", 8);
        }
      });
  };

  return (
    <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className='form-container'>
        <Form
          {...formItemLayout}
          form={form}
          name='login'
          onFinish={onFinish}
          style={{ backgroundColor: '#fff', padding: '3rem' }}
          scrollToFirstError
        >
          <Form.Item
            name='email'
            label='E-mail'
            rules={[
              {
                type: 'email',
                message: 'The input is not valid E-mail!',
              },
              {
                required: true,
                message: 'Please input your E-mail!',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name='password'
            label='Password'
            rules={[
              {
                required: true,
                message: 'Please input your password!',
              },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          <Link to='/password-reset'>Forgot your password?</Link>

          <Form.Item {...tailFormItemLayout} style={{ margin: '1rem 0 0' }}>
            <Button className='btn-sub' type='primary' htmlType='submit'>
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Content>
  );
}

export default LoginForm;