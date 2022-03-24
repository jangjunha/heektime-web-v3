import React from 'react';

import { MetaTag, Period, TypedLecture } from '../../types';
import { formatTimes } from '../../utils/time';
import Loading from '../Loading';
import styles from './index.module.scss';

export type AddButtonMode =
  | 'available'
  | 'adding'
  | 'already-added'
  | 'overlap'
  | 'hidden';

interface LectureDetailProps {
  lecture: TypedLecture;
  periods?: Period[];
  addButtonMode?: AddButtonMode;
  onClickAddButton?: () => void;
}

const getAddButtonText = (mode: AddButtonMode): React.ReactNode => {
  switch (mode) {
    case 'available':
      return '시간표에 추가';
    case 'adding':
      return <Loading inline />;
    case 'already-added':
      return '추가됨';
    case 'overlap':
      return '추가할 수 없음';
    case 'hidden':
      return '';
    default:
      ((_: never): void => {
        throw Error(`Unsupported mode ${mode}`);
      })(mode);
  }
};

const getAddButtonDisabled = (mode: AddButtonMode): boolean => {
  switch (mode) {
    case 'available':
      return false;
    case 'adding':
      return true;
    case 'already-added':
      return true;
    case 'overlap':
      return true;
    case 'hidden':
      return true;
    default:
      ((_: never): void => {
        throw Error(`Unsupported mode ${mode}`);
      })(mode);
  }
};

const LectureDetail = (props: LectureDetailProps): React.ReactElement => {
  const {
    lecture: typedLecture,
    periods,
    addButtonMode = 'hidden',
    onClickAddButton,
  } = props;
  const lecture = typedLecture.lecture;

  const itemIdentifier = lecture.identifier && (
    <div className={styles.detailItem} key="identifier">
      <dt>학수번호</dt>
      <dd>{lecture.identifier}</dd>
    </div>
  );
  const itemProfessor = lecture.professor && (
    <div className={styles.detailItem} key="professor">
      <dt>교수</dt>
      <dd>{lecture.professor}</dd>
    </div>
  );
  const itemCredit = lecture.credit && (
    <div className={styles.detailItem} key="credit">
      <dt>학점</dt>
      <dd>{lecture.credit}</dd>
    </div>
  );
  const times = lecture.times.map((time) => (
    <li key={[time.weekday, time.timeBegin, time.timeEnd, time.room].join('-')}>
      {[formatTimes([time], periods || []), time.room]
        .filter(Boolean)
        .join(' ')}
    </li>
  ));
  const itemTimes = lecture.times.length > 0 && (
    <div className={styles.detailItem} key="times">
      <dt>시간 및 강의실</dt>
      <dd>
        <ul className={styles.times}>{times}</ul>
      </dd>
    </div>
  );
  const itemCategory = lecture.category && lecture.category.length > 0 && (
    <div className={styles.detailItem} key="category">
      <dt>분류</dt>
      <dd>{lecture.category.join(' 〉 ')}</dd>
    </div>
  );
  const tags =
    lecture.metas &&
    lecture.metas
      .filter((meta): meta is MetaTag => meta.type === 'tag')
      .filter((tag) => Boolean(tag.name))
      .map((tag) => <li key={tag.name}>{tag.name}</li>);
  const itemMeta = (
    <div className={styles.detailItem} key="meta">
      <dt>기타</dt>
      <dd>
        <ul className={styles.tags}>{tags}</ul>
      </dd>
    </div>
  );
  const itemLink = typedLecture.type === 'master' && (
    <div className={styles.detailItem} key="link">
      <dt>더보기</dt>
      <dd>
        <a
          href={typedLecture.lecture.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          강의계획서
        </a>
      </dd>
    </div>
  );

  const items = [
    itemIdentifier,
    itemProfessor,
    itemCredit,
    itemTimes,
    itemCategory,
    itemMeta,
    itemLink,
  ].filter((x): x is JSX.Element => Boolean(x));

  const addButton = (
    <button
      className={styles.footerButton}
      onClick={onClickAddButton}
      disabled={getAddButtonDisabled(addButtonMode)}
    >
      {getAddButtonText(addButtonMode)}
    </button>
  );

  return (
    <div className={styles.container}>
      <h1>{lecture.title}</h1>
      <dl className={styles.details}>{items}</dl>
      {addButtonMode !== 'hidden' && addButton}
    </div>
  );
};

export default LectureDetail;
