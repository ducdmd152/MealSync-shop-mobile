const utilService = {
  formatTime: (time: number): string => {
    const hours = Math.floor(time / 100)
      .toString()
      .padStart(2, "0");
    const minutes = (time % 100).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  },
  formatDate: (dateString: string): string => {
    const date = new Date(dateString.replace(/\//g, "-"));
    return date.toLocaleDateString("en-GB");
  },
};

export default utilService;
