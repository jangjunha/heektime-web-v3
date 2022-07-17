import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { fold } from 'fp-ts/lib/Either';
import { identity, pipe } from 'fp-ts/lib/function';
import { nanoid } from 'nanoid';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Loading } from '../../../../components';
import { db } from '../../../../firebase';
import { School, Semester } from '../../../../types';
import { schoolCodec } from '../../../../types/school';
import { semesterCodec } from '../../../../types/semester';
import Layout from '../../components/Layout';
import { UserContext } from '../../contexts';
import styles from './index.module.scss';

const RECENT_SCHOOL_ID_KEY = 'recent-school-id';

const useSchools = (): [string, School][] | undefined => {
  const [schools, setSchools] = useState<[string, School][]>();
  useEffect(() => {
    async function fetch(): Promise<void> {
      const querySnapshot = await getDocs(collection(db, 'schools'));
      const schools = querySnapshot.docs.map((snapshot): [string, School] => {
        const data = pipe(
          schoolCodec.decode(snapshot.data()),
          fold((errors) => {
            console.error(errors);
            throw new Error('decode error');
          }, identity)
        );
        if (data == null) {
          throw new Error('Cannot decode school');
        }
        return [snapshot.id, data];
      });
      setSchools(schools);
    }
    fetch();
  }, []);
  return schools;
};

const useSemesters = (
  schoolID: string | null
): [string, Semester][] | undefined => {
  const [semesters, setSemesters] = useState<[string, Semester][]>();

  useEffect(() => {
    const fetch = async (): Promise<void> => {
      if (schoolID === null) {
        setSemesters([]);
        return;
      }

      const querySnapshot = await getDocs(
        query(
          collection(db, 'schools', schoolID, 'semesters'),
          where('status', '==', 'normal')
        )
      );
      const semesters = querySnapshot.docs.map(
        (snapshot): [string, Semester] => {
          const data = pipe(
            semesterCodec.decode(snapshot.data()),
            fold((errors) => {
              console.error(errors);
              throw new Error('decode error');
            }, identity)
          );
          if (data == null) {
            throw new Error('Cannot decode semester');
          }
          return [snapshot.id, data];
        }
      );
      setSemesters(semesters);
    };

    setSemesters(undefined);
    fetch();
  }, [schoolID]);

  return semesters;
};

const CreateTimetablePage = (): React.ReactElement => {
  const navigate = useNavigate();
  const [userID] = useContext(UserContext);

  const [timetableID] = useState(nanoid(10));
  const [isLoading, setLoading] = useState(false);
  const [title, setTitle] = useState('');

  const [searchParams, setSearchParams] = useSearchParams({
    school: window.localStorage.getItem(RECENT_SCHOOL_ID_KEY) ?? '',
  });
  const selectedSchoolID = searchParams.get('school') || null;
  const selectedSemesterID = searchParams.get('semester') || null;

  const schools = useSchools();
  const semesters = useSemesters(selectedSchoolID);

  const schoolOptions =
    schools != null &&
    schools
      .sort(([, a], [, b]) => (a.name < b.name ? -1 : 1))
      .map(([id, school]) => (
        <option key={id} value={id}>
          {school.name}
        </option>
      ));

  const semesterOptions = useMemo(
    () =>
      semesters?.reverse().map(([id, semester]) => (
        <option key={id} value={id}>
          {semester.year}학년도 {semester.term}
        </option>
      )),
    [semesters]
  );

  const handleChangeTitle = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setTitle(event.target.value);
  };

  const handleSelectSchool = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const value = event.target.value;
    setSearchParams({ school: value, semester: '' });
    window.localStorage.setItem(RECENT_SCHOOL_ID_KEY, value);
  };

  const handleSelectSemester = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const value = event.target.value;
    setSearchParams({ school: selectedSchoolID ?? '', semester: value });
  };

  const handleClickSubmit = async (): Promise<void> => {
    if (selectedSchoolID == null || selectedSemesterID == null) {
      console.warn('School or Semester is not selected');
      return;
    }
    setLoading(true);
    const semesterRef = doc(
      db,
      'schools',
      selectedSchoolID,
      'semesters',
      selectedSemesterID
    );

    await setDoc(doc(db, 'users', userID, 'timetables', timetableID), {
      title,
      semester: semesterRef,
      visibility: 'public',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    navigate(`../timetable/${timetableID}/`);
  };

  const valid =
    [title, selectedSchoolID, selectedSemesterID].filter((x) => !x).length ===
    0;
  const form = (
    <>
      <div className={styles.timetableID}>{timetableID}</div>
      <div className={styles.formGroup}>
        <input
          type="text"
          placeholder="시간표 이름"
          value={title}
          onChange={handleChangeTitle}
        />

        <select value={selectedSchoolID ?? ''} onChange={handleSelectSchool}>
          <option
            value=""
            disabled={true}
            hidden={true}
            aria-label="학교를 선택하세요"
          >
            👉 학교 선택
          </option>
          {schoolOptions}
        </select>

        <select
          value={selectedSemesterID ?? ''}
          onChange={handleSelectSemester}
        >
          <option
            value=""
            disabled={true}
            hidden={true}
            aria-label="학기를 선택하세요"
          >
            👉 학기 선택
          </option>
          {semesterOptions}
        </select>
      </div>

      <button
        className={styles.add}
        onClick={handleClickSubmit}
        disabled={!valid || isLoading}
      >
        {isLoading ? <Loading inline /> : '만들기'}
      </button>
    </>
  );

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1>새 시간표 만들기</h1>

          {schools === undefined ? <Loading /> : form}
        </div>
      </div>
    </Layout>
  );
};

export default CreateTimetablePage;
