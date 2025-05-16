import { useLanguage } from '@/utils/useLanguage';
import SDKImg from '@/assets/image/screenshot/page-spy-sdks.png';
import { Link } from 'react-router-dom';

const content = {
  zh: {
    text0: (
      <p>
        PageSpy 支持在启动服务时设置密码以保护数据安全，详情请参考{' '}
        <Link to="/docs/faq#security">安全认证</Link>。
      </p>
    ),
    text1: (
      <p>
        部署完成后，需要在客户端引入对应的 SDK。SDK
        的功能是负责收集客户端程序的运行时信息，并自动将收集的信息发送到上面部署的
        PageSpy 服务、再由其转发到调试端，前往「快速上手」章节查看详情。
      </p>
    ),
  },
  en: {
    text0: (
      <p>
        PageSpy supports setting a password during service startup to protect
        data security. For details, please refer to{' '}
        <Link to="/docs/faq#security">Security Authentication</Link>.
      </p>
    ),
    text1: (
      <p>
        After deployment, you need to integrate the appropriate SDK into the
        client. The SDK&apos;s role is to collect runtime information from the
        client application and automatically send the collected data to the
        deployed PageSpy service, which then forwards it to the debugging
        endpoint. Go to the &quot;Quick Start&quot; section for more details.
      </p>
    ),
  },
  ja: {
    text0: (
      <p>
        PageSpy
        はサービス起動時にパスワードを設定してデータのセキュリティを保護できます。詳細は{' '}
        <Link to="/docs/faq#security">安全認証</Link> を参照してください。
      </p>
    ),
    text1: (
      <p>
        デプロイ完了後、クライアント側で対応する SDK
        を導入する必要があります。SDK
        の機能は、クライアントプログラムの実行時情報を収集し、収集した情報を自動的に上記でデプロイした
        PageSpy
        サービスに送信し、デバッグ端末に転送することです。「クイックスタート」セクションをご覧ください。
      </p>
    ),
  },
  ko: {
    text0: (
      <p>
        PageSpy는 서비스 시작 시 비밀번호를 설정하여 데이터 보안을 보호할 수
        있습니다. 자세한 내용은 <Link to="/docs/faq#security">보안 인증</Link>을
        참조하세요.
      </p>
    ),
    text1: (
      <p>
        배포가 완료된 후에는 클라이언트에 해당 SDK를 도입해야 합니다. SDK의
        기능은 클라이언트 프로그램의 런타임 정보를 수집하고, 수집된 정보를
        위에서 배포한 PageSpy 서비스로 자동 전송한 다음 디버깅 단말기로 전달하는
        것입니다. &apos;빠른 시작&apos; 섹션을 참조하세요.
      </p>
    ),
  },
};

export const DeployNext = () => {
  const [lang] = useLanguage();

  const currentContent = content[lang as keyof typeof content] || content.en;

  return (
    <>
      {currentContent.text0}
      {currentContent.text1}
      <a href={SDKImg} target="_blank">
        <img src={SDKImg} />
      </a>
    </>
  );
};
