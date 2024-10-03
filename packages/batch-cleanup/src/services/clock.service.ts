interface IClockService {
  readonly getCurrentDate: () => Date;
  readonly getPastDate: (currentDate: Date, hoursAgo: number) => Date;
}
export function clockServiceBuilder(): IClockService {
  return {
    getCurrentDate(): Date {
      return new Date();
    },

    getPastDate(currentDate: Date, hoursAgo: number): Date {
      return subtractTime(
        dateToMilliSecs(currentDate),
        hoursToMilliSecs(hoursAgo)
      );
    },
  };
}

export type ClockService = ReturnType<typeof clockServiceBuilder>;

function dateToMilliSecs(date: Date): number {
  return date.getTime();
}

function hoursToMilliSecs(hours: number): number {
  const hour = 1000 * 60 * 60;
  return hours * hour;
}

function subtractTime(dateInMilliSecs: number, milliSecsAgo: number): Date {
  return new Date(dateInMilliSecs - milliSecsAgo);
}
