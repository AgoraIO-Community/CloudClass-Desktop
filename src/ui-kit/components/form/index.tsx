import Form, { FormInstance, FormItemProps, FormProps } from 'antd/lib/form';
import { FC, PropsWithChildren, ReactElement } from 'react';
import './index.css';
export type AFormItemProps = Pick<
  FormItemProps,
  'className' | 'label' | 'name' | 'required' | 'rules'
>;
export const AFormItem: FC<AFormItemProps> = (props) => {
  return <Form.Item {...props} />;
};

export type AFormProps<T = any> = Pick<
  FormProps<T>,
  | 'className'
  | 'name'
  | 'form'
  | 'initialValues'
  | 'onFieldsChange'
  | 'onFinish'
  | 'onValuesChange'
  | 'onFinishFailed'
  | 'layout'
  | 'labelCol'
  | 'wrapperCol'
  | 'onValuesChange'
>;

export function AForm<T = any>({
  className = '',
  ...props
}: PropsWithChildren<AFormProps<T>>): ReactElement {
  return <Form<T> className={`fcr-theme ${className}`} {...props} />;
}

export const useAForm = Form.useForm;

export type AFormInstance = FormInstance;
