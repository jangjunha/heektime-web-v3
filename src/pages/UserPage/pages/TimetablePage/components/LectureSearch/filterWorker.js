const worker = function () {
  const caseInsensitiveMatch = (keyword, target) =>
    target.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;

  const overlap = (x1, x2, y1, y2, detectEqual) => {
    if (detectEqual) {
      return x1 <= y2 && y1 <= x2;
    }
    return x1 < y2 && y1 < x2;
  };

  const isOverlap = (lecture, filledTimes) => {
    if (!filledTimes) return false;

    for (let i = 0; i < filledTimes.length; i += 1) {
      if (!lecture.times) continue;

      const t0 = filledTimes[i];

      for (let j = 0; j < lecture.times.length; j += 1) {
        const t1 = lecture.times[j];
        if (
          t0.weekday === t1.weekday &&
          overlap(t0.timeBegin, t0.timeEnd, t1.timeBegin, t1.timeEnd)
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const filterKeyword = (keyword, lecture) =>
    [lecture.identifier, lecture.title, lecture.professor]
      .filter((x) => x != null)
      .reduce(
        (prev, target) => prev || caseInsensitiveMatch(keyword, target),
        false
      );

  const filterEmptyOnly = (isOn, filledTimes, lecture) =>
    !isOn || (lecture.times.length > 0 && !isOverlap(lecture, filledTimes));

  const filterWeekdays = (weekdays, lecture) =>
    !weekdays ||
    weekdays.length === 0 ||
    (lecture.times.length > 0 &&
      lecture.times.reduce(
        (res, time) => res && weekdays.indexOf(time.weekday) !== -1,
        true
      ));
  // const filterWeekdays = (weekdays, lecture) => {
  //   console.log('weekdays', weekdays);
  //   if (!weekdays || weekdays.length === 0) {
  //     return true;
  //   }
  //   for (let j = 0; j < lecture.times.length; j += 1) {
  //     const time = lecture.times[j];
  //     if (weekdays.indexOf(time.weekday) === -1) return false;
  //   }
  //   return true;
  // };

  this.addEventListener('message', (event) => {
    if (event == null || event.data == null) {
      return;
    }

    const lectures = event.data.lectures;
    const keyword = event.data.keyword;
    const filledTimes = event.data.filledTimes;
    const filterEmptyTimes = event.data.filterEmptyTimes;
    const weekdays = event.data.filterWeekdays;

    const filteredIdentifiers = lectures
      .filter((lecture) => filterKeyword(keyword, lecture))
      .filter((lecture) =>
        filterEmptyOnly(filterEmptyTimes, filledTimes, lecture)
      )
      .filter((lecture) => filterWeekdays(weekdays, lecture))
      .map((lecture) => lecture.identifier);

    postMessage(filteredIdentifiers);
  });
};

export default worker;
