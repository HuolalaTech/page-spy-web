import { CodeBlock } from '@/components/CodeBlock';
import './index.less';
import { Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

export const ReplayLabs = () => {
  return (
    <div className="replay-labs">
      <h1 style={{ textAlign: 'right' }}>欢迎来到回放实验室！</h1>
      <div className="statement">
        您的日志数据不会经过服务器传输、完全在您本地客户端运行，可放心使用
      </div>
      <h2 style={{ marginTop: 150 }}>一行代码，</h2>
      <h2>在项目中接入 PageSpy</h2>
      <CodeBlock code='<script src="https://pagespy.org/plugin/whole-bundle/index.min.js" crossorigin="anonymous"></script>' />

      <h2 style={{ marginTop: '50vh' }}>接入之后，</h2>
      <h2>页面会出现右下角所示的 &quot;问题反馈&quot; 组件</h2>
      <h2>试着玩一下～</h2>

      <h2 style={{ marginTop: '50vh' }}>一切就绪，</h2>
      <h2>点击下方按钮，上传导出的文件</h2>
      <Upload
        accept=".json"
        maxCount={1}
        customRequest={async (file) => {
          const url = URL.createObjectURL(file.file as File);
          const replayURL = `https://pagespy.org/#/replay?url=${url}#Console`;
          setTimeout(() => {
            window.open(replayURL);
          }, 50);
          return null;
        }}
        itemRender={() => null}
      >
        <Button
          size="large"
          icon={<UploadOutlined />}
          style={{ marginTop: 40 }}
        >
          上传文件
        </Button>
      </Upload>

      <h2 style={{ marginTop: '50vh' }}>开发者，祝你好运！</h2>
      <h2>Talk is cheap, the code is shown.</h2>
    </div>
  );
};
