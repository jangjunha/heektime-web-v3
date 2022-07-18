import { FallbackRender, showReportDialog } from '@sentry/react';
import classNames from 'classnames';
import React, { useContext } from 'react';

import Layout from '../../components/Layout';
import { LoginContext } from '../../contexts/login';
import styles from './index.module.scss';

const ErrorPage = ({
  error,
  eventId,
  resetError,
}: Parameters<FallbackRender>[0]): React.ReactElement => {
  const [authUser, user] = useContext(LoginContext);
  const handleClickReport = (): void => {
    showReportDialog({
      user: { email: authUser?.email ?? undefined, name: user?.username },
      title: '문제가 발생했습니다.',
      subtitle: '문제가 발생한 상황을 설명해주시면 고치는 데 도움이 됩니다.',
      subtitle2: '',
      labelName: '이름',
      labelEmail: '이메일',
      labelComments: '메시지',
      labelClose: '닫기',
      labelSubmit: '보내기',
      errorFormEntry:
        '유효하지 않은 필드가 있습니다. 수정하고 다시 시도해주세요.',
      successMessage: '피드백이 전송됐습니다. 감사합니다.',
    });
  };
  return (
    <Layout>
      <div className={styles.container}>
        <h1>문제가 발생했습니다.</h1>
        <p className={styles.muted}>오류 ID: {eventId}</p>
        <p>
          불편을 드려 죄송합니다. 아래 '문제 보고하기' 버튼을 눌러 문제가 발생한
          상황을 설명해주시면 고치는 데 도움이 됩니다.
        </p>
        <button
          className={classNames(styles.primary, styles.full)}
          onClick={handleClickReport}
        >
          문제 보고하기
        </button>
        <button
          className={classNames(styles.primary, styles.full)}
          onClick={resetError}
        >
          돌아가기
        </button>
      </div>
    </Layout>
  );
};

export default ErrorPage;
