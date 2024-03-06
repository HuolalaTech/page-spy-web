import { MethodType } from '@huolala-tech/page-spy-types/lib/mp-page';
import { Button, Form, Input, Popover } from 'antd';
import React from 'react';

type Props = {
  method: MethodType;
  route: string;
  sendUnicast: (type: SpyMessage.InteractiveType, data: any) => void;
};

const MethodCall = (props: Props) => {
  const { method, route, sendUnicast } = props;

  const callMethod = (method: string, params: any[] = []) => {
    sendUnicast('mp-page-method-call', {
      page: route,
      method,
      params,
    });
  };
  return (
    <div>
      <Popover
        trigger={'click'}
        content={
          <div>
            <div>参数：</div>
            <Form>
              {method.params?.map((param, i) => {
                return (
                  <Form.Item key={i} label={param}>
                    <Input />
                  </Form.Item>
                );
              })}
            </Form>
          </div>
        }
      >
        <Button
          size="small"
          onClickCapture={(e) => {
            if (!method.params.length) {
              callMethod(method.name);
              e.stopPropagation();
            }
          }}
        >
          Call
        </Button>
      </Popover>
    </div>
  );
};

export default MethodCall;
