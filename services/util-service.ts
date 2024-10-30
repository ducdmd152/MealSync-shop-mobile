export type TimeRange = {
  startTime: number;
  endTime: number;
};
const utilService = {
  formatTime: (time: number): string => {
    const hours = Math.floor(time / 100)
      .toString()
      .padStart(2, "0");
    const minutes = (time % 100).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  },
  formatFrameTime: (start: number, end: number): string => {
    return `${utilService.formatTime(start)} - ${utilService.formatTime(end)}`;
  },
  formatDateDdMmYyyy: (dateString: string): string => {
    const date = new Date(dateString.replace(/\//g, "-"));
    return date.toLocaleDateString("en-GB");
  },
  formatDateTimeToYyyyMmDd: (dateTimeString: string): string => {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}/${month}/${day}`;
  },
  shortenName: (fullName: string): string => {
    const nameParts = fullName.trim().split(" ");

    // Return the original name if it has two or fewer parts
    if (nameParts.length <= 2) return fullName;

    // Abbreviate all but the last two parts
    const shortenedParts =
      nameParts
        .slice(0, -2)
        .map((part) => part[0].toUpperCase())
        .join("") + ".";
    const lastTwoParts = nameParts.slice(-2).join(" ");

    return `${shortenedParts} ${lastTwoParts}`;
  },
  convertToTimeFrames: (timeRanges: TimeRange[]): TimeRange[] => {
    const result: TimeRange[] = [];

    const convertToMinutes = (time: number): number => {
      const hours = Math.floor(time / 100);
      const minutes = time % 100;
      return hours * 60 + minutes;
    };

    const convertToHHMM = (minutes: number): number => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return hours * 100 + mins; // Định dạng lại thành hh:mm
    };

    timeRanges.forEach(({ startTime, endTime }) => {
      const startMinutes = convertToMinutes(startTime);
      const endMinutes = convertToMinutes(endTime);

      for (let time = startMinutes; time < endMinutes; time += 30) {
        const nextTime = time + 30;
        if (nextTime <= endMinutes) {
          result.push({
            startTime: convertToHHMM(time),
            endTime: convertToHHMM(nextTime),
          });
        }
      }
    });

    return result;
  },
};

export default utilService;
