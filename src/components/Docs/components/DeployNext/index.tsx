import { useLanguage } from '@/utils/useLanguage';
import SDKImg from '@/assets/image/screenshot/page-spy-sdks.png';
import { Link } from 'react-router-dom';

const content = {
  zh: {
    text0: (
      <p>
        PageSpy
        服务端支持通过配置文件管理服务端行为，包括运行端口、多实例部署、跨域配置、日志数据配置、数据库配置等，详情请参考{' '}
        <Link to="./server-configuration">服务端配置</Link>。
      </p>
    ),
    text1: (
      <p>
        部署完成后，需要在客户端引入对应的 SDK。SDK
        负责收集客户端程序的运行时信息，并自动将收集的信息发送到已部署的 PageSpy
        服务，再由服务端转发到调试端。前往 <Link to="./browser">快速上手</Link>{' '}
        章节查看详情。
      </p>
    ),
  },
  en: {
    text0: (
      <p>
        PageSpy server supports managing server behavior through configuration
        files, including running port, multi-instance deployment, cross-domain
        configuration, log data configuration, database configuration, etc. For
        details, please refer to{' '}
        <Link to="./server-configuration">Server Configuration</Link>.
      </p>
    ),
    text1: (
      <p>
        After deployment, you need to integrate the appropriate SDK into the
        client. The SDK is responsible for collecting runtime information from
        the client application and automatically sending the collected data to
        the deployed PageSpy service, which then forwards it to the debugging
        endpoint. Go to the <Link to="./browser">Quick Start</Link> section for
        more details.
      </p>
    ),
  },
  ja: {
    text0: (
      <p>
        PageSpy
        サーバーは、設定ファイルを通じてサーバーの動作を管理できます。これには、実行ポート、マルチインスタンスデプロイ、クロスドメイン設定、ログデータ設定、データベース設定などが含まれます。詳細については、
        <Link to="./server-configuration">サーバー設定</Link>
        を参照してください。
      </p>
    ),
    text1: (
      <p>
        デプロイ完了後、クライアント側で対応する SDK
        を導入する必要があります。SDK
        はクライアントプログラムの実行時情報を収集し、収集した情報を自動的にデプロイ済みの
        PageSpy サービスに送信し、サーバー側からデバッグ端末に転送します。
        <Link to="./browser">クイックスタート</Link>セクションをご覧ください。
      </p>
    ),
  },
  ko: {
    text0: (
      <p>
        PageSpy 서버는 구성 파일을 통해 실행 포트, 멀티 인스턴스 배포, 크로스
        도메인 설정, 로그 데이터 설정, 데이터베이스 설정 등 서버 동작을 관리할
        수 있습니다. 자세한 내용은{' '}
        <Link to="./server-configuration">서버 구성</Link>을 참조하세요.
      </p>
    ),
    text1: (
      <p>
        배포 후 클라이언트에 해당 SDK를 도입해야 합니다. SDK는 클라이언트
        프로그램의 런타임 정보를 수집하여 배포된 PageSpy 서비스로 자동 전송하고,
        서버 측에서 디버깅 엔드포인트로 전달합니다.{' '}
        <Link to="./browser">빠른 시작</Link> 섹션을 참조하세요.
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
