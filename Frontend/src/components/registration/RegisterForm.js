import React from 'react';
import './RegisterForm.css';
import { Form, Input, Button, Checkbox, Layout, message, Alert} from 'antd';
import { axiosInstance } from '../../Axios'

const { Content } = Layout
function RegisterForm() {
  const [form]=Form.useForm();
  const [errors, setErrors] = React.useState([])

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
    const user = JSON.stringify({
      email:values.email.toLowerCase(),
      username:values.username,
      fullname:values.fullname,
      password:values.password
    })
    axiosInstance.post('/account/signup/', user)
    .then(res => {
      // console.log(res.data)
      if (res.data.access_token) {
        localStorage.setItem('foxCodes_accessToken', res.data.access_token)
        localStorage.setItem('foxCodes_refreshToken', res.data.refresh_token)
        window.location.href = '/'
      }
      // else {
      //   // window.location.href = '/login'
      //   console.log(res.data)
      // }
    })
    .catch(error => {
      setErrors([])
      for (const key in error.response.data) {
        setErrors([...errors, `${key}: ${error.response.data[key][0]}`])
        
      }
    })
  }
  return (
    <Content style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
    <div className='form-container'>
    <Form 
    {...formItemLayout} 
    form={form} 
    name='register' 
    onFinish={onFinish} 
    style={{backgroundColor:'#fff', padding:'3rem'}}
    scrollToFirstError
    >
        {errors &&
        errors.map((err, n) => {
          return <Alert key={n} style={{margin:'0.5rem 0'}} message={err}type="error" />
        })}
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
        <Input required/>
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
        <Input.Password required/>
      </Form.Item>
      <Form.Item
       name="re-password" label="Re-password" 
       dependencies={["password"]}

      hasFeedback
      rules={[
        {
          required: true,
          message: 'Please confirm your password!',
        },({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue('password') === value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error('The two passwords that you entered do not match!'));
          },
        }),
      ]}
      >
        <Input.Password required/>
      </Form.Item>
      <Form.Item 
      name="username" 
      label="User Name" 
      rules={[
        { required: true,
          message: 'Please input your user name!', 
          whitespace: true }]}
      >
        <Input required/>
      </Form.Item>
      
      <Form.Item 
      name="fullname" 
      label="Full Name" 
      rules={[
        { required: true,
          message: 'Please input your Name!' }
        ]}
        >
          <Input required/>
      </Form.Item>
      <div>
        <Form.Item 
        name="agreement" 
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value ? Promise.resolve() : Promise.reject(new Error('Should accept agreement')),
          },
        ]} 
        {...tailFormItemLayout}>
          <Checkbox>I have read the <a href='#'>agreement</a> </Checkbox>
        </Form.Item>
        <Form.Item {...tailFormItemLayout} style={{margin:0}}>
          <Button className='btn-sub' type='primary' htmlType='submit' >Register</Button>
        </Form.Item>
      </div>
    </Form>
    </div>
    </Content>
  )
}

export default RegisterForm
