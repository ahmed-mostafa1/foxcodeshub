import * as React from 'react'
import { axiosInstance } from '../Axios'
import { Layout, Form, Input, Button, message } from 'antd'
import QueryString from 'query-string'
import { useLocation } from 'react-router-dom'
const { Content } = Layout

const ResetPwConfirm = () => {
    const [form] = Form.useForm()
    const location = useLocation()
    const query = QueryString.parse(location.search)

    const handleFinish = values => {
        if (query.token_valid === 'false'){
          message.error('this link has been expired')
          setTimeout(()=> window.location.href ='/', 2000)
        }else{
            const uid64 = query.uid64
            const token = query.token
            const data = JSON.stringify({
                password:values.new_password,
                uid64,
                token
            })
            axiosInstance.put('/account/password-reset-confirm/', data)
            .then(res => {
                if (res.data.success){
                message.success(res.data.success)
                setTimeout(()=> window.location.href = '/login', 1000)   
                }else{
                  for (const key in res.data) {
                    message.error(`${key}: ${res.data[key][0]}`)
                    
                  }
                }
            })
            .catch(error => {
                error.response.status === 401 &&
                message.error('link has been expired request new one')
                setTimeout(()=> window.location.href = '/', 2000)
                // console.log(error)
            })
        }
        

        

    }
  return (
    <Content className='main-content'>
    <div>
        <Form onFinish={handleFinish} form={form} layout='vertical'>
            <Form.Item
            label='New Password'
            name="new_password" 
            rules={[
              {
                required: true,
                message: 'Please input your password!',
              },
            ]}
            hasFeedback >
                <Input.Password size='large' placeholder="New Password" />
            </Form.Item>
            <Form.Item
            label='Confirm Password'
            name="re-password"
            dependencies={["new_password"]}
           hasFeedback
           rules={[
             {
               required: true,
               message: 'Please confirm your password!',
             },({ getFieldValue }) => ({
               validator(_, value) {
                 if (!value || getFieldValue('new_password') === value) {
                   return Promise.resolve();
                 }
                 return Promise.reject(new Error('The two passwords that you entered do not match!'));
               },
             }),
           ]}>
                <Input.Password size='large' placeholder="Re-password" />
            </Form.Item>
            <Form.Item>
                <Button type='primary' htmlType='submit' block>Change Password</Button>
            </Form.Item>
        </Form>                 
    </div>
</Content>
  )
}

export default ResetPwConfirm