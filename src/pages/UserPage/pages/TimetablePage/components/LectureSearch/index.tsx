import { getDownloadURL, ref } from 'firebase/storage';
import { fold } from 'fp-ts/lib/Either';
import { identity, pipe } from 'fp-ts/lib/function';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Loading, Modal } from '../../../../../../components';
import LectureDetail, {
  AddButtonMode,
} from '../../../../../../components/LectureDetail';
import { storage } from '../../../../../../firebase';
import {
  MasterLecture,
  Semester,
  Time,
  UserLecture,
  Weekday,
} from '../../../../../../types';
import { masterLectureCodec } from '../../../../../../types/lecture';
import { isOverlap } from '../../../../../../utils/time';
import { createWorker } from '../../../../../../utils/worker';
import { TimetableContext } from '../../contexts';
import { LecturesFilter } from './LecturesFilter';
import { LecturesResult } from './LecturesResult';
import filterWorker from './filterWorker.js';
import styles from './index.module.scss';

interface LectureSearchProps {
  semester: Semester;
  timetableLectures?: UserLecture[];
  editable?: boolean;
  isEditing?: boolean;
  onClickAddLecture?: (lecture: MasterLecture) => void;
  onChangePreviewLecture?: (lecture?: MasterLecture) => void;
}

const getAddButtonMode = ({
  editable,
  isEditing,
  selectedLecture,
  timetableLectures,
  filledTimes,
}: {
  editable: boolean;
  isEditing: boolean;
  selectedLecture: MasterLecture;
  timetableLectures: UserLecture[];
  filledTimes: Time[];
}): AddButtonMode => {
  if (!editable) {
    return 'hidden';
  }
  if (isEditing) {
    return 'adding';
  }
  const isAlreadyAdded =
    selectedLecture.identifier != null &&
    timetableLectures.findIndex(
      (lecture) => lecture.identifier === selectedLecture.identifier
    ) !== -1;
  if (isAlreadyAdded) {
    return 'already-added';
  }
  if (isOverlap(selectedLecture, filledTimes)) {
    return 'overlap';
  }
  return 'available';
};

export type FetchState =
  | { stage: 'loading' }
  | { stage: 'fetched'; lectures: MasterLecture[] }
  | { stage: 'error'; message: string };

const fetchLectures = async (uri: string): Promise<MasterLecture[]> => {
  const gsRef = ref(storage, uri);
  const downloadURL = await getDownloadURL(gsRef);

  const resp = await fetch(downloadURL);
  const res = await resp.json();

  const lectures = res.flatMap((elem: unknown) => {
    const data = pipe(
      masterLectureCodec.decode(elem),
      fold((errors) => {
        console.error(errors);
        return undefined;
      }, identity)
    );
    if (data === undefined) {
      // TODO: report error
      return [];
    }
    return [data];
  });
  return lectures;
};

const useLectures = (semester: Semester): FetchState => {
  const [state, setState] = useState<FetchState>({ stage: 'loading' });

  const url = semester.lecturesUrl;
  useEffect(() => {
    if (url == null) {
      setState({ stage: 'fetched', lectures: [] });
      return;
    }
    let isUnmounted = false;
    const request = async (): Promise<void> => {
      setState({ stage: 'loading' });
      const lectures = await fetchLectures(url);
      if (!isUnmounted) {
        setState({ stage: 'fetched', lectures });
      }
    };
    request();
    return () => {
      isUnmounted = true;
    };
  }, [url]);

  return state;
};

const empty: UserLecture[] = [];

const LectureSearch = ({
  editable = false,
  isEditing = false,
  semester,
  timetableLectures = empty,
  onChangePreviewLecture,
  onClickAddLecture,
}: LectureSearchProps): React.ReactElement => {
  const fetchState = useLectures(semester);

  const [keyword, setKeyword] = useState('');
  const handleChangeKeyword = useCallback((newKeyword: string) => {
    setKeyword(newKeyword);
  }, []);

  const [filterEmptyTimes, setFilterEmptyTimes] = useState(false);
  const handleChangeFilterEmptyTimes = (isOn: boolean): void => {
    setFilterEmptyTimes(isOn);
  };

  const [filterWeekdays, setFilterWeekdays] = useState<Weekday[]>([]);
  const handleChangeFilterWeekdays = (weekdays: Weekday[]): void => {
    setFilterWeekdays(weekdays);
  };

  const filledTimes: Time[] = useMemo(
    () => timetableLectures.flatMap((lecture) => lecture.times),
    [timetableLectures]
  );

  const [isFiltering, setFiltering] = useState(false);
  const [filteredIdentifiers, setFilteredIdentifiers] = useState<string[]>([]);
  useEffect(() => {
    const handleMessage = (event: MessageEvent): void => {
      if (!eqSet(new Set(event.data), new Set(filteredIdentifiers))) {
        setFilteredIdentifiers(event.data);
      }
      setFiltering(false);
    };

    const lectures = fetchState.stage === 'fetched' ? fetchState.lectures : [];

    const worker: Worker = createWorker(filterWorker);
    worker.addEventListener('message', handleMessage);

    setFiltering(true);
    worker.postMessage({
      lectures,
      keyword,
      filledTimes,
      filterEmptyTimes,
      filterWeekdays,
    });

    return (): void => {
      worker.removeEventListener('message', handleMessage);
      worker.terminate();
    };
  }, [
    fetchState,
    keyword,
    filteredIdentifiers,
    filledTimes,
    filterEmptyTimes,
    filterWeekdays,
  ]);
  const filteredLectures = useMemo(
    () =>
      fetchState.stage === 'fetched'
        ? fetchState.lectures.filter(
            (lecture) =>
              lecture.identifier != null &&
              filteredIdentifiers.includes(lecture.identifier)
          )
        : [],
    [fetchState, filteredIdentifiers]
  );

  const handleChangePreviewLecture = useCallback(
    (lecture?: MasterLecture) => {
      onChangePreviewLecture?.(lecture);
    },
    [onChangePreviewLecture]
  );

  const [selectedLecture, setSelectedLecture] = useState<MasterLecture>();
  const handleSelectLecture = useCallback((lecture: MasterLecture) => {
    setSelectedLecture(lecture);
  }, []);
  const handleClickAddButton = (): void => {
    if (onClickAddLecture == null || selectedLecture == null) {
      return;
    }
    onClickAddLecture(selectedLecture);
  };
  const handleCloseModal = (): void => setSelectedLecture(undefined);
  const lectureDetailModal = selectedLecture != null && (
    <Modal onClose={handleCloseModal}>
      <div className={styles.lectureModalWrapper}>
        <LectureDetail
          lecture={{ type: 'master', lecture: selectedLecture }}
          periods={semester.periods}
          addButtonMode={getAddButtonMode({
            editable,
            isEditing,
            selectedLecture,
            timetableLectures,
            filledTimes,
          })}
          onClickAddButton={handleClickAddButton}
        />
      </div>
    </Modal>
  );

  return (
    <div className={styles.container}>
      <div className={styles.searchWrapper}>
        <LecturesFilter
          isSearching={isFiltering}
          keyword={keyword}
          filterEmptyTimes={filterEmptyTimes}
          filterWeekdays={filterWeekdays}
          onChangeFilterKeyword={handleChangeKeyword}
          onChangeFilterEmptyTimes={handleChangeFilterEmptyTimes}
          onChangeFilterWeekdays={handleChangeFilterWeekdays}
        />
      </div>
      <div className={styles.resultWrapper}>
        <LecturesResult
          lectures={filteredLectures}
          periods={semester.periods}
          filledTimes={filledTimes}
          onSelectLecture={handleSelectLecture}
          onChangePreviewLecture={handleChangePreviewLecture}
        />
      </div>
      {lectureDetailModal}
    </div>
  );
};

const ContextAwareLectureSearch = (
  props: Omit<LectureSearchProps, 'semester' | 'timetableLectures'>
): React.ReactElement => {
  const { semester, lectures } = useContext(TimetableContext);
  const timetableLectures = useMemo(
    () => lectures?.map(([, elem]) => elem),
    [lectures]
  );
  return semester != null ? (
    <LectureSearch
      {...props}
      semester={semester}
      timetableLectures={timetableLectures}
    />
  ) : (
    <Loading />
  );
};

export default ContextAwareLectureSearch;

function eqSet<T>(as: Set<T>, bs: Set<T>): boolean {
  return as.size === bs.size && all(isIn(bs), as);
}

function all<T>(pred: (x: T) => boolean, as: Set<T>): boolean {
  return Array.from(as).every(pred);
}

function isIn<T>(as: Set<T>) {
  return (a: T): boolean => as.has(a);
}
