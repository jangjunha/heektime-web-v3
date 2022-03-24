import { useContext } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { Loading } from '../../../../components';
import { LoginContext } from '../../../../contexts/login';
import Layout, { styles as layoutStyles } from '../../components/Layout';
import { UserContext } from '../../contexts';
import MasterDetail from './components/MasterDetail';
import Timetable from './components/Timetable';
import { TimetableContext } from './contexts';
import { useLectures, useSemester, useTimetable } from './queries';

const Content = (): React.ReactElement => {
  const location = useLocation();

  const {
    timetable: [, timetable],
    semester,
  } = useContext(TimetableContext);
  const [userID] = useContext(UserContext);

  const [authUser] = useContext(LoginContext);
  const isLoggedInUser = authUser?.uid === userID;

  const breadcrumb = (
    <div className={layoutStyles.breadcrumb}>
      <Link to={location.pathname}>
        {timetable.title || '시간표'}
        &nbsp;&nbsp;
        {semester && (
          <span className={layoutStyles.badge}>
            {semester.year}년 {semester.term}
          </span>
        )}
      </Link>
    </div>
  );

  return (
    <Layout menu={breadcrumb}>
      <MasterDetail master={<Timetable editable={isLoggedInUser} />} />
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
