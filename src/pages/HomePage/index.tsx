import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import Layout from '../../components/Layout';
import { LoginContext } from '../../contexts/login';
import styles from './index.module.scss';

const HomePage = (): React.ReactElement => {
  const login = useContext(LoginContext);
  return (
    <Layout>
      <div className={styles.hello}>
        <h1>HeekTime</h1>

        {login !== null && (
          <div className={styles.userSection}>
            <p className={styles.welcome}>
              {login.user.username}님 환영합니다!
            </p>
            <br />
            <Link
              to={`/user/${login.user.username}`}
              className={styles.primary}
            >
              내 시간표 보러가기&nbsp;&nbsp;&nbsp;〉
            </Link>
          </div>
        )}

        <section>
          <p>HeekTime으로 편리하게 다음학기 시간표를 짜 보세요.</p>
          <img
            src="/sample-screenshot.png"
            alt="스크린샷"
            className={styles.screenshot}
          />
        </section>

        <section>
          <p>
            친구의 시간표도 볼 수 있어요.&nbsp;
            <Link to="/user/jangjunha/timetable/3cfb7a952fb544f1ae3e2194f7a141af/">
              제 시간표를 확인해보세요!
            </Link>
          </p>
        </section>

        <section>
          <p>모바일에서도 사용할 수 있습니다. (iOS만 지원)</p>
          <a
            href="https://itunes.apple.com/mr/app/heektime-hiigtaim/id1134379996"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://s3.ap-northeast-2.amazonaws.com/heektime-resource/images/app_store.svg"
              alt="Available on App Store"
            />
          </a>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;
