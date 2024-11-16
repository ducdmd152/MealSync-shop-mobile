import { FrameDateTime } from "@/types/models/TimeModel";
import dayjs from "dayjs";

export type TimeRange = {
  startTime: number;
  endTime: number;
};
const units = [
  "",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
];
const tens = [
  "",
  "mười",
  "hai mươi",
  "ba mươi",
  "bốn mươi",
  "năm mươi",
  "sáu mươi",
  "bảy mươi",
  "tám mươi",
  "chín mươi",
];
const scales = ["", "nghìn", "triệu", "tỷ"];
const getInFrameTime = (
  startTime: number,
  endTime: number,
  intendedReceiveDate: string
) => {
  const startFrameDate = dayjs(
    dayjs(intendedReceiveDate)
      .local()
      .set("hour", Math.floor(startTime / 100))
      .set("minute", startTime % 100)
      .toDate()
  );
  const endFrameDate = dayjs(
    dayjs(intendedReceiveDate)
      .local()
      .set("hour", Math.floor(endTime / 100))
      .set("minute", endTime % 100)
      .toDate()
  );
  const current = new Date();
  // console.log("current: ", current, startFrameDate, endFrameDate);
  if (current < startFrameDate.toDate()) return -1;
  if (current > endFrameDate.toDate()) return 1;
  return 0;
};
const utilService = {
  getInFrameTime,
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
  formatPrice: (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(value);
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
  getCurrentUTCDate: (): Date => {
    return new Date(new Date().toISOString());
  },
  toUTCDate: (date: Date): Date => {
    return new Date(date.toISOString());
  },
  isCurrentTimeGreaterThanEndTime: (frame: FrameDateTime): boolean => {
    // Current time in UTC
    const currentUTCDate = new Date();
    let [year, month, day] = dayjs(frame.intendedReceiveDate)
      .format("YYYY/MM/DD")
      .split("/");
    let frameEndDateTime = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Math.floor(frame.endTime / 100),
      frame.endTime % 100
    );
    // console.log(
    //   "currentUTCDate > frameEndDateTime ",
    //   currentUTCDate,
    //   frameEndDateTime,
    //   currentUTCDate > frameEndDateTime
    // );
    return currentUTCDate > frameEndDateTime;
  },
  parseFormattedNumber: (formattedValue: string) => {
    return Number(formattedValue.replace(/\./g, ""));
  },

  numberToVietnameseText: (number: number): string => {
    if (number === 0) return "không";
    if (number < 0) return `âm ${utilService.numberToVietnameseText(-number)}`;

    let result = "";
    let scaleIndex = 0;

    while (number > 0) {
      const threeDigits = number % 1000;
      if (threeDigits !== 0) {
        let prefix = utilService.convertThreeDigits(threeDigits);
        if (scaleIndex > 0) {
          prefix += ` ${scales[scaleIndex]}`;
        }
        result = prefix + " " + result;
      }
      number = Math.floor(number / 1000);
      scaleIndex++;
    }
    return result.trim();
  },

  convertThreeDigits: (number: number): string => {
    const units = [
      "",
      "một",
      "hai",
      "ba",
      "bốn",
      "năm",
      "sáu",
      "bảy",
      "tám",
      "chín",
    ];
    const tens = [
      "",
      "",
      "hai mươi",
      "ba mươi",
      "bốn mươi",
      "năm mươi",
      "sáu mươi",
      "bảy mươi",
      "tám mươi",
      "chín mươi",
    ];

    const hundred = Math.floor(number / 100);
    const ten = Math.floor((number % 100) / 10);
    const unit = number % 10;

    let result = "";

    if (hundred > 0) {
      result += `${units[hundred]} trăm `;
    }

    if (ten > 1) {
      result += `${tens[ten]} `;
      if (unit > 0) result += `${units[unit]}`;
    } else if (ten === 1) {
      result += "mười ";
      if (unit > 0) result += `${units[unit]}`;
    } else if (unit > 0) {
      if (hundred > 0) result += "lẻ ";
      result += `${units[unit]}`;
    }

    return result.trim();
  },
  capitalizeFirstChar: (text: string): string => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  },
  hideEmailMiddle: (email: string): string => {
    const [username, domain] = email.split("@");
    const visibleChars = Math.max(username.length - 6, 4);
    const hiddenChars = username.length - visibleChars;

    if (hiddenChars > 0) {
      const hiddenPart = "*".repeat(hiddenChars);
      const visibleUsername = username.slice(0, visibleChars);
      return `${visibleUsername}${hiddenPart}@${domain}`;
    }

    return email; // Nếu không có đủ ký tự để ẩn, trả về email gốc
  },
  getEmailFromToken: (token: string): string | null => {
    try {
      // Tách các phần của token (Header, Payload, Signature)
      const payloadBase64 = token.split(".")[1];

      // Giải mã payload từ Base64Url sang chuỗi JSON
      const payloadJson = atob(
        payloadBase64.replace(/_/g, "/").replace(/-/g, "+")
      );

      // Chuyển chuỗi JSON thành đối tượng
      const payload = JSON.parse(payloadJson);

      // Trả về email nếu có, hoặc null nếu không tìm thấy
      return (
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] || null
      );
    } catch (error) {
      console.error("Lỗi khi giải mã token:", error);
      return null;
    }
  },
  getRoleFromToken: (token: string): number => {
    try {
      // Tách các phần của token (Header, Payload, Signature)
      const payloadBase64 = token.split(".")[1];

      // Giải mã payload từ Base64Url sang chuỗi JSON
      const payloadJson = atob(
        payloadBase64.replace(/_/g, "/").replace(/-/g, "+")
      );

      // Chuyển chuỗi JSON thành đối tượng
      const payload = JSON.parse(payloadJson);

      // Trả về email nếu có, hoặc null nếu không tìm thấy
      return payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid"
      ]
        ? Number(
            payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid"]
          )
        : 0;
    } catch (error) {
      console.error("Lỗi khi giải mã token:", error);
      return 0;
    }
  },
  waitForCondition: async (condition: () => boolean, interval = 100) => {
    console.log("condition: () => boolean:", condition());
    while (!condition()) {
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  },
};

export default utilService;
