import React from 'react';

import Layout from '../../components/Layout';
import style from './index.module.scss';

const PolicyPage = (): React.ReactElement => (
  <Layout>
    <div className={style.container}>
      <h1>HeekTime 정책</h1>

      <section>
        <p>HeekTime은 서비스 제공을 위해 다음 정보를 수집합니다.</p>
        <ul>
          <li>
            <p>이메일 또는 사용자 이름 (로그인 ID)</p>
          </li>
          <li>
            <p>비밀번호</p>
          </li>
          <li>
            <p>닉네임</p>
          </li>
          <li>
            <p>IP주소를 포함한 접속 기록</p>
          </li>
        </ul>
        <p>비밀번호는 단방향 암호화하여 저장합니다.</p>
      </section>
      <section>
        <p>
          HeekTime은 서비스 제공 및 이용 분석을 위해 다음 서비스를 사용하며,
          다음 서비스는 기기 식별자(iOS 광고 식별자), 쿠키, 유사한 기술 등을
          통해 사용자에 대한 데이터를 수집합니다.
        </p>
        <ul>
          <li>
            <p>
              Firebase (
              <a
                href="https://firebase.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://firebase.google.com
              </a>
              )
            </p>
            <ul>
              <li>
                <p>Analytics</p>
              </li>
              <li>
                <p>Crashlytics</p>
              </li>
              <li>
                <p>Firestore</p>
              </li>
              <li>
                <p>Storage</p>
              </li>
            </ul>
          </li>
          <li>
            <p>
              Google Analytics (
              <a
                href="https://analytics.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://analytics.google.com
              </a>
              )
            </p>
          </li>
        </ul>
      </section>
      <section>
        <p>
          서비스에 대한 문의는{' '}
          <a href="mailto:heektime@heek.kr">heektime@heek.kr</a> 으로
          부탁드립니다.
        </p>
      </section>
    </div>
  </Layout>
);

export default PolicyPage;
