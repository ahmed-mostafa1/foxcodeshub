import * as React from 'react'
import { axiosInstance } from '../Axios'
import { Layout, Form, Input, Button, message } from 'antd'
const { Content } = Layout

const ResetPW = () => {
    const [form] = Form.useForm()
    const handleFinish = values => {
        axiosInstance.post('/account/password-reset-request/', {
            "email":values.email,
            "redirect_url":"https://foxsourcecode.com/password-reset-confirm"
        })
        .then(res => {
            message.success('an email sent check your mail inbox you will be redirect to home')
            setTimeout(()=> window.location.href = '/', 1000)
        })
        .catch(error => {
            // message.error(error.response.data.error, 5)
            console.log(error.response)
        })
    }
  return (
    <Content className='main-content'>
        <div>
            <Form onFinish={handleFinish} form={form} layout='vertical'>
                <Form.Item
                name='email'
                label='Recovery Email'
                rules={[
                    {
                      type: 'email',
                      message: 'The input is not valid E-mail!',
                    },
                    {
                      required: true,
                      message: 'Please input your E-mail!',
                    },
                  ]}>
                      <Input placeholder='Enter your recovery email' />
                </Form.Item>
                <Form.Item>
                    <Button type='primary' htmlType='submit' block>Request email</Button>
                </Form.Item>
            </Form>                 
        </div>
    </Content>
  )
}

export default ResetPW