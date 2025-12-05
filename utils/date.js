exports.checkOverlappingSlots=(slots)=> {
  const parseTime = time => {
      const [hour, minute] = time.match(/\d+/g).map(Number);
      const isPM = time.includes('PM');
      return (hour % 12 + (isPM ? 12 : 0)) * 60 + minute; 
  };
  const formattedSlots = slots.map(slot => ({
      start: parseTime(slot.start_time),
      end: parseTime(slot.end_time),
  })).sort((a, b) => a.start - b.start);

  for (let i = 0; i < formattedSlots.length - 1; i++) {
      if (formattedSlots[i].end > formattedSlots[i + 1].start) {
          return true; 
      }
  }

  return false; 
}

exports.normalizeToStandardGMT = (dateString) => {
  if (!dateString) {
    throw new Error("Invalid date string provided");
  }

  // Parse the input date string into a Date object
  const inputDate = new Date(dateString);
  if (isNaN(inputDate)) {
    throw new Error("Invalid date format");
  }
  const hours = inputDate.getHours();
  const minutes = inputDate.getMinutes();
  const epochDate = new Date( Date.UTC(1970, 0, 1,0,0,0,0));
  const timezoneOffset = inputDate.getTimezoneOffset(); // This is in minutes

  epochDate.setMinutes(epochDate.getMinutes() - timezoneOffset);

  epochDate.setHours(hours)
  epochDate.setMinutes(minutes)
  epochDate.setSeconds(0)
  epochDate.setMilliseconds(0)


  return epochDate.toISOString()
};