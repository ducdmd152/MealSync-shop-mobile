const utilService = {
  formatTime: (time: number): string => {
    const hours = Math.floor(time / 100)
      .toString()
      .padStart(2, "0");
    const minutes = (time % 100).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
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
};

export default utilService;
