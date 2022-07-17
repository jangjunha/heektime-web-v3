import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore';
import { useCallback, useContext, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { Loading } from '../../../../components';
import Menu from '../../../../components/Menu';
import Popover from '../../../../components/Popover';
import { LoginContext } from '../../../../contexts/login';
import { db } from '../../../../firebase';
import { MasterLecture, UserLecture } from '../../../../types';
import { userLectureCodec } from '../../../../types/lecture';
import Layout, { styles as layoutStyles } from '../../components/Layout';
import { UserContext } from '../../contexts';
import LectureSearch from './components/LectureSearch';
import MasterDetail from './components/MasterDetail';
import Timetable from './components/Timetable';
import { TimetableContext } from './contexts';
import styles from './index.module.scss';
import { useLectures, useSemester, useTimetable } from './queries';
import { useEditTimetable } from './queries/useTimetable';

const Content = (): React.ReactElement => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    timetable: [timetableID, timetable],
  } = useContext(TimetableContext);
  const [userID] = useContext(UserContext);
  const { changeVisibility, delete_ } = useEditTimetable(userID, timetableID);

  const [authUser] = useContext(LoginContext);
  const isLoggedInUser = authUser?.uid === userID;

  const [isEditing, setEditing] = useState(false);
  const [previewLectures, setPreviewLectures] = useState<MasterLecture[]>([]);

  const handleDeleteLecture = useCallback(
    async (id: string) => {
      setEditing(true);
      await deleteDoc(
        doc(db, 'users', userID, 'timetables', timetableID, 'lectures', id)
      );
      setEditing(false);
    },
    [userID, timetableID]
  );

  const handleAddLecture = useCallback(
    async (master: MasterLecture) => {
      setEditing(true);
      const lecture: UserLecture = {
        ...master,
        createdAt: null,
        updatedAt: null,
      };
      const data = userLectureCodec.encode(lecture);
      await addDoc(
        collection(db, 'users', userID, 'timetables', timetableID, 'lectures'),
        data
      );
      setEditing(false);
    },
    [userID, timetableID]
  );

  const handlePreviewLecture = useCallback((lecture?: MasterLecture) => {
    setPreviewLectures(lecture != null ? [lecture] : []);
  }, []);

  const breadcrumb = (
    <div className={layoutStyles.breadcrumb}>
      <Link to={location.pathname}>
        {timetable.title || '시간표'}
        &nbsp;&nbsp;
        {timetable.visibility === 'public' && (
          <span className={layoutStyles.badge} aria-label="공개">
            🌏
          </span>
        )}
        {timetable.visibility === 'private' && (
          <span className={layoutStyles.badge} aria-label="비공개">
            🔒
          </span>
        )}
      </Link>
    </div>
  );

  const handleClickMenu = async (key: string): Promise<void> => {
    switch (key) {
      case 'change-to-public':
        menuButtonRef.current?.focus();
        await changeVisibility('public');
        break;
      case 'change-to-private':
        menuButtonRef.current?.focus();
        await changeVisibility('private');
        break;
      case 'delete':
        menuButtonRef.current?.focus();
        await delete_();
        navigate(`../../`);
        break;
    }
  };
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menu = (
    <Popover
      menu={
        <Menu
          items={[
            [
              'change-to-public',
              timetable.visibility !== 'public' && <>공개로 전환</>,
            ],
            [
              'change-to-private',
              timetable.visibility !== 'private' && <>비공개로 전환</>,
            ],
            ['delete', <>시간표 삭제</>],
          ]}
          onSelectItem={handleClickMenu}
        />
      }
    >
      <button
        className={styles.menuButton}
        aria-label="메뉴"
        ref={menuButtonRef}
      >
        <i className="material-icons">more_vert</i>
      </button>
    </Popover>
  );

  return (
    <Layout breadcrumb={breadcrumb} menu={menu}>
      <MasterDetail
        master={
          <Timetable
            editable={isLoggedInUser}
            isEditing={isEditing}
            previews={previewLectures}
            onDeleteLecture={handleDeleteLecture}
          />
        }
        detail={
          isLoggedInUser && (
            <LectureSearch
              editable={isLoggedInUser}
              isEditing={isEditing}
              onClickAddLecture={handleAddLecture}
              onChangePreviewLecture={handlePreviewLecture}
            />
          )
        }
      />
    </Layout>
  );
};

const TimetablePage = (): React.ReactElement => {
  const { id } = useParams();
  if (id === undefined) {
    throw new Error('Cannot retrieve timetable id');
  }
  const [userID] = useContext(UserContext);

  const fetchState = useTimetable(userID, id);
  const lecturesFetchState = useLectures(userID, id);
  const semesterFetchState = useSemester(
    fetchState.stage === 'fetched'
      ? fetchState.timetable.semester.path
      : undefined
  );

  switch (fetchState.stage) {
    case 'loading':
      return <Loading />;
    case 'fetched': {
      const semester =
        semesterFetchState.stage === 'fetched'
          ? semesterFetchState.semester
          : undefined;
      const lectures =
        lecturesFetchState.stage === 'fetched'
          ? lecturesFetchState.lectures
          : undefined;
      return (
        <TimetableContext.Provider
          value={{
            timetable: [fetchState.id, fetchState.timetable],
            lectures,
            semester,
          }}
        >
          <Content />
        </TimetableContext.Provider>
      );
    }
    case 'error':
      return <div>{fetchState.message}</div>;
  }
};

export { TimetableContext };
export default TimetablePage;
