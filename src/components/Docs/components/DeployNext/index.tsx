import { useLanguage } from '@/utils/useLanguage';
import SDKImg from '@/assets/image/screenshot/page-spy-sdks.png';

export const DeployNext = () => {
  const [lang] = useLanguage();

  if (lang !== 'zh') {
    return (
      <>
        <p>
          After deployment, you need to integrate the appropriate SDK into the
          client. Go to the &quot;Quick Start&quot; section for more details.
        </p>
        <p>
          The SDK&apos;s role is to collect runtime information from the client
          application and automatically send the collected data to the deployed
          PageSpy service, which then forwards it to the debugging endpoint.
        </p>
        <img src={SDKImg} />
      </>
    );
  }
  return (
    <>
      <p>部署完成后，需要在客户端引入对应的 SDK，前往「快速上手」章节查看。 </p>
      <p>
        SDK
        的功能是负责收集客户端程序的运行时信息，并自动将收集的信息发送到上面部署的
        PageSpy 服务、再由其转发到调试端。
      </p>
      <img src={SDKImg} />
    </>
  );
};
