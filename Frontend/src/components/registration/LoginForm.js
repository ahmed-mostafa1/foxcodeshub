import * as React from 'react';
import './RegisterForm.css';
import { Form, Input, Button, Checkbox, Layout, message, Alert} from 'antd';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../../Axios';
import { UserContext } from '../../App';

const { Content } = Layout

function LoginForm() {

  const [form]=Form.useForm();
  const [loginData, setLoginData] = React.useState({})
  const { client_id, client_secret } = React.useContext(UserContext)


  const formItemLayout = {
    labelCol:{
      xs:{
        span:24
      },
      sm:{
        span:8
      }
    
    },
    wrapperCol:{
      xs:{
        span:24
      },
      sm:{
        span:16
      },
      
    }
  }
  const tailFormItemLayout ={
    wrapperCol:{
      xs:{
        span:24,
        offset:0
      },
      sm:{
        span:16,
        offset:8
      }
    }
  }

  const onFinish =(values)=>{
    const data = JSON.stringify({
      username: values.email.toLowerCase(),
      password: values.password,
      client_id,
      client_secret,
      grant_type: "password"
    })
    // console.log(data)
    axiosInstance.post('/account/auth/token/', data)
    .then(res => {
      localStorage.setItem('foxCodes_accessToken', res.data.access_token)
      localStorage.setItem('foxCodes_refreshToken', res.data.refresh_token)
      window.location.href = '/'
    })
    .catch(error => {
      // console.log(error.response)
      error.response.data.error_description === "Invalid credentials given." &&
      message.error('invalid email or password', 8)
    })

  }
  return (
    <Content style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
    <div className='form-container'>
    <Form 
    {...formItemLayout} 
    form={form} 
    name='login' 
    onFinish={onFinish} 
    style={{backgroundColor:'#fff', padding:'3rem'}}
    scrollToFirstError
    >

      <Form.Item 
      name="email" 
      label="E-mail" 
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
        <Input/>
      </Form.Item>
      <Form.Item 
      name="password" 
      label="Password" 
      rules={[
        {
          required: true,
          message: 'Please input your password!',
        },
      ]}
      hasFeedback >
        <Input.Password/>
      </Form.Item>
      <Link to='/password-reset'>Forgot your password?</Link>
        <Form.Item {...tailFormItemLayout} style={{margin:'1rem 0 0'}}>
          <Button className='btn-sub' type='primary' htmlType='submit' >Login</Button>
        </Form.Item>
    </Form>
    </div>
    </Content>
  )
}

export default LoginForm
