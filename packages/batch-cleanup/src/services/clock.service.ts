// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function clockServiceBuilder() {
  return {
    getCurrentDate(): Date {
      return new Date();
    },

    roundDateToTheNearestMinute(date: Date, minutes = 1): Date {
      const coeff = 1000 * 60 * minutes;
      return new Date(Math.round(date.getTime() / coeff) * coeff);
    },

    dateToMilliSecs(date: Date): number {
      return date.getTime();
    },

    hoursToMilliSecs(hours: number): number {
      const hour = 1000 * 60 * 60;
      return hours * hour;
    },

    subtractTime(dateInMilliSecs: number, milliSecsAgo: number): Date {
      return new Date(dateInMilliSecs - milliSecsAgo);
    },
  };
}

export type ClockService = ReturnType<typeof clockServiceBuilder>;
